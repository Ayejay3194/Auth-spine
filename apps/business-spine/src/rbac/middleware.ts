/**
 * RBAC Middleware for API Routes
 * Enforces role-based access control on all endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin', 
  MANAGER = 'manager',
  STAFF = 'staff',
  READONLY = 'readonly'
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
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
    { resource: 'reports', action: 'read' }
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
    { resource: 'reports', action: 'read' }
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
};

export function hasPermission(role: Role, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  
  return permissions.some(permission => 
    (permission.resource === '*' || permission.resource === resource) &&
    permission.action === action
  );
}

export async function rbacMiddleware(
  request: NextRequest,
  requiredPermission: { resource: string; action: string }
): Promise<NextResponse | null> {
  try {
    // Get token from request
    const token = await getToken({ req: request });
    
    if (!token?.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user with role from database
    const user = await prisma.user.findUnique({
      where: { id: token.userId as string },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check permission
    const hasAccess = hasPermission(
      user.role as Role,
      requiredPermission.resource,
      requiredPermission.action
    );

    if (!hasAccess) {
      // Log unauthorized access attempt
      await prisma.auditLog.create({
        data: {
          eventType: 'UNAUTHORIZED_ACCESS',
          userId: user.id,
          metadata: {
            path: request.nextUrl.pathname,
            method: request.method,
            requiredPermission,
            userRole: user.role
          }
        }
      });

      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user context to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-email', user.email);

    return null; // Continue to next middleware/handler
  } catch (error) {
    console.error('RBAC middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Higher-order function for API routes
export function withRBAC(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  requiredPermission: { resource: string; action: string }
) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await rbacMiddleware(request, requiredPermission);
    
    if (authResult) {
      return authResult;
    }

    return handler(request, context);
  };
}

// Check if approval is required for an action
export function requiresApproval(role: Role, action: string, amount?: number): boolean {
  const approvalRules = {
    [Role.ADMIN]: {
      refund: amount && amount > 1000,
      payroll: true,
      roleChange: true,
      dataExport: true,
      featureFlag: true
    },
    [Role.MANAGER]: {
      refund: amount && amount > 500,
      payroll: false,
      roleChange: false,
      dataExport: true,
      featureFlag: false
    }
  };

  return approvalRules[role]?.[action] || false;
}
