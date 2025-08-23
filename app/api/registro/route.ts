import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use regular client - auth signup will be handled on frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      nombre, 
      email, 
      telefono, 
      ciudad, 
      user_id,  // Will come from frontend after signup
      experienciaVentas,
      anosExperiencia,
      sectoresExperiencia,
      motivacion,
      recibirNoticias 
    } = data

    console.log('📝 Creando perfil de comercial:', { nombre, email, ciudad, user_id })

    if (!user_id) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    // 1. Crear entrada en tabla comercial
    const { data: comercial, error: comercialError } = await supabase
      .from('comercial')
      .insert({
        nombre,
        email,
        telefono,
        ciudad,
        activo: true,
        user_id: user_id,
        created_at: new Date().toISOString()
      })
      .select('id, nombre, email')
      .single()

    if (comercialError) {
      console.error('❌ Error creando comercial:', comercialError)
      return NextResponse.json({ error: comercialError.message }, { status: 400 })
    }

    console.log('✅ Comercial creado:', comercial)

    // 2. Crear entrada en crm_roles
    const { error: roleError } = await supabase
      .from('crm_roles')
      .insert({
        user_id: user_id,
        comercial_id: comercial.id,
        role: 'COMERCIAL',
        activo: true
      })

    if (roleError) {
      console.error('❌ Error creando rol:', roleError)
      // Rollback: eliminar comercial
      await supabase.from('comercial').delete().eq('id', comercial.id)
      return NextResponse.json({ error: roleError.message }, { status: 400 })
    }

    console.log('✅ Rol de comercial asignado')

    // 3. Actualizar comercial con información adicional si se proporcionó
    if (experienciaVentas !== undefined || anosExperiencia || sectoresExperiencia || motivacion) {
      const updateData: any = {}
      if (experienciaVentas !== undefined) updateData.experiencia_ventas = experienciaVentas
      if (anosExperiencia) updateData.anos_experiencia = anosExperiencia[0]
      if (sectoresExperiencia) updateData.sectores_experiencia = sectoresExperiencia
      if (motivacion) updateData.motivacion = motivacion
      if (recibirNoticias !== undefined) updateData.recibir_noticias = recibirNoticias

      await supabase
        .from('comercial')
        .update(updateData)
        .eq('id', comercial.id)
    }

    console.log('🎉 Registro completado exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Comercial registrado exitosamente',
      comercial: {
        id: comercial.id,
        nombre: comercial.nombre,
        email: comercial.email
      }
    })

  } catch (error) {
    console.error('💥 Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}