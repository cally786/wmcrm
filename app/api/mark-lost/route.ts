import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { leadId, reason = 'Negociación no exitosa' } = await request.json()
    
    console.log('❌ Marking lead as lost:', { leadId, reason })

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    // Get current lead data
    const { data: lead } = await supabase
      .from('lead')
      .select('*, bars(name)')
      .eq('id', leadId)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Update lead status to PERDIDO
    const { error: updateError } = await supabase
      .from('lead')
      .update({
        etapa: 'PERDIDO',
        nota: `${lead.nota || ''}\n\n❌ Marcado como perdido: ${reason}\nFecha: ${new Date().toISOString()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('❌ Error updating lead:', updateError)
      return NextResponse.json({ error: 'Error updating lead status' }, { status: 500 })
    }

    console.log('✅ Lead marked as lost successfully')

    return NextResponse.json({
      success: true,
      message: `${lead.bars?.name || 'Bar'} marcado como perdido exitosamente`
    })

  } catch (error) {
    console.error('💥 Error marking lead as lost:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}