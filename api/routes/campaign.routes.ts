import { Router, Request, Response } from 'express'
import { Database } from '../../lib/database'
import { UserBFF } from '../../lib/bff/user-bff'
import { requireApiToken, AuthenticatedRequest } from '../middleware/auth.middleware'

const router = Router()

router.use(requireApiToken)

router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const { status, search, limit, offset } = req.query

    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    const campaigns = await userBFF.getCampaigns(context, {
      status: status as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    })

    res.json({ campaigns })
  } catch (error) {
    console.error('Get campaigns error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    const campaign = await userBFF.getCampaign(context, BigInt(req.params.id))

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    res.json({ campaign })
  } catch (error) {
    console.error('Get campaign error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    const campaign = await userBFF.createCampaign(context, req.body)

    res.status(201).json({ campaign })
  } catch (error: any) {
    console.error('Create campaign error:', error)
    if (error.message === 'No active subscription found') {
      return res.status(400).json({ error: error.message })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    const campaign = await userBFF.updateCampaign(context, BigInt(req.params.id), req.body)

    res.json({ campaign })
  } catch (error: any) {
    console.error('Update campaign error:', error)
    if (error.message === 'Campaign not found or access denied') {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    await userBFF.deleteCampaign(context, BigInt(req.params.id))

    res.json({ message: 'Campaign deleted successfully' })
  } catch (error: any) {
    console.error('Delete campaign error:', error)
    if (error.message === 'Campaign not found or access denied') {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
