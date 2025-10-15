import { Request, Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types/session'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest

  if (!authReq.session || !authReq.session.userId || !authReq.session.apiToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest

    if (!authReq.session || !authReq.session.roles) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const hasRole = roles.some(role => authReq.session.roles.includes(role))
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}
