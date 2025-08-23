import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Intentando login:', { email })

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email y contraseña son requeridos' 
      }, { status: 400 })
    }

    // Intentar login con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Error en login:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciales incorrectas' 
      }, { status: 401 })
    }

    if (!data.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se pudo autenticar' 
      }, { status: 401 })
    }

    console.log('✅ Login exitoso:', { 
      user_id: data.user.id, 
      email: data.user.email 
    })

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    })

  } catch (error) {
    console.error('💥 Error en login:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}