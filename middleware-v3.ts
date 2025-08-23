import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define protected routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isComercialRoute = pathname.startsWith('/comercial')
  const isProtectedRoute = isAdminRoute || isComercialRoute
  
  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }
  
  // For protected routes, we need a more sophisticated approach
  // Since Supabase uses localStorage, we'll create a verification endpoint
  // and check authentication server-side
  
  try {
    // Create Supabase client for server-side verification
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Try to get the authorization header or check for session tokens
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth token found, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verify the token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Token is valid, allow access
    return NextResponse.next()
    
  } catch (error) {
    // Error in verification, redirect to login for safety
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/comercial/:path*',
  ],
}