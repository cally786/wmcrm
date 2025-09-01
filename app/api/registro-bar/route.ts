import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      nombreBar,
      nit,
      contactoNombre,
      contactoTelefono,
      contactoEmail,
      direccion,
      ciudad,
      barrio,
      coordenadas,
      metodo,
      fechaEvento,
      tipoEvento,
      aforoEstimado,
      documentos = []
    } = data

    console.log('📝 Registrando nuevo bar:', { nombreBar, ciudad, metodo })

    // Get Authorization header from request
    const authHeader = request.headers.get('authorization')
    let comercialId = null
    
    console.log('🔍 Auth header present:', !!authHeader)
    
    if (authHeader) {
      try {
        // Create a new supabase client with the user's session
        const token = authHeader.replace('Bearer ', '')
        const supabaseWithAuth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: authHeader,
              },
            },
          }
        )
        
        const { data: { user }, error } = await supabaseWithAuth.auth.getUser()
        
        if (user && !error) {
          console.log('✅ Found authenticated user:', { userId: user.id, email: user.email })
          
          // Find comercial by user_id in crm_roles
          const { data: roleData } = await supabase
            .from('crm_roles')
            .select('comercial_id')
            .eq('user_id', user.id)
            .eq('activo', true)
            .single()

          comercialId = roleData?.comercial_id
          console.log('🔍 Role data found:', { roleData, comercialId })
          
          if (!comercialId) {
            // Try to find comercial by email
            const { data: comercialData } = await supabase
              .from('comercial')
              .select('id')
              .eq('email', user.email)
              .single()
            
            comercialId = comercialData?.id
            console.log('🔍 Comercial by email:', { comercialData, comercialId })
          }
        } else {
          console.log('⚠️ Auth error or no user:', error)
        }
      } catch (authError) {
        console.error('❌ Error getting user from token:', authError)
      }
    } else {
      console.log('⚠️ No authorization header found')
    }
    
    if (!comercialId) {
      console.error('❌ No comercial found for bar registration')
      return NextResponse.json({ error: 'Comercial no encontrado' }, { status: 400 })
    }

    console.log('✅ Using comercial:', comercialId)

    // Validate NIT doesn't already exist (check base numbers only)
    if (nit) {
      const baseNit = nit.split('-')[0].trim()
      
      const { data: existingBars, error: nitCheckError } = await supabase
        .from('bars')
        .select('id, name, contacto_nombre, nit')
        .not('nit', 'is', null)

      if (nitCheckError) {
        console.error('❌ Error checking NITs:', nitCheckError)
        return NextResponse.json({ error: 'Error verificando NIT' }, { status: 400 })
      }

      // Find matching base NIT
      const matchingBar = existingBars?.find(bar => {
        if (!bar.nit) return false
        const existingBaseNit = bar.nit.split('-')[0].trim()
        return existingBaseNit === baseNit
      })

      if (matchingBar) {
        console.log('❌ Base NIT already exists:', { inputNit: nit, baseNit, existingNit: matchingBar.nit, barName: matchingBar.name })
        return NextResponse.json({ 
          error: `El NIT base ${baseNit} ya está registrado en la plataforma para el bar "${matchingBar.name}" (NIT completo: ${matchingBar.nit}). ${matchingBar.contacto_nombre ? `Contacto: ${matchingBar.contacto_nombre}.` : ''} Si crees que esto es un error, contacta al soporte.`,
          errorType: 'DUPLICATE_NIT'
        }, { status: 400 })
      }
    }

    // 1. Create the bar
    const barData = {
      name: nombreBar,
      nit: nit,
      address: `${direccion}${barrio ? `, ${barrio}` : ''}`,
      ciudad: ciudad,
      capacidad_oficial: aforoEstimado ? parseInt(aforoEstimado) : null,
      contacto_nombre: contactoNombre,
      contacto_telefono: contactoTelefono,
      contacto_email: contactoEmail || null,
      phone: contactoTelefono,
      account_status: 'pending_verification',
      description: `Bar registrado desde formulario frontend. Método: ${metodo === 'evento' ? 'Con Evento' : 'Estándar'}.`,
      created_at: new Date().toISOString()
    }

    const { data: newBar, error: barError } = await supabase
      .from('bars')
      .insert(barData)
      .select('id, name')
      .single()

    if (barError) {
      console.error('❌ Error creating bar:', barError)
      return NextResponse.json({ error: 'Error creando bar: ' + barError.message }, { status: 400 })
    }

    console.log('✅ Bar created:', newBar)

    // 2. Create the lead associated with the bar
    const leadData = {
      bar_id: newBar.id,
      source: 'WEBFORM',
      nombre_contacto: contactoNombre,
      email_contacto: contactoEmail || null,
      telefono_contacto: contactoTelefono,
      ciudad: ciudad,
      nota: `Bar registrado desde formulario frontend. ${metodo === 'evento' ? `Evento: ${tipoEvento || 'Sin especificar'}, Aforo: ${aforoEstimado || 'Sin especificar'}` : 'Método estándar'}.`,
      owner_id: comercialId,
      etapa: metodo === 'evento' && fechaEvento ? 'DEMO_PROG' : 'PROSPECTO',
      score: metodo === 'evento' && fechaEvento ? 85 : 75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newLead, error: leadError } = await supabase
      .from('lead')
      .insert(leadData)
      .select('id, etapa')
      .single()

    if (leadError) {
      console.error('❌ Error creating lead:', leadError)
      // Rollback: delete bar
      await supabase.from('bars').delete().eq('id', newBar.id)
      return NextResponse.json({ error: 'Error creando lead: ' + leadError.message }, { status: 400 })
    }

    console.log('✅ Lead created:', newLead)

    // 3. Create event if metodo is 'evento' and fechaEvento is provided
    let newEvent = null
    if (metodo === 'evento' && fechaEvento) {
      const eventData = {
        bar_id: newBar.id,
        comercial_id: comercialId,
        titulo: `${tipoEvento || 'Evento'} - ${nombreBar}`,
        fecha: new Date(fechaEvento).toISOString(),
        capacidad_meta: aforoEstimado ? parseInt(aforoEstimado) : null,
        estado: 'PROGRAMADO',
        created_at: new Date().toISOString()
      }

      const { data: eventResult, error: eventError } = await supabase
        .from('evento')
        .insert(eventData)
        .select('id, titulo, fecha')
        .single()

      if (eventError) {
        console.warn('⚠️ Error creating event (but bar and lead were created):', eventError)
      } else {
        newEvent = eventResult
        console.log('✅ Event created:', newEvent)
      }
    }

    console.log('🎉 Bar registration completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Bar registrado exitosamente',
      data: {
        bar: newBar,
        lead: newLead,
        event: newEvent
      }
    })

  } catch (error) {
    console.error('💥 Error in bar registration:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}