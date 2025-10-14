import { Database } from '../database'

export interface Campaign {
  id: bigint
  subscription_id: bigint
  user_id: bigint | null
  organization_id: bigint | null
  name: string
  status: string
  send_date: Date | null
  created_at: Date
  updated_at: Date
}

export interface CampaignContent {
  id: bigint
  campaign_id: bigint
  subject: string | null
  body_html: string | null
  body_text: string | null
  template_code: string | null
  created_at: Date
  updated_at: Date
}

export interface CampaignMetrics {
  id: bigint
  campaign_id: bigint
  total_sent: number
  total_opened: number
  total_clicked: number
  total_bounced: number
  total_unsubscribed: number
  calculated_at: Date
}

export interface CampaignWithDetails extends Campaign {
  content: CampaignContent[]
  metrics: CampaignMetrics[]
  subscription: {
    id: bigint
    plan: {
      id: bigint
      name: string
    }
  }
}

export interface CreateCampaignData {
  subscription_id: bigint
  user_id?: bigint
  organization_id?: bigint
  name: string
  status?: string
  send_date?: Date
  content?: {
    subject?: string
    body_html?: string
    body_text?: string
    template_code?: string
  }
}

export interface UpdateCampaignData {
  name?: string
  status?: string
  send_date?: Date
  content?: {
    subject?: string
    body_html?: string
    body_text?: string
    template_code?: string
  }
}

export interface CampaignFilters {
  user_id?: bigint
  organization_id?: bigint
  status?: string
  search?: string
  limit?: number
  offset?: number
}

export class CampaignRepository {
  constructor(private db: Database) {}

  async findById(id: bigint): Promise<CampaignWithDetails | null> {
    const result = await this.db.query<CampaignWithDetails>(`
      SELECT 
        c.id,
        c.subscription_id,
        c.user_id,
        c.organization_id,
        c.name,
        c.status,
        c.send_date,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', cc.id,
              'campaign_id', cc.campaign_id,
              'subject', cc.subject,
              'body_html', cc.body_html,
              'body_text', cc.body_text,
              'template_code', cc.template_code,
              'created_at', cc.created_at,
              'updated_at', cc.updated_at
            )
          ) FILTER (WHERE cc.id IS NOT NULL),
          '[]'::json
        ) as content,
        COALESCE(
          json_agg(
            json_build_object(
              'id', cm.id,
              'campaign_id', cm.campaign_id,
              'total_sent', cm.total_sent,
              'total_opened', cm.total_opened,
              'total_clicked', cm.total_clicked,
              'total_bounced', cm.total_bounced,
              'total_unsubscribed', cm.total_unsubscribed,
              'calculated_at', cm.calculated_at
            )
          ) FILTER (WHERE cm.id IS NOT NULL),
          '[]'::json
        ) as metrics,
        json_build_object(
          'id', s.id,
          'plan', json_build_object(
            'id', p.id,
            'name', p.name
          )
        ) as subscription
      FROM campaigns c
      LEFT JOIN campaign_content cc ON c.id = cc.campaign_id
      LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
      LEFT JOIN subscriptions s ON c.subscription_id = s.id
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE c.id = $1
      GROUP BY c.id, c.subscription_id, c.user_id, c.organization_id, c.name, c.status, c.send_date, c.created_at, c.updated_at, s.id, p.id, p.name
    `, [id])

    return result.rows[0] || null
  }

  async findAll(filters: CampaignFilters = {}): Promise<CampaignWithDetails[]> {
    let query = `
      SELECT 
        c.id,
        c.subscription_id,
        c.user_id,
        c.organization_id,
        c.name,
        c.status,
        c.send_date,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', cc.id,
              'campaign_id', cc.campaign_id,
              'subject', cc.subject,
              'body_html', cc.body_html,
              'body_text', cc.body_text,
              'template_code', cc.template_code,
              'created_at', cc.created_at,
              'updated_at', cc.updated_at
            )
          ) FILTER (WHERE cc.id IS NOT NULL),
          '[]'::json
        ) as content,
        COALESCE(
          json_agg(
            json_build_object(
              'id', cm.id,
              'campaign_id', cm.campaign_id,
              'total_sent', cm.total_sent,
              'total_opened', cm.total_opened,
              'total_clicked', cm.total_clicked,
              'total_bounced', cm.total_bounced,
              'total_unsubscribed', cm.total_unsubscribed,
              'calculated_at', cm.calculated_at
            )
          ) FILTER (WHERE cm.id IS NOT NULL),
          '[]'::json
        ) as metrics,
        json_build_object(
          'id', s.id,
          'plan', json_build_object(
            'id', p.id,
            'name', p.name
          )
        ) as subscription
      FROM campaigns c
      LEFT JOIN campaign_content cc ON c.id = cc.campaign_id
      LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
      LEFT JOIN subscriptions s ON c.subscription_id = s.id
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0

    if (filters.user_id !== undefined) {
      paramCount++
      query += ` AND c.user_id = $${paramCount}`
      params.push(filters.user_id)
    }

    if (filters.organization_id !== undefined) {
      paramCount++
      query += ` AND c.organization_id = $${paramCount}`
      params.push(filters.organization_id)
    }

    if (filters.status) {
      paramCount++
      query += ` AND c.status = $${paramCount}`
      params.push(filters.status)
    }

    if (filters.search) {
      paramCount++
      query += ` AND c.name ILIKE $${paramCount}`
      params.push(`%${filters.search}%`)
    }

    query += `
      GROUP BY c.id, c.subscription_id, c.user_id, c.organization_id, c.name, c.status, c.send_date, c.created_at, c.updated_at, s.id, p.id, p.name
      ORDER BY c.created_at DESC
    `

    if (filters.limit) {
      paramCount++
      query += ` LIMIT $${paramCount}`
      params.push(filters.limit)
    }

    if (filters.offset) {
      paramCount++
      query += ` OFFSET $${paramCount}`
      params.push(filters.offset)
    }

    const result = await this.db.query<CampaignWithDetails>(query, params)
    return result.rows
  }

  async create(data: CreateCampaignData): Promise<CampaignWithDetails> {
    return await this.db.transaction(async (db) => {
      // Create campaign
      const campaignResult = await db.query<Campaign>(`
        INSERT INTO campaigns (subscription_id, user_id, organization_id, name, status, send_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        data.subscription_id,
        data.user_id || null,
        data.organization_id || null,
        data.name,
        data.status || 'DRAFT',
        data.send_date || null
      ])

      const campaign = campaignResult.rows[0]

      // Create content if provided
      if (data.content) {
        await db.query(`
          INSERT INTO campaign_content (campaign_id, subject, body_html, body_text, template_code)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          campaign.id,
          data.content.subject || null,
          data.content.body_html || null,
          data.content.body_text || null,
          data.content.template_code || null
        ])
      }

      // Return campaign with details
      const result = await db.query<CampaignWithDetails>(`
        SELECT 
          c.id,
          c.subscription_id,
          c.user_id,
          c.organization_id,
          c.name,
          c.status,
          c.send_date,
          c.created_at,
          c.updated_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', cc.id,
                'campaign_id', cc.campaign_id,
                'subject', cc.subject,
                'body_html', cc.body_html,
                'body_text', cc.body_text,
                'template_code', cc.template_code,
                'created_at', cc.created_at,
                'updated_at', cc.updated_at
              )
            ) FILTER (WHERE cc.id IS NOT NULL),
            '[]'::json
          ) as content,
          COALESCE(
            json_agg(
              json_build_object(
                'id', cm.id,
                'campaign_id', cm.campaign_id,
                'total_sent', cm.total_sent,
                'total_opened', cm.total_opened,
                'total_clicked', cm.total_clicked,
                'total_bounced', cm.total_bounced,
                'total_unsubscribed', cm.total_unsubscribed,
                'calculated_at', cm.calculated_at
              )
            ) FILTER (WHERE cm.id IS NOT NULL),
            '[]'::json
          ) as metrics,
          json_build_object(
            'id', s.id,
            'plan', json_build_object(
              'id', p.id,
              'name', p.name
            )
          ) as subscription
        FROM campaigns c
        LEFT JOIN campaign_content cc ON c.id = cc.campaign_id
        LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
        LEFT JOIN subscriptions s ON c.subscription_id = s.id
        LEFT JOIN plans p ON s.plan_id = p.id
        WHERE c.id = $1
        GROUP BY c.id, c.subscription_id, c.user_id, c.organization_id, c.name, c.status, c.send_date, c.created_at, c.updated_at, s.id, p.id, p.name
      `, [campaign.id])

      return result.rows[0]
    })
  }

  async update(id: bigint, data: UpdateCampaignData): Promise<CampaignWithDetails | null> {
    return await this.db.transaction(async (db) => {
      const fields: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (data.name !== undefined) {
        fields.push(`name = $${paramCount}`)
        values.push(data.name)
        paramCount++
      }

      if (data.status !== undefined) {
        fields.push(`status = $${paramCount}`)
        values.push(data.status)
        paramCount++
      }

      if (data.send_date !== undefined) {
        fields.push(`send_date = $${paramCount}`)
        values.push(data.send_date)
        paramCount++
      }

      if (fields.length === 0 && !data.content) {
        return this.findById(id)
      }

      if (fields.length > 0) {
        fields.push(`updated_at = CURRENT_TIMESTAMP`)
        values.push(id)

        await db.query(`
          UPDATE campaigns 
          SET ${fields.join(', ')}
          WHERE id = $${paramCount}
        `, values)
      }

      // Update content if provided
      if (data.content) {
        await db.query(`
          UPDATE campaign_content 
          SET 
            subject = COALESCE($2, subject),
            body_html = COALESCE($3, body_html),
            body_text = COALESCE($4, body_text),
            template_code = COALESCE($5, template_code),
            updated_at = CURRENT_TIMESTAMP
          WHERE campaign_id = $1
        `, [
          id,
          data.content.subject,
          data.content.body_html,
          data.content.body_text,
          data.content.template_code
        ])
      }

      // Return updated campaign with details
      const result = await db.query<CampaignWithDetails>(`
        SELECT 
          c.id,
          c.subscription_id,
          c.user_id,
          c.organization_id,
          c.name,
          c.status,
          c.send_date,
          c.created_at,
          c.updated_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', cc.id,
                'campaign_id', cc.campaign_id,
                'subject', cc.subject,
                'body_html', cc.body_html,
                'body_text', cc.body_text,
                'template_code', cc.template_code,
                'created_at', cc.created_at,
                'updated_at', cc.updated_at
              )
            ) FILTER (WHERE cc.id IS NOT NULL),
            '[]'::json
          ) as content,
          COALESCE(
            json_agg(
              json_build_object(
                'id', cm.id,
                'campaign_id', cm.campaign_id,
                'total_sent', cm.total_sent,
                'total_opened', cm.total_opened,
                'total_clicked', cm.total_clicked,
                'total_bounced', cm.total_bounced,
                'total_unsubscribed', cm.total_unsubscribed,
                'calculated_at', cm.calculated_at
              )
            ) FILTER (WHERE cm.id IS NOT NULL),
            '[]'::json
          ) as metrics,
          json_build_object(
            'id', s.id,
            'plan', json_build_object(
              'id', p.id,
              'name', p.name
            )
          ) as subscription
        FROM campaigns c
        LEFT JOIN campaign_content cc ON c.id = cc.campaign_id
        LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
        LEFT JOIN subscriptions s ON c.subscription_id = s.id
        LEFT JOIN plans p ON s.plan_id = p.id
        WHERE c.id = $1
        GROUP BY c.id, c.subscription_id, c.user_id, c.organization_id, c.name, c.status, c.send_date, c.created_at, c.updated_at, s.id, p.id, p.name
      `, [id])

      return result.rows[0] || null
    })
  }

  async delete(id: bigint): Promise<boolean> {
    return await this.db.transaction(async (db) => {
      // Delete campaign content
      await db.query(`
        DELETE FROM campaign_content WHERE campaign_id = $1
      `, [id])

      // Delete campaign metrics
      await db.query(`
        DELETE FROM campaign_metrics WHERE campaign_id = $1
      `, [id])

      // Delete campaign recipients
      await db.query(`
        DELETE FROM campaign_recipients WHERE campaign_id = $1
      `, [id])

      // Delete campaign
      const result = await db.query(`
        DELETE FROM campaigns WHERE id = $1
      `, [id])

      return result.rowCount > 0
    })
  }

  async updateMetrics(campaignId: bigint, metrics: Partial<CampaignMetrics>): Promise<void> {
    await this.db.query(`
      INSERT INTO campaign_metrics (campaign_id, total_sent, total_opened, total_clicked, total_bounced, total_unsubscribed)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (campaign_id) DO UPDATE SET
        total_sent = EXCLUDED.total_sent,
        total_opened = EXCLUDED.total_opened,
        total_clicked = EXCLUDED.total_clicked,
        total_bounced = EXCLUDED.total_bounced,
        total_unsubscribed = EXCLUDED.total_unsubscribed,
        calculated_at = CURRENT_TIMESTAMP
    `, [
      campaignId,
      metrics.total_sent || 0,
      metrics.total_opened || 0,
      metrics.total_clicked || 0,
      metrics.total_bounced || 0,
      metrics.total_unsubscribed || 0
    ])
  }

  async count(filters: CampaignFilters = {}): Promise<number> {
    let query = `
      SELECT COUNT(*) as count
      FROM campaigns c
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0

    if (filters.user_id !== undefined) {
      paramCount++
      query += ` AND c.user_id = $${paramCount}`
      params.push(filters.user_id)
    }

    if (filters.organization_id !== undefined) {
      paramCount++
      query += ` AND c.organization_id = $${paramCount}`
      params.push(filters.organization_id)
    }

    if (filters.status) {
      paramCount++
      query += ` AND c.status = $${paramCount}`
      params.push(filters.status)
    }

    if (filters.search) {
      paramCount++
      query += ` AND c.name ILIKE $${paramCount}`
      params.push(`%${filters.search}%`)
    }

    const result = await this.db.query<{ count: string }>(query, params)
    return parseInt(result.rows[0].count)
  }

  async getStats(userId?: bigint, organizationId?: bigint): Promise<{
    total: number
    sent: number
    draft: number
    scheduled: number
  }> {
    let query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'SENT') as sent,
        COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
        COUNT(*) FILTER (WHERE status = 'SCHEDULED') as scheduled
      FROM campaigns c
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0

    if (userId !== undefined) {
      paramCount++
      query += ` AND c.user_id = $${paramCount}`
      params.push(userId)
    }

    if (organizationId !== undefined) {
      paramCount++
      query += ` AND c.organization_id = $${paramCount}`
      params.push(organizationId)
    }

    const result = await this.db.query<{
      total: string
      sent: string
      draft: string
      scheduled: string
    }>(query, params)

    const row = result.rows[0]
    return {
      total: parseInt(row.total),
      sent: parseInt(row.sent),
      draft: parseInt(row.draft),
      scheduled: parseInt(row.scheduled)
    }
  }
}

