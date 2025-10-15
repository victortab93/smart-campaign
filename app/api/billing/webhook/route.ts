import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/payments/paypal'
import { Database } from '@/lib/database'

export async function POST(req: NextRequest) {
  const transmissionId = req.headers.get('paypal-transmission-id') || ''
  const transmissionTime = req.headers.get('paypal-transmission-time') || ''
  const certUrl = req.headers.get('paypal-cert-url') || ''
  const authAlgo = req.headers.get('paypal-auth-algo') || ''
  const transmissionSig = req.headers.get('paypal-transmission-sig') || ''
  const webhookId = process.env.PAYPAL_WEBHOOK_ID || ''

  const body = await req.json()

  const valid = await verifyWebhookSignature({
    authAlgo,
    certUrl,
    transmissionId,
    transmissionSig,
    transmissionTime,
    webhookId,
    webhookEventBody: body
  })

  if (!valid) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  const db = new Database()
  // Idempotency store
  await db.query(
    `INSERT INTO webhook_events (provider, event_id, event_type, payload, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
    ['paypal', body.id, body.event_type, JSON.stringify(body), 'RECEIVED']
  )

  try {
    switch (body.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        // Could capture here if using webhooks-as-source-of-truth
        break
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const capture = body.resource
        const amount = capture.amount?.value
        const currency = capture.amount?.currency_code
        const captureId = capture.id
        // Link to subscription by reference id if you store it in custom_id
        const subscriptionId = capture.supplementary_data?.related_ids?.order_id ? null : null
        if (subscriptionId) {
          await db.query(
            `INSERT INTO invoices (subscription_id, amount, currency, status, payment_provider, payment_reference, issued_at, paid_at)
             VALUES ($1,$2,$3,'PAID','PayPal',$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
            [subscriptionId, amount, currency, captureId]
          )
          await db.query(`UPDATE subscriptions SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [subscriptionId])
        }
        break
      }
    }
    await db.query(`UPDATE webhook_events SET processed_at = CURRENT_TIMESTAMP, status = 'PROCESSED' WHERE provider = 'paypal' AND event_id = $1`, [body.id])
  } catch (err) {
    await db.query(`UPDATE webhook_events SET processed_at = CURRENT_TIMESTAMP, status = 'FAILED' WHERE provider = 'paypal' AND event_id = $1`, [body.id])
  } finally {
    await db.release()
  }

  return NextResponse.json({ ok: true })
}


