import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthError, ErrorCode } from '../../../../../packages/auth/index'
import { generateToken, createAuthResponse } from '../../../../../packages/auth/next'
import { verifyPassword } from '@/src/security/password-migration'
import { prisma } from '@/lib/prisma'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ 
      where: { email: data.email },
      include: { client: true, provider: true }
    })
    
    if (!user || !user.passwordHash) {
      throw new AuthError('Invalid credentials', ErrorCode.AUTH_UNAUTHORIZED)
    }

    const isValid = await verifyPassword(data.password, user.passwordHash)
    if (!isValid) {
      throw new AuthError('Invalid credentials', ErrorCode.AUTH_UNAUTHORIZED)
    }

    const token = await generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    })

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      client: user.client,
      provider: user.provider
    }

    return createAuthResponse({ user: userData }, token)
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

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
