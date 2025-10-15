import express, { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connectPgSimple from 'connect-pg-simple'
import { Pool } from 'pg'
import authRoutes from './routes/auth.routes'
import contactRoutes from './routes/contact.routes'
import campaignRoutes from './routes/campaign.routes'
import dashboardRoutes from './routes/dashboard.routes'
import subscriptionRoutes from './routes/subscription.routes'
import { initializeDatabase } from '../lib/database'

const PgSession = connectPgSimple(session)

const app = express()
const PORT = process.env.BFF_PORT || 3001

const pgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'smartcampaign',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
})

app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
    name: 'bff.sid',
  })
)

initializeDatabase()

app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'bff' })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('BFF Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`BFF server running on port ${PORT}`)
})

export default app
