import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requiredRole = searchParams.get('role') // 'admin' or 'comercial'
    
    // Get current user from Supabase auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Get user role from database
    const { data: roleData, error } = await supabase
      .from('crm_roles')
      .select('role, activo, comercial(nombre)')
      .eq('user_id', user.id)
      .eq('activo', true)
      .single()
    
    if (error || !roleData) {
      console.error('Role verification error:', error)
      return NextResponse.json({ error: 'Role not found' }, { status: 403 })
    }
    
    const userRole = roleData.role.toLowerCase()
    const hasAccess = (
      (requiredRole === 'admin' && userRole === 'admin') ||
      (requiredRole === 'comercial' && (userRole === 'comercial' || userRole === 'admin'))
    )
    
    console.log('🔍 Access verification:', {
      userId: user.id,
      userEmail: user.email,
      userRole: roleData.role,
      requiredRole,
      hasAccess
    })
    
    return NextResponse.json({
      hasAccess,
      userRole: roleData.role,
      userName: roleData.comercial?.nombre || user.email,
      requiredRole
    })
    
  } catch (error) {
    console.error('Verify access error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Same logic as GET but accepts JSON body for more complex requests
  return GET(request)
}