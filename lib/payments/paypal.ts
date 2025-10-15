import paypal from '@paypal/checkout-server-sdk'

export function getPayPalEnvironment(): paypal.core.SandboxEnvironment | paypal.core.LiveEnvironment {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const env = process.env.PAYPAL_ENV || 'sandbox'

  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal credentials')
  }

  return env === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

export function getPayPalClient(): paypal.core.PayPalHttpClient {
  const environment = getPayPalEnvironment()
  return new paypal.core.PayPalHttpClient(environment)
}

export async function createOrder(params: {
  amount: string
  currency: string
  referenceId: string
  description?: string
  returnUrl?: string
  cancelUrl?: string
}): Promise<{ id: string; approveUrl?: string }>
{
  const client = getPayPalClient()
  const request = new paypal.orders.OrdersCreateRequest()
  request.headers['PayPal-Request-Id'] = params.referenceId
  request.prefer('return=representation')
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: params.referenceId,
        description: params.description,
        amount: {
          currency_code: params.currency,
          value: params.amount
        }
      }
    ],
    application_context: {
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING'
    }
  })

  const response = await client.execute(request)
  const id: string = (response.result as any).id
  const approveUrl: string | undefined = (response.result as any).links?.find((l: any) => l.rel === 'approve')?.href
  return { id, approveUrl }
}

export async function captureOrder(orderId: string): Promise<any> {
  const client = getPayPalClient()
  const request = new paypal.orders.OrdersCaptureRequest(orderId)
  request.requestBody({})
  const response = await client.execute(request)
  return response.result
}

// Helper to fetch OAuth token (for webhook verification REST call)
async function getAccessToken(): Promise<string> {
  const env = getPayPalEnvironment()
  
  const base = (env as any).baseUrl()
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
  if (!res.ok) {
    throw new Error('Failed to get PayPal access token')
  }
  const data = await res.json()
  return data.access_token
}

export async function verifyWebhookSignature(args: {
  authAlgo: string
  certUrl: string
  transmissionId: string
  transmissionSig: string
  transmissionTime: string
  webhookId: string
  webhookEventBody: any
}): Promise<boolean> {
  const env = getPayPalEnvironment()
  
  const base = (env as any).baseUrl()
  const token = await getAccessToken()
  const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      auth_algo: args.authAlgo,
      cert_url: args.certUrl,
      transmission_id: args.transmissionId,
      transmission_sig: args.transmissionSig,
      transmission_time: args.transmissionTime,
      webhook_id: args.webhookId,
      webhook_event: args.webhookEventBody
    })
  })
  if (!res.ok) {
    return false
  }
  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}


