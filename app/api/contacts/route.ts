import { NextRequest, NextResponse } from 'next/server'
import { Database, initializeDatabase } from '@/lib/database'
import { UserBFF } from '@/lib/bff/user-bff'

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
    organizationId: user.organization_id,
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const tags = searchParams.get('tags')?.split(',') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const db = new Database()
    const userBFF = new UserBFF(db)

    const contacts = await userBFF.getContacts(context, {
      search,
      tags,
      limit,
      offset
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getAuthContext(request)
    if (!context) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    const db = new Database()
    const userBFF = new UserBFF(db)

    const contact = await userBFF.createContact(context, data)

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

