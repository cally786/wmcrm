import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Wompi configuration
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY!
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY!
const WOMPI_EVENTS_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/wompi`

export async function POST(request: NextRequest) {
  console.log('🚀 Payment link API called!')
  
  try {
    const body = await request.json()
    const { leadId, barName, contactEmail, amount = 100000 } = body
    
    console.log('🏦 Payment link request received:', JSON.stringify(body, null, 2))
    console.log('🔍 Parsed data:', { leadId, barName, contactEmail, amount })
    console.log('🔑 Environment check:', {
      hasPublicKey: !!WOMPI_PUBLIC_KEY,
      hasPrivateKey: !!WOMPI_PRIVATE_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    })

    if (!leadId || !barName) {
      console.error('❌ Missing required fields:', { leadId, barName })
      return NextResponse.json({ error: 'leadId and barName are required' }, { status: 400 })
    }

    // Get lead details
    const { data: lead } = await supabase
      .from('lead')
      .select('*, bars(*)')
      .eq('id', leadId)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Create payment link with Wompi
    const paymentData = {
      name: `Suscripción Wingman - ${barName}`,
      description: `Suscripción mensual para ${barName} - Plan Estándar`,
      single_use: false, // Can be used multiple times for monthly payments
      collect_shipping: false,
      currency: 'COP',
      amount_in_cents: amount * 100, // Convert to cents
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/comercial/payment-success?lead=${leadId}`,
      // Add lead ID as custom data to associate with webhooks
      metadata: {
        lead_id: leadId,
        bar_name: barName,
        source: 'wingman_crm'
      },
      // Optional: Add customer info if available
      ...(contactEmail && {
        customer_data: {
          email: contactEmail,
          full_name: lead.nombre_contacto
        }
      })
    }

    console.log('📤 Sending to Wompi:', paymentData)

    const wompiResponse = await fetch('https://sandbox.wompi.co/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    const wompiResult = await wompiResponse.json()
    console.log('📥 Wompi response status:', wompiResponse.status)
    console.log('📥 Wompi response:', JSON.stringify(wompiResult, null, 2))

    if (!wompiResponse.ok) {
      console.error('❌ Wompi error details:', {
        status: wompiResponse.status,
        statusText: wompiResponse.statusText,
        result: wompiResult
      })
      return NextResponse.json({ 
        error: 'Error creating payment link with Wompi', 
        details: wompiResult,
        status: wompiResponse.status
      }, { status: 400 })
    }

    // Construct payment link URL from the ID
    const paymentLink = `https://checkout.wompi.co/l/${wompiResult.data.id}`
    
    // Store payment link info in database
    const { error: updateError } = await supabase
      .from('lead')
      .update({
        nota: `${lead.nota || ''}\n\n🔗 Link de pago generado: ${paymentLink}\n📋 Payment Link ID: ${wompiResult.data.id}\nFecha: ${new Date().toISOString()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('❌ Error updating lead:', updateError)
    }
    
    return NextResponse.json({
      success: true,
      paymentLink: paymentLink,
      paymentId: wompiResult.data.id,
      message: 'Link de pago generado exitosamente'
    })

  } catch (error) {
    console.error('💥 Error creating payment link:', error)
    console.error('💥 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error?.message },
      { status: 500 }
    )
  }
}