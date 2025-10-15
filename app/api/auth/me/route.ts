import { NextRequest, NextResponse } from 'next/server'
import { Database, initializeDatabase } from '@/lib/database'
import { UserBFF } from '@/lib/bff/user-bff'

export const dynamic = 'force-dynamic'

// Initialize database connection
initializeDatabase()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      )
    }

    const db = new Database()
    const userBFF = new UserBFF(db)

    const user = await userBFF.validateToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        organizationId: user.organizationId?.toString(),
        roles: user.roles.map(r => r.code)
      }
    })
  } catch (error) {
    console.error('Auth validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

