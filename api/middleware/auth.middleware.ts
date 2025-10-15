import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Database } from '../../lib/database'
import { UserRepository } from '../../lib/repositories/user.repository'

export interface TokenPayload {
  userId: string
  email: string
  roles: string[]
  organizationId?: string
}

export interface AuthenticatedRequest extends Request {
  auth: {
    userId: bigint
    organizationId?: bigint
    email: string
    roles: string[]
  }
}

export async function requireApiToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)

    let decoded: TokenPayload
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const db = new Database()
    const userRepository = new UserRepository(db)
    const user = await userRepository.findById(BigInt(decoded.userId))

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    const authReq = req as AuthenticatedRequest
    authReq.auth = {
      userId: user.id,
      organizationId: user.organizationId || undefined,
      email: user.email,
      roles: user.roles.map(r => r.code),
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest

    if (!authReq.auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const db = new Database()
    const userRepository = new UserRepository(db)
    const hasPermission = await userRepository.hasPermission(
      authReq.auth.userId,
      permission,
      authReq.auth.organizationId
    )

    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}
