import { Router, Request, Response } from 'express'
import { AuthenticatedRequest } from '../types/session'
import { requireAuth } from '../middleware/auth.middleware'
import { ApiClient } from '../services/api-client'

const router = Router()

router.use(requireAuth)

router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    const subscription = await apiClient.get('/subscriptions')

    res.json(subscription)
  } catch (error: any) {
    console.error('Get subscription error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/plans', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    const plans = await apiClient.get('/subscriptions/plans')

    res.json(plans)
  } catch (error: any) {
    console.error('Get plans error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
