import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { nit } = await request.json()

    if (!nit) {
      return NextResponse.json({ exists: false })
    }

    // Extract base NIT (numbers before the dash)
    const baseNit = nit.split('-')[0].trim()
    
    console.log('🔍 Validating NIT:', { fullNit: nit, baseNit })

    // Check if any existing NIT starts with the same base numbers
    const { data: existingBars, error } = await supabase
      .from('bars')
      .select('id, name, contacto_nombre, nit')
      .not('nit', 'is', null)

    if (error) {
      console.error('❌ Error checking NITs:', error)
      return NextResponse.json({ error: 'Error validating NIT' }, { status: 500 })
    }

    // Find matching base NIT
    const matchingBar = existingBars?.find(bar => {
      if (!bar.nit) return false
      const existingBaseNit = bar.nit.split('-')[0].trim()
      return existingBaseNit === baseNit
    })

    if (matchingBar) {
      console.log('❌ Base NIT exists:', { inputNit: nit, baseNit, matchingNit: matchingBar.nit, barName: matchingBar.name })
      return NextResponse.json({
        exists: true,
        barName: matchingBar.name,
        contacto: matchingBar.contacto_nombre,
        existingNit: matchingBar.nit
      })
    }

    console.log('✅ Base NIT available:', { nit, baseNit })
    return NextResponse.json({ exists: false })

  } catch (error) {
    console.error('💥 Error in NIT validation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}