import { Router, Request, Response } from 'express'
import { AuthenticatedRequest } from '../types/session'
import { requireAuth } from '../middleware/auth.middleware'
import { ApiClient } from '../services/api-client'

const router = Router()

router.use(requireAuth)

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    const stats = await apiClient.get('/dashboard/stats')

    res.json(stats)
  } catch (error: any) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
