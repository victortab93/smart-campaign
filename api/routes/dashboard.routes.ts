import { Router, Request, Response } from 'express'
import { Database } from '../../lib/database'
import { UserBFF } from '../../lib/bff/user-bff'
import { requireApiToken, AuthenticatedRequest } from '../middleware/auth.middleware'

const router = Router()

router.use(requireApiToken)

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    const stats = await userBFF.getDashboardStats(context)

    res.json(stats)
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
