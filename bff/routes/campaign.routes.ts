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

    const { status, search, limit, offset } = req.query

    const campaigns = await apiClient.get('/campaigns', {
      params: { status, search, limit, offset },
    })

    res.json(campaigns)
  } catch (error: any) {
    console.error('Get campaigns error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    const campaign = await apiClient.get(`/campaigns/${req.params.id}`)

    res.json(campaign)
  } catch (error: any) {
    console.error('Get campaign error:', error)
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Campaign not found' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    const campaign = await apiClient.post('/campaigns', req.body)

    res.status(201).json(campaign)
  } catch (error: any) {
    console.error('Create campaign error:', error)
    if (error.response?.status === 400) {
      return res.status(400).json({ error: error.response.data.error || 'Bad request' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    const campaign = await apiClient.put(`/campaigns/${req.params.id}`, req.body)

    res.json(campaign)
  } catch (error: any) {
    console.error('Update campaign error:', error)
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Campaign not found' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    await apiClient.delete(`/campaigns/${req.params.id}`)

    res.json({ message: 'Campaign deleted successfully' })
  } catch (error: any) {
    console.error('Delete campaign error:', error)
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Campaign not found' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
