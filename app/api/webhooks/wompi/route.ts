import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for webhooks
)

// Wompi webhook secrets
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET!
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET!

function verifyWompiSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = createHash('sha256')
      .update(payload + secret)
      .digest('hex')
    
    const receivedSignature = signature.replace('sha256=', '')
    
    return timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    
    console.log('🔔 Wompi Webhook received:', {
      signature: signature ? 'present' : 'missing',
      bodyLength: body.length
    })

    // Verify signature for security
    if (!signature) {
      console.error('❌ Missing signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    if (!verifyWompiSignature(body, signature, WOMPI_EVENTS_SECRET)) {
      console.error('❌ Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('✅ Verified Wompi event:', {
      event: event.event,
      data: event.data ? {
        id: event.data.id,
        status: event.data.status,
        amount_in_cents: event.data.amount_in_cents,
        reference: event.data.reference
      } : null
    })

    // Handle different event types
    switch (event.event) {
      case 'transaction.updated':
        await handleTransactionUpdated(event.data)
        break
      
      case 'payment_link.completed':
        await handlePaymentLinkCompleted(event.data)
        break
      
      case 'payment_link.expired':
        await handlePaymentLinkExpired(event.data)
        break

      default:
        console.log(`📝 Unhandled event type: ${event.event}`)
    }

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('💥 Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleTransactionUpdated(data: any) {
  try {
    console.log('💳 Processing transaction update:', {
      id: data.id,
      status: data.status,
      amount: data.amount_in_cents,
      reference: data.reference
    })

    // Transaction statuses: PENDING, APPROVED, DECLINED, VOIDED, ERROR
    if (data.status === 'APPROVED') {
      await handleApprovedTransaction(data)
    } else if (data.status === 'DECLINED') {
      await handleDeclinedTransaction(data)
    }

  } catch (error) {
    console.error('Error handling transaction update:', error)
  }
}

async function handleApprovedTransaction(data: any) {
  try {
    console.log('✅ Payment approved for transaction:', data.id)
    
    // Get lead ID from metadata
    const leadId = data.metadata?.lead_id
    const barName = data.metadata?.bar_name
    
    if (!leadId) {
      console.error('❌ No lead_id found in transaction metadata')
      return
    }

    console.log('🔍 Processing payment for lead:', { leadId, barName })

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from('lead')
      .select('*, bars(name), comercial!inner(id, nombre)')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      console.error('❌ Lead not found:', leadError)
      return
    }

    // 1. Update lead status to ACTIVO
    const { error: updateError } = await supabase
      .from('lead')
      .update({
        etapa: 'ACTIVO',
        nota: `${lead.nota || ''}\n\n💰 Pago aprobado - Transacción: ${data.id}\nMonto: $${(data.amount_in_cents / 100).toLocaleString()} COP\nFecha: ${new Date().toISOString()}\nEstado: ACTIVO`,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('❌ Error updating lead:', updateError)
      return
    }

    // 2. Create commission record for the comercial
    const commissionAmount = data.amount_in_cents / 100 * 0.15 // 15% commission example
    
    const { error: commissionError } = await supabase
      .from('comision')
      .insert({
        comercial_id: lead.owner_id,
        monto: data.amount_in_cents / 100,
        monto_neto: commissionAmount,
        concepto: `Suscripción ${lead.bars?.name || barName}`,
        estado: 'CAUSADA',
        fecha_causacion: new Date().toISOString(),
        transaccion_id: data.id,
        created_at: new Date().toISOString()
      })

    if (commissionError) {
      console.error('❌ Error creating commission:', commissionError)
      // Don't return, continue with other operations
    } else {
      console.log('✅ Commission created successfully')
    }

    console.log('💰 Payment processing completed successfully for lead:', leadId)
    
  } catch (error) {
    console.error('Error handling approved transaction:', error)
  }
}

async function handleDeclinedTransaction(data: any) {
  try {
    console.log('❌ Payment declined for transaction:', data.id)
    
    // TODO: Find the lead and add note about declined payment
    // Could trigger a notification to the comercial to follow up
    
  } catch (error) {
    console.error('Error handling declined transaction:', error)
  }
}

async function handlePaymentLinkCompleted(data: any) {
  try {
    console.log('🔗 Payment link completed:', data.id)
    // Handle payment link completion logic here
    
  } catch (error) {
    console.error('Error handling payment link completion:', error)
  }
}

async function handlePaymentLinkExpired(data: any) {
  try {
    console.log('⏰ Payment link expired:', data.id)
    // Handle payment link expiration logic here
    
  } catch (error) {
    console.error('Error handling payment link expiration:', error)
  }
}