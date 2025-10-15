import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import contactRoutes from './routes/contact.routes'
import campaignRoutes from './routes/campaign.routes'
import dashboardRoutes from './routes/dashboard.routes'
import subscriptionRoutes from './routes/subscription.routes'
import { initializeDatabase } from '../lib/database'

const app = express()
const PORT = process.env.API_PORT || 3002

app.use(cors({
  origin: process.env.BFF_URL || 'http://localhost:3001',
  credentials: false,
}))

app.use(express.json())

initializeDatabase()

app.use('/contacts', contactRoutes)
app.use('/campaigns', campaignRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/subscriptions', subscriptionRoutes)

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api' })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})

export default app
