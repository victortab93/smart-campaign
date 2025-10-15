import { Request } from 'express'
import { Session, SessionData } from 'express-session'

declare module 'express-session' {
  interface SessionData {
    userId: string
    organizationId?: string
    email: string
    name?: string
    roles: string[]
    apiToken: string
  }
}

export interface AuthenticatedRequest extends Request {
  session: Session & Partial<SessionData>
}
