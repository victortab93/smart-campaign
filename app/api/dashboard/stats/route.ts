import { NextRequest, NextResponse } from 'next/server'
import { Database, initializeDatabase } from '@/lib/database'
import { UserBFF } from '@/lib/bff/user-bff'

export const dynamic = 'force-dynamic'

// Initialize database connection
initializeDatabase()

async function getAuthContext(request: NextRequest): Promise<{ userId: bigint; organizationId?: bigint; roles: string[] } | null> {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return null
  }

  const db = new Database()
  const userBFF = new UserBFF(db)

  const user = await userBFF.validateToken(token)
  if (!user) {
    return null
  }

  return {
    userId: user.id,
    organizationId: user.organizationId,
    roles: user.roles.map(r => r.code)
  }
}

export async function GET(request: NextRequest) {
  try {
    const context = await getAuthContext(request)
    if (!context) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = new Database()
    const userBFF = new UserBFF(db)

    const stats = await userBFF.getDashboardStats(context)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

