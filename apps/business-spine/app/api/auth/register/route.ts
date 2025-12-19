import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthError, ErrorCode, validatePassword } from '@auth-spine/auth'
import { hashPassword, generateToken, createAuthResponse } from '@auth-spine/auth/next'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['owner', 'staff', 'client', 'admin']).optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    // Validate password strength
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password validation failed', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: data.email } 
    })
    
    if (existingUser) {
      throw new AuthError('Email already in use', ErrorCode.AUTH_UNAUTHORIZED)
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: (data.role ?? 'client') as any
      },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        createdAt: true 
      }
    })

    // Generate token
    const token = await generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    })

    return createAuthResponse({ user }, token)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 401 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
