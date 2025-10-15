import { NextRequest, NextResponse } from 'next/server'
import { Database, initializeDatabase } from '@/lib/database'
import { UserBFF } from '@/lib/bff/user-bff'

// Initialize database connection
initializeDatabase()

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const db = new Database()
    const userBFF = new UserBFF(db)

    const result = await userBFF.register(email, password, name)

    // Set HTTP-only cookie with JWT token
    const response = NextResponse.json({
      user: {
        id: result.user.id.toString(),
        email: result.user.email,
        name: result.user.name,
        organizationId: result.user.organizationId?.toString(),
        roles: result.user.roles.map(r => r.code)
      }
    })

    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}