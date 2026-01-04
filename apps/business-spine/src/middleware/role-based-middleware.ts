import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@enterprise/auth'
import { ROLE_PERMISSIONS } from '@/lib/role-based-access'

export async function roleBasedMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/public']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get token from request
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify token
    const payload = await verifyToken(token)
    
    if (!payload.userId || !payload.role) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user's role has access to the requested page
    const rolePerms = ROLE_PERMISSIONS[payload.role as keyof typeof ROLE_PERMISSIONS]
    
    if (!rolePerms) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if the requested path is accessible by this role
    const isAccessible = rolePerms.pages.some(page => pathname.startsWith(page))

    if (!isAccessible && !pathname.startsWith('/dashboard')) {
      // Allow dashboard routing to handle role-specific redirects
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user info to request headers for downstream use
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-role', payload.role)
    response.headers.set('x-user-email', payload.email || '')

    return response
  } catch (error) {
    console.error('Token verification failed:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
