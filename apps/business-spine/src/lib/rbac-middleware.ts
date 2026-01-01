/**
 * Local RBAC Middleware for API Routes
 * Simplified version that works within the business-spine app
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JwtPayload, verifyBearer, SpineJwtClaims, requireAudience, requireScopes, denyIfBanned } from '../../../../packages/auth/src/index'
import { prisma } from '@/lib/prisma'
import { isValidUrl } from '@/suites/shared/utils'

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin', 
  MANAGER = 'manager',
  STAFF = 'staff',
  READONLY = 'readonly'
}

export interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' }
  ],
  [Role.ADMIN]: [
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'bookings', action: 'create' },
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'update' },
    { resource: 'payments', action: 'create' },
    { resource: 'payments', action: 'read' },
    { resource: 'payments', action: 'update' },
    { resource: 'analytics', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'admin', action: 'read' },
    { resource: 'admin', action: 'update' },
    { resource: 'launch-gate', action: 'read' },
    { resource: 'launch-gate', action: 'update' },
    { resource: 'kill-switches', action: 'read' },
    { resource: 'kill-switches', action: 'update' }
  ],
  [Role.MANAGER]: [
    { resource: 'bookings', action: 'create' },
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'update' },
    { resource: 'staff', action: 'read' },
    { resource: 'staff', action: 'update' },
    { resource: 'schedules', action: 'create' },
    { resource: 'schedules', action: 'read' },
    { resource: 'schedules', action: 'update' },
    { resource: 'reports', action: 'read' },
    { resource: 'admin', action: 'read' }
  ],
  [Role.STAFF]: [
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'update' },
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'schedule', action: 'read' }
  ],
  [Role.READONLY]: [
    { resource: 'reports', action: 'read' },
    { resource: 'analytics', action: 'read' }
  ]
}

export function hasPermission(role: Role, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  
  return permissions.some(permission => 
    (permission.resource === '*' || permission.resource === resource) &&
    permission.action === action
  )
}

export async function rbacMiddleware(
  request: NextRequest,
  requiredPermission: { resource: string; action: string },
  multiclientConfig?: {
    clientId?: string
    requiredScopes?: string[]
    issuer?: string
    secret?: string
  }
): Promise<NextResponse | null> {
  try {
    // Get token from request
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : 
                  request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let user: any = null
    let claims: SpineJwtClaims | null = null

    // Try multiclient verification first if config provided
    if (multiclientConfig?.clientId && multiclientConfig?.issuer && multiclientConfig?.secret) {
      try {
        claims = await verifyBearer(authHeader, multiclientConfig.issuer, {
          secret: multiclientConfig.secret,
          publicKey: process.env.JWT_PUBLIC_KEY,
          alg: (process.env.JWT_ALG as 'HS256' | 'RS256') ?? 'HS256'
        })
        
        // Validate audience
        requireAudience(multiclientConfig.clientId)(claims)
        
        // Validate scopes if required
        if (multiclientConfig.requiredScopes) {
          requireScopes(multiclientConfig.requiredScopes)(claims)
        }
        
        // Check risk state
        denyIfBanned()(claims)
        
        // Get user from database for role information
        user = await prisma.user.findUnique({
          where: { id: claims.sub },
          select: { id: true, role: true, email: true }
        })
        
        // Merge multiclient claims with user role
        if (user) {
          user = {
            ...user,
            aud: claims.aud,
            scp: claims.scp,
            risk: claims.risk,
            entitlements: claims.entitlements
          }
        }
      } catch (multiclientError: any) {
        // Fall back to legacy verification if multiclient fails
        console.warn('Multiclient verification failed, falling back to legacy:', multiclientError.message)
      }
    }
    
    // Fallback to legacy JWT verification
    if (!user) {
      const jwtPayload = await verifyToken(token)
      
      // Get user with role from database
      user = await prisma.user.findUnique({
        where: { id: jwtPayload.userId },
        select: { id: true, role: true, email: true }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Check permission (using role from database)
    const hasAccess = hasPermission(
      user.role as Role,
      requiredPermission.resource,
      requiredPermission.action
    )

    if (!hasAccess) {
      // Log unauthorized access attempt
      try {
        await prisma.auditLog.create({
          data: {
            eventType: 'UNAUTHORIZED_ACCESS',
            userId: user.id,
            metadata: {
              path: request.nextUrl.pathname,
              method: request.method,
              requiredPermission,
              userRole: user.role,
              clientId: user.aud,
              scopes: user.scp,
              risk: user.risk
            }
          }
        })
      } catch (auditError) {
        console.error('Failed to log audit entry:', auditError)
      }

      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Add user context to request headers for downstream use
    const response = NextResponse.next()
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-role', user.role)
    response.headers.set('x-user-email', user.email)
    
    // Add multiclient context if available
    if (user.aud) response.headers.set('x-client-id', user.aud)
    if (user.scp) response.headers.set('x-scopes', user.scp.join(','))
    if (user.risk) response.headers.set('x-risk-state', user.risk)

    return null // Continue to next middleware/handler
  } catch (error) {
    console.error('RBAC middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Higher-order function for API routes
export function withRBAC(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  requiredPermission: { resource: string; action: string },
  multiclientConfig?: {
    clientId?: string
    requiredScopes?: string[]
    issuer?: string
    secret?: string
  }
) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await rbacMiddleware(request, requiredPermission, multiclientConfig)
    
    if (authResult) {
      return authResult
    }

    return handler(request, context)
  }
}

// Helper function for multiclient protection
export function withMulticlientRBAC(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  requiredPermission: { resource: string; action: string },
  clientId: string,
  requiredScopes: string[] = [],
  issuer?: string,
  secret?: string
) {
  const resolvedIssuer = issuer ?? process.env.ISSUER
  if (!resolvedIssuer) {
    throw new Error('withMulticlientRBAC requires an issuer or process.env.ISSUER to be set')
  }
  if (!isValidUrl(resolvedIssuer)) {
    throw new Error('withMulticlientRBAC requires ISSUER to be a valid URL')
  }

  const resolvedSecret = secret ?? process.env.JWT_SECRET
  if (!resolvedSecret) {
    throw new Error('withMulticlientRBAC requires a secret or process.env.JWT_SECRET to be set')
  }

  return withRBAC(handler, requiredPermission, {
    clientId,
    requiredScopes,
    issuer: resolvedIssuer,
    secret: resolvedSecret
  })
}
