import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { leadId, barName, eventData } = await request.json()
    
    console.log('📅 Scheduling event for:', { leadId, barName, eventData })

    if (!leadId || !eventData.fecha) {
      return NextResponse.json({ error: 'leadId and fecha are required' }, { status: 400 })
    }

    // Get lead details with bar and comercial info
    const { data: lead } = await supabase
      .from('lead')
      .select('*, bars(id, name), comercial!inner(id)')
      .eq('id', leadId)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    console.log('📋 Lead data:', lead)

    // Create the event
    const newEvent = {
      bar_id: lead.bar_id,
      comercial_id: lead.owner_id,
      titulo: eventData.titulo || `Demo - ${lead.bars?.name || barName}`,
      fecha: eventData.fecha,
      capacidad_meta: eventData.capacidad_meta ? parseInt(eventData.capacidad_meta) : null,
      descripcion: eventData.descripcion || null,
      ubicacion: eventData.ubicacion || lead.bars?.address || null,
      estado: 'PROGRAMADO',
      created_at: new Date().toISOString()
    }

    console.log('🎯 Creating event:', newEvent)

    const { data: createdEvent, error: eventError } = await supabase
      .from('evento')
      .insert(newEvent)
      .select('*')
      .single()

    if (eventError) {
      console.error('❌ Error creating event:', eventError)
      return NextResponse.json({ error: 'Error creating event: ' + eventError.message }, { status: 500 })
    }

    console.log('✅ Event created:', createdEvent)

    // Update lead status to DEMO_PROG
    const { error: leadUpdateError } = await supabase
      .from('lead')
      .update({
        etapa: 'DEMO_PROG',
        nota: `${lead.nota || ''}\n\n📅 Evento programado: ${eventData.titulo}\nFecha: ${new Date(eventData.fecha).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}\nCreado: ${new Date().toISOString()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (leadUpdateError) {
      console.error('❌ Error updating lead status:', leadUpdateError)
      // Don't fail the request since the event was created successfully
    }

    return NextResponse.json({
      success: true,
      event: createdEvent,
      message: 'Evento programado exitosamente'
    })

  } catch (error) {
    console.error('💥 Error scheduling event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}