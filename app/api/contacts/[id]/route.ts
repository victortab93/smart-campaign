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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getAuthContext(request)
    if (!context) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const contactId = BigInt(params.id)

    const db = new Database()
    const userBFF = new UserBFF(db)

    const contact = await userBFF.getContact(context, contactId)

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Get contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getAuthContext(request)
    if (!context) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const contactId = BigInt(params.id)
    const data = await request.json()

    const db = new Database()
    const userBFF = new UserBFF(db)

    const contact = await userBFF.updateContact(context, contactId, data)

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Update contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getAuthContext(request)
    if (!context) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const contactId = BigInt(params.id)

    const db = new Database()
    const userBFF = new UserBFF(db)

    const success = await userBFF.deleteContact(context, contactId)

    if (!success) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Delete contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

