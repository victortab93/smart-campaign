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

    const { search, tags, limit, offset } = req.query

    const contacts = await apiClient.get('/contacts', {
      params: { search, tags, limit, offset },
    })

    res.json(contacts)
  } catch (error: any) {
    console.error('Get contacts error:', error)
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    const contact = await apiClient.get(`/contacts/${req.params.id}`)

    res.json(contact)
  } catch (error: any) {
    console.error('Get contact error:', error)
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Contact not found' })
    }
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    const contact = await apiClient.post('/contacts', req.body)

    res.status(201).json(contact)
  } catch (error: any) {
    console.error('Create contact error:', error)
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

    const contact = await apiClient.put(`/contacts/${req.params.id}`, req.body)

    res.json(contact)
  } catch (error: any) {
    console.error('Update contact error:', error)
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Contact not found' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const apiClient = new ApiClient(authReq.session.apiToken)

    await apiClient.delete(`/contacts/${req.params.id}`)

    res.json({ message: 'Contact deleted successfully' })
  } catch (error: any) {
    console.error('Delete contact error:', error)
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Contact not found' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
