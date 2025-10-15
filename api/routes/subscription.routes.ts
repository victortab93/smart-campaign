import { Router, Request, Response } from 'express'
import { Database } from '../../lib/database'
import { UserBFF } from '../../lib/bff/user-bff'
import { requireApiToken, AuthenticatedRequest } from '../middleware/auth.middleware'

const router = Router()

router.use(requireApiToken)

router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    const subscription = await userBFF.getSubscription(context)

    res.json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/plans', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    const plans = await userBFF.getPlans()

    res.json({ plans })
  } catch (error) {
    console.error('Get plans error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
