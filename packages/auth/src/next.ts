import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JwtPayload, AuthError, ErrorCode } from './index'

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Also check cookies
  const token = request.cookies.get('auth-token')?.value
  return token || null
}

export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  const token = getTokenFromRequest(request)
  
  if (!token) {
    throw new AuthError('No authentication token provided', ErrorCode.AUTH_MISSING_TOKEN)
  }
  
  try {
    return await verifyToken(token)
  } catch (error) {
    throw new AuthError('Invalid authentication token', ErrorCode.AUTH_INVALID_TOKEN)
  }
}

export function createAuthResponse(data: any, token?: string): NextResponse {
  const response = NextResponse.json(data)
  
  if (token) {
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })
  }
  
  return response
}

export function createErrorResponse(error: AuthError, status: number = 401): NextResponse {
  return NextResponse.json(
    { error: error.message, code: error.code },
    { status }
  )
}

export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const user = await requireAuth(request)
      return await handler(request, user, ...args)
    } catch (error) {
      if (error instanceof AuthError) {
        return createErrorResponse(error)
      }
      return createErrorResponse(
        new AuthError('Internal server error', ErrorCode.AUTH_UNAUTHORIZED),
        500
      )
    }
  }
}

export function requireRole(requiredRole: string) {
  return function<T extends any[]>(
    handler: (request: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: NextRequest, user: JwtPayload, ...args: T) => {
      if (user.role !== requiredRole) {
        return createErrorResponse(
          new AuthError('Insufficient permissions', ErrorCode.AUTH_UNAUTHORIZED),
          403
        )
      }
      
      return handler(request, user, ...args)
    })
  }
}

export function requireRoles(roles: string[]) {
  return function<T extends any[]>(
    handler: (request: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: NextRequest, user: JwtPayload, ...args: T) => {
      if (!user.role || !roles.includes(user.role)) {
        return createErrorResponse(
          new AuthError('Insufficient permissions', ErrorCode.AUTH_UNAUTHORIZED),
          403
        )
      }
      
      return handler(request, user, ...args)
    })
  }
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete('auth-token')
  return response
}
