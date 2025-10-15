import { Router, Request, Response } from 'express'
import { Database } from '../../lib/database'
import { UserBFF } from '../../lib/bff/user-bff'
import { requireApiToken, AuthenticatedRequest } from '../middleware/auth.middleware'

const router = Router()

router.use(requireApiToken)

router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const { search, tags, limit, offset } = req.query

    const db = new Database()
    const userBFF = new UserBFF(db)

    const context = {
      userId: authReq.auth.userId,
      organizationId: authReq.auth.organizationId,
      roles: authReq.auth.roles,
    }

    const contacts = await userBFF.getContacts(context, {
      search: search as string,
      tags: tags ? (tags as string).split(',') : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    })

    res.json({ contacts })
  } catch (error) {
    console.error('Get contacts error:', error)
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

    const contact = await userBFF.getContact(context, BigInt(req.params.id))

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    res.json({ contact })
  } catch (error) {
    console.error('Get contact error:', error)
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

    const contact = await userBFF.createContact(context, req.body)

    res.status(201).json({ contact })
  } catch (error) {
    console.error('Create contact error:', error)
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

    const contact = await userBFF.updateContact(context, BigInt(req.params.id), req.body)

    res.json({ contact })
  } catch (error: any) {
    console.error('Update contact error:', error)
    if (error.message === 'Contact not found or access denied') {
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

    await userBFF.deleteContact(context, BigInt(req.params.id))

    res.json({ message: 'Contact deleted successfully' })
  } catch (error: any) {
    console.error('Delete contact error:', error)
    if (error.message === 'Contact not found or access denied') {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
