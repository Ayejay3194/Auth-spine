/**
 * Admin Users API with RBAC enforcement
 * GET: List all users (Admin+)
 * POST: Create user (Admin+)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRBAC } from '../../../../src/lib/rbac-middleware';
import { z } from 'zod';
import { hashPassword } from '@/src/security/password-migration';
import { getActor } from '@/src/core/auth';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['owner', 'admin', 'manager', 'staff', 'readonly']),
  password: z.string().min(8)
});

async function getUsers(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Additional authorization: Only admins can list all users
    if (!['admin', 'owner'].includes(actor.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Cap at 100
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Validate role parameter
    const validRoles = ['owner', 'admin', 'manager', 'staff', 'readonly'];
    const filterRole = role && validRoles.includes(role) ? role as typeof validRoles[number] : undefined;

    const where = {
      ...(filterRole && { role: filterRole }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          isActive: true,
          _count: {
            select: {
              bookings: true,
              payments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

async function createUser(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Additional authorization: Only admins and owners can create users
    if (!['admin', 'owner'].includes(actor.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Restrict role creation based on actor's role
    if (actor.role === 'admin' && validatedData.role === 'owner') {
      return NextResponse.json({ error: 'Admins cannot create owner accounts' }, { status: 403 });
    }

    if (actor.role === 'manager' && !['staff', 'readonly'].includes(validatedData.role)) {
      return NextResponse.json({ error: 'Managers can only create staff or readonly accounts' }, { status: 403 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password using Argon2 (secure cryptographic hashing)
    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        passwordHash: hashedPassword,
        role: validatedData.role as 'owner' | 'admin' | 'manager' | 'staff' | 'readonly'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isActive: true
      }
    });

    // Log user creation
    await prisma.auditLog.create({
      data: {
        eventType: 'USER_CREATED',
        userId: user.id,
        metadata: {
          createdBy: request.headers.get('x-user-id'),
          userEmail: user.email,
          userRole: user.role
        }
      }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export const GET = withRBAC(getUsers, { resource: 'users', action: 'read' });
export const POST = withRBAC(createUser, { resource: 'users', action: 'create' });
