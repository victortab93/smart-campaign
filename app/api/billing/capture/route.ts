import { NextRequest, NextResponse } from 'next/server'
import { captureOrder } from '@/lib/payments/paypal'
import { Database } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const { orderId, subscriptionId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const result = await captureOrder(orderId)

    const status = result.status
    const captureId = result?.purchase_units?.[0]?.payments?.captures?.[0]?.id
    const amount = result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value
    const currency = result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code || 'USD'

    const db = new Database()
    if (status === 'COMPLETED') {
      // upsert invoice and mark paid
      if (subscriptionId) {
        await db.query(
          `INSERT INTO invoices (subscription_id, amount, currency, status, payment_provider, payment_reference, issued_at, paid_at)
           VALUES ($1,$2,$3,'PAID','PayPal',$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
          [subscriptionId, amount, currency, captureId]
        )
        await db.query(`UPDATE subscriptions SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [subscriptionId])
      }
    }
    await db.release()

    return NextResponse.json({ status, captureId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to capture order' }, { status: 500 })
  }
}


