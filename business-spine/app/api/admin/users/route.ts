/**
 * Admin Users API with RBAC enforcement
 * GET: List all users (Admin+)
 * POST: Create user (Admin+)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRBAC } from '@/src/rbac/middleware';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['owner', 'admin', 'manager', 'staff', 'readonly']),
  password: z.string().min(8)
});

async function getUsers(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where = {
      ...(role && { role: role as 'owner' | 'admin' | 'manager' | 'staff' | 'readonly' }),
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
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

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

    // Hash password (you should use bcrypt in production)
    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
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

// Simple password hash (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  // In production, use: await bcrypt.hash(password, 12);
  return `hashed_${password}`;
}

export const GET = withRBAC(getUsers, { resource: 'users', action: 'read' });
export const POST = withRBAC(createUser, { resource: 'users', action: 'create' });
