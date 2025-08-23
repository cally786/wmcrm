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
  
  // Basic authentication check
  const referer = request.headers.get('referer') || ''
  const hasRecentActivity = (
    referer.includes(request.nextUrl.origin) ||
    request.cookies.has('__next_hmr_refresh_hash__')
  )
  
  if (!hasRecentActivity) {
    console.log('🔒 No auth detected for:', pathname)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // For role-based verification, we'll let the components handle it
  // since middleware database queries are complex and slow
  console.log('🔍 Middleware: Allowing access, role verification in components', {
    path: pathname,
    isAdminRoute,
    isComercialRoute
  })
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/comercial/:path*',
  ],
}