import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/payments/paypal'
import { Database, getDatabasePool } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, currency = 'USD', referenceId, description, returnUrl, cancelUrl } = body

    if (!amount || !referenceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = await createOrder({ amount: String(amount), currency, referenceId, description, returnUrl, cancelUrl })

    // Optionally, persist a pending invoice record linked to referenceId
    const db = new Database()
    await db.query(
      `INSERT INTO webhook_events (provider, event_id, event_type, payload, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      ['paypal', order.id, 'ORDER_CREATED', JSON.stringify({ referenceId }), 'RECEIVED']
    )
    await db.release()

    return NextResponse.json({ id: order.id, approveUrl: order.approveUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}


