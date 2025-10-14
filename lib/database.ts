import { Pool, PoolClient } from 'pg'

// Database connection pool
let pool: Pool | null = null

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl?: boolean
  max?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
}

export function createDatabasePool(config: DatabaseConfig): Pool {
  if (pool) {
    return pool
  }

  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl,
    max: config.max || 20,
    idleTimeoutMillis: config.idleTimeoutMillis || 30000,
    connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
  })

  return pool
}

export function getDatabasePool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createDatabasePool first.')
  }
  return pool
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Database query helper
export class Database {
  private client: PoolClient | null = null

  constructor(client?: PoolClient) {
    this.client = client || null
  }

  async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
    const pool = getDatabasePool()
    const client = this.client || pool
    
    try {
      const result = await client.query(text, params)
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0
      }
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  }

  async transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    const pool = getDatabasePool()
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      const db = new Database(client)
      const result = await callback(db)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async release(): Promise<void> {
    if (this.client) {
      this.client.release()
      this.client = null
    }
  }
}

// Initialize database connection
export function initializeDatabase(): void {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'smartcampaign',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true',
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  }

  createDatabasePool(config)
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = new Database()
    await db.query('SELECT 1')
    await db.release()
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

