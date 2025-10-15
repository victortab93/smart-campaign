import { Router, Request, Response } from 'express'
import { Database } from '../../lib/database'
import { AuthService } from '../../lib/services/auth.service'
import { AuthenticatedRequest } from '../types/session'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const db = new Database()
    const authService = new AuthService(db)

    const result = await authService.login({ email, password })

    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const authReq = req as AuthenticatedRequest
    authReq.session.userId = result.user.id.toString()
    authReq.session.organizationId = result.user.organizationId?.toString()
    authReq.session.email = result.user.email
    authReq.session.name = result.user.name || undefined
    authReq.session.roles = result.user.roles.map(r => r.code)
    authReq.session.apiToken = result.token

    res.json({
      user: {
        id: result.user.id.toString(),
        email: result.user.email,
        name: result.user.name,
        organizationId: result.user.organizationId?.toString(),
        roles: result.user.roles.map(r => r.code),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const db = new Database()
    const authService = new AuthService(db)

    const result = await authService.register({ email, password, name })

    const authReq = req as AuthenticatedRequest
    authReq.session.userId = result.user.id.toString()
    authReq.session.organizationId = result.user.organizationId?.toString()
    authReq.session.email = result.user.email
    authReq.session.name = result.user.name || undefined
    authReq.session.roles = result.user.roles.map(r => r.code)
    authReq.session.apiToken = result.token

    res.status(201).json({
      user: {
        id: result.user.id.toString(),
        email: result.user.email,
        name: result.user.name,
        organizationId: result.user.organizationId?.toString(),
        roles: result.user.roles.map(r => r.code),
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error.message === 'User already exists with this email') {
      return res.status(409).json({ error: error.message })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    authReq.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err)
        return res.status(500).json({ error: 'Failed to logout' })
      }
      res.clearCookie('bff.sid')
      res.json({ message: 'Logged out successfully' })
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    res.json({
      user: {
        id: authReq.session.userId,
        email: authReq.session.email,
        name: authReq.session.name,
        organizationId: authReq.session.organizationId,
        roles: authReq.session.roles,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
