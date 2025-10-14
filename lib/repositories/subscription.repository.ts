import { Database } from '../database'

export interface Subscription {
  id: bigint
  user_id: bigint | null
  organization_id: bigint | null
  plan_id: bigint
  status: string
  start_date: Date
  end_date: Date | null
  trial_end_date: Date | null
  auto_renew: boolean
  created_at: Date
  updated_at: Date
}

export interface Plan {
  id: bigint
  code: string
  name: string
  description: string | null
  price_monthly: number
  price_yearly: number | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Feature {
  id: bigint
  code: string
  name: string
  description: string | null
  type: string
  created_at: Date
}

export interface PlanFeature {
  plan_id: bigint
  feature_id: bigint
  value: string
  feature: Feature
}

export interface PlanWithFeatures extends Plan {
  features: PlanFeature[]
}

export interface SubscriptionWithDetails extends Subscription {
  plan: Plan
  features: {
    id: bigint
    code: string
    name: string
    value: string
    is_active: boolean
  }[]
}

export interface CreateSubscriptionData {
  user_id?: bigint
  organization_id?: bigint
  plan_id: bigint
  status?: string
  start_date?: Date
  end_date?: Date
  trial_end_date?: Date
  auto_renew?: boolean
}

export interface UpdateSubscriptionData {
  plan_id?: bigint
  status?: string
  end_date?: Date
  trial_end_date?: Date
  auto_renew?: boolean
}

export class SubscriptionRepository {
  constructor(private db: Database) {}

  async findById(id: bigint): Promise<SubscriptionWithDetails | null> {
    const result = await this.db.query<SubscriptionWithDetails>(`
      SELECT 
        s.id,
        s.user_id,
        s.organization_id,
        s.plan_id,
        s.status,
        s.start_date,
        s.end_date,
        s.trial_end_date,
        s.auto_renew,
        s.created_at,
        s.updated_at,
        json_build_object(
          'id', p.id,
          'code', p.code,
          'name', p.name,
          'description', p.description,
          'price_monthly', p.price_monthly,
          'price_yearly', p.price_yearly,
          'is_active', p.is_active,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        ) as plan,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'code', f.code,
              'name', f.name,
              'value', sfa.value,
              'is_active', sfa.is_active
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) as features
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      LEFT JOIN subscription_feature_access sfa ON s.id = sfa.subscription_id
      LEFT JOIN features f ON sfa.feature_id = f.id
      WHERE s.id = $1
      GROUP BY s.id, s.user_id, s.organization_id, s.plan_id, s.status, s.start_date, s.end_date, s.trial_end_date, s.auto_renew, s.created_at, s.updated_at, p.id, p.code, p.name, p.description, p.price_monthly, p.price_yearly, p.is_active, p.created_at, p.updated_at
    `, [id])

    return result.rows[0] || null
  }

  async findByUserId(userId: bigint): Promise<SubscriptionWithDetails[]> {
    const result = await this.db.query<SubscriptionWithDetails>(`
      SELECT 
        s.id,
        s.user_id,
        s.organization_id,
        s.plan_id,
        s.status,
        s.start_date,
        s.end_date,
        s.trial_end_date,
        s.auto_renew,
        s.created_at,
        s.updated_at,
        json_build_object(
          'id', p.id,
          'code', p.code,
          'name', p.name,
          'description', p.description,
          'price_monthly', p.price_monthly,
          'price_yearly', p.price_yearly,
          'is_active', p.is_active,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        ) as plan,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'code', f.code,
              'name', f.name,
              'value', sfa.value,
              'is_active', sfa.is_active
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) as features
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      LEFT JOIN subscription_feature_access sfa ON s.id = sfa.subscription_id
      LEFT JOIN features f ON sfa.feature_id = f.id
      WHERE s.user_id = $1
      GROUP BY s.id, s.user_id, s.organization_id, s.plan_id, s.status, s.start_date, s.end_date, s.trial_end_date, s.auto_renew, s.created_at, s.updated_at, p.id, p.code, p.name, p.description, p.price_monthly, p.price_yearly, p.is_active, p.created_at, p.updated_at
      ORDER BY s.created_at DESC
    `, [userId])

    return result.rows
  }

  async findByOrganizationId(organizationId: bigint): Promise<SubscriptionWithDetails[]> {
    const result = await this.db.query<SubscriptionWithDetails>(`
      SELECT 
        s.id,
        s.user_id,
        s.organization_id,
        s.plan_id,
        s.status,
        s.start_date,
        s.end_date,
        s.trial_end_date,
        s.auto_renew,
        s.created_at,
        s.updated_at,
        json_build_object(
          'id', p.id,
          'code', p.code,
          'name', p.name,
          'description', p.description,
          'price_monthly', p.price_monthly,
          'price_yearly', p.price_yearly,
          'is_active', p.is_active,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        ) as plan,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'code', f.code,
              'name', f.name,
              'value', sfa.value,
              'is_active', sfa.is_active
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) as features
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      LEFT JOIN subscription_feature_access sfa ON s.id = sfa.subscription_id
      LEFT JOIN features f ON sfa.feature_id = f.id
      WHERE s.organization_id = $1
      GROUP BY s.id, s.user_id, s.organization_id, s.plan_id, s.status, s.start_date, s.end_date, s.trial_end_date, s.auto_renew, s.created_at, s.updated_at, p.id, p.code, p.name, p.description, p.price_monthly, p.price_yearly, p.is_active, p.created_at, p.updated_at
      ORDER BY s.created_at DESC
    `, [organizationId])

    return result.rows
  }

  async findActiveByUserId(userId: bigint): Promise<SubscriptionWithDetails | null> {
    const result = await this.db.query<SubscriptionWithDetails>(`
      SELECT 
        s.id,
        s.user_id,
        s.organization_id,
        s.plan_id,
        s.status,
        s.start_date,
        s.end_date,
        s.trial_end_date,
        s.auto_renew,
        s.created_at,
        s.updated_at,
        json_build_object(
          'id', p.id,
          'code', p.code,
          'name', p.name,
          'description', p.description,
          'price_monthly', p.price_monthly,
          'price_yearly', p.price_yearly,
          'is_active', p.is_active,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        ) as plan,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'code', f.code,
              'name', f.name,
              'value', sfa.value,
              'is_active', sfa.is_active
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) as features
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      LEFT JOIN subscription_feature_access sfa ON s.id = sfa.subscription_id
      LEFT JOIN features f ON sfa.feature_id = f.id
      WHERE s.user_id = $1 AND s.status = 'ACTIVE'
      GROUP BY s.id, s.user_id, s.organization_id, s.plan_id, s.status, s.start_date, s.end_date, s.trial_end_date, s.auto_renew, s.created_at, s.updated_at, p.id, p.code, p.name, p.description, p.price_monthly, p.price_yearly, p.is_active, p.created_at, p.updated_at
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [userId])

    return result.rows[0] || null
  }

  async create(data: CreateSubscriptionData): Promise<SubscriptionWithDetails> {
    return await this.db.transaction(async (db) => {
      // Create subscription
      const subscriptionResult = await db.query<Subscription>(`
        INSERT INTO subscriptions (user_id, organization_id, plan_id, status, start_date, end_date, trial_end_date, auto_renew)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        data.user_id || null,
        data.organization_id || null,
        data.plan_id,
        data.status || 'ACTIVE',
        data.start_date || new Date(),
        data.end_date || null,
        data.trial_end_date || null,
        data.auto_renew !== false
      ])

      const subscription = subscriptionResult.rows[0]

      // Create feature access based on plan features
      await db.query(`
        INSERT INTO subscription_feature_access (subscription_id, feature_id, user_id, organization_id, value, is_active, valid_from)
        SELECT 
          $1,
          pf.feature_id,
          $2,
          $3,
          pf.value,
          true,
          CURRENT_TIMESTAMP
        FROM plan_features pf
        WHERE pf.plan_id = $4
      `, [
        subscription.id,
        data.user_id || null,
        data.organization_id || null,
        data.plan_id
      ])

      // Return subscription with details
      const result = await db.query<SubscriptionWithDetails>(`
        SELECT 
          s.id,
          s.user_id,
          s.organization_id,
          s.plan_id,
          s.status,
          s.start_date,
          s.end_date,
          s.trial_end_date,
          s.auto_renew,
          s.created_at,
          s.updated_at,
          json_build_object(
            'id', p.id,
            'code', p.code,
            'name', p.name,
            'description', p.description,
            'price_monthly', p.price_monthly,
            'price_yearly', p.price_yearly,
            'is_active', p.is_active,
            'created_at', p.created_at,
            'updated_at', p.updated_at
          ) as plan,
          COALESCE(
            json_agg(
              json_build_object(
                'id', f.id,
                'code', f.code,
                'name', f.name,
                'value', sfa.value,
                'is_active', sfa.is_active
              )
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'::json
          ) as features
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        LEFT JOIN subscription_feature_access sfa ON s.id = sfa.subscription_id
        LEFT JOIN features f ON sfa.feature_id = f.id
        WHERE s.id = $1
        GROUP BY s.id, s.user_id, s.organization_id, s.plan_id, s.status, s.start_date, s.end_date, s.trial_end_date, s.auto_renew, s.created_at, s.updated_at, p.id, p.code, p.name, p.description, p.price_monthly, p.price_yearly, p.is_active, p.created_at, p.updated_at
      `, [subscription.id])

      return result.rows[0]
    })
  }

  async update(id: bigint, data: UpdateSubscriptionData): Promise<SubscriptionWithDetails | null> {
    return await this.db.transaction(async (db) => {
      const fields: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (data.plan_id !== undefined) {
        fields.push(`plan_id = $${paramCount}`)
        values.push(data.plan_id)
        paramCount++
      }

      if (data.status !== undefined) {
        fields.push(`status = $${paramCount}`)
        values.push(data.status)
        paramCount++
      }

      if (data.end_date !== undefined) {
        fields.push(`end_date = $${paramCount}`)
        values.push(data.end_date)
        paramCount++
      }

      if (data.trial_end_date !== undefined) {
        fields.push(`trial_end_date = $${paramCount}`)
        values.push(data.trial_end_date)
        paramCount++
      }

      if (data.auto_renew !== undefined) {
        fields.push(`auto_renew = $${paramCount}`)
        values.push(data.auto_renew)
        paramCount++
      }

      if (fields.length === 0) {
        return this.findById(id)
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`)
      values.push(id)

      await db.query(`
        UPDATE subscriptions 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
      `, values)

      // Update feature access if plan changed
      if (data.plan_id !== undefined) {
        // Remove existing feature access
        await db.query(`
          DELETE FROM subscription_feature_access WHERE subscription_id = $1
        `, [id])

        // Add new feature access
        await db.query(`
          INSERT INTO subscription_feature_access (subscription_id, feature_id, user_id, organization_id, value, is_active, valid_from)
          SELECT 
            $1,
            pf.feature_id,
            s.user_id,
            s.organization_id,
            pf.value,
            true,
            CURRENT_TIMESTAMP
          FROM plan_features pf
          JOIN subscriptions s ON s.id = $1
          WHERE pf.plan_id = $2
        `, [id, data.plan_id])
      }

      // Return updated subscription with details
      const result = await db.query<SubscriptionWithDetails>(`
        SELECT 
          s.id,
          s.user_id,
          s.organization_id,
          s.plan_id,
          s.status,
          s.start_date,
          s.end_date,
          s.trial_end_date,
          s.auto_renew,
          s.created_at,
          s.updated_at,
          json_build_object(
            'id', p.id,
            'code', p.code,
            'name', p.name,
            'description', p.description,
            'price_monthly', p.price_monthly,
            'price_yearly', p.price_yearly,
            'is_active', p.is_active,
            'created_at', p.created_at,
            'updated_at', p.updated_at
          ) as plan,
          COALESCE(
            json_agg(
              json_build_object(
                'id', f.id,
                'code', f.code,
                'name', f.name,
                'value', sfa.value,
                'is_active', sfa.is_active
              )
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'::json
          ) as features
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        LEFT JOIN subscription_feature_access sfa ON s.id = sfa.subscription_id
        LEFT JOIN features f ON sfa.feature_id = f.id
        WHERE s.id = $1
        GROUP BY s.id, s.user_id, s.organization_id, s.plan_id, s.status, s.start_date, s.end_date, s.trial_end_date, s.auto_renew, s.created_at, s.updated_at, p.id, p.code, p.name, p.description, p.price_monthly, p.price_yearly, p.is_active, p.created_at, p.updated_at
      `, [id])

      return result.rows[0] || null
    })
  }

  async delete(id: bigint): Promise<boolean> {
    return await this.db.transaction(async (db) => {
      // Delete subscription feature access
      await db.query(`
        DELETE FROM subscription_feature_access WHERE subscription_id = $1
      `, [id])

      // Delete subscription
      const result = await db.query(`
        DELETE FROM subscriptions WHERE id = $1
      `, [id])

      return result.rowCount > 0
    })
  }

  async getAllPlans(): Promise<PlanWithFeatures[]> {
    const result = await this.db.query<PlanWithFeatures>(`
      SELECT 
        p.id,
        p.code,
        p.name,
        p.description,
        p.price_monthly,
        p.price_yearly,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'plan_id', pf.plan_id,
              'feature_id', pf.feature_id,
              'value', pf.value,
              'feature', json_build_object(
                'id', f.id,
                'code', f.code,
                'name', f.name,
                'description', f.description,
                'type', f.type,
                'created_at', f.created_at
              )
            )
          ) FILTER (WHERE pf.plan_id IS NOT NULL),
          '[]'::json
        ) as features
      FROM plans p
      LEFT JOIN plan_features pf ON p.id = pf.plan_id
      LEFT JOIN features f ON pf.feature_id = f.id
      WHERE p.is_active = true
      GROUP BY p.id, p.code, p.name, p.description, p.price_monthly, p.price_yearly, p.is_active, p.created_at, p.updated_at
      ORDER BY p.price_monthly ASC
    `)

    return result.rows
  }

  async getPlanById(id: bigint): Promise<PlanWithFeatures | null> {
    const result = await this.db.query<PlanWithFeatures>(`
      SELECT 
        p.id,
        p.code,
        p.name,
        p.description,
        p.price_monthly,
        p.price_yearly,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'plan_id', pf.plan_id,
              'feature_id', pf.feature_id,
              'value', pf.value,
              'feature', json_build_object(
                'id', f.id,
                'code', f.code,
                'name', f.name,
                'description', f.description,
                'type', f.type,
                'created_at', f.created_at
              )
            )
          ) FILTER (WHERE pf.plan_id IS NOT NULL),
          '[]'::json
        ) as features
      FROM plans p
      LEFT JOIN plan_features pf ON p.id = pf.plan_id
      LEFT JOIN features f ON pf.feature_id = f.id
      WHERE p.id = $1
      GROUP BY p.id, p.code, p.name, p.description, p.price_monthly, p.price_yearly, p.is_active, p.created_at, p.updated_at
    `, [id])

    return result.rows[0] || null
  }

  async hasFeatureAccess(userId: bigint, featureCode: string): Promise<boolean> {
    const result = await this.db.query(`
      SELECT 1
      FROM subscriptions s
      JOIN subscription_feature_access sfa ON s.id = sfa.subscription_id
      JOIN features f ON sfa.feature_id = f.id
      WHERE s.user_id = $1 
        AND s.status = 'ACTIVE'
        AND f.code = $2
        AND sfa.is_active = true
      LIMIT 1
    `, [userId, featureCode])

    return result.rows.length > 0
  }

  async getFeatureValue(userId: bigint, featureCode: string): Promise<string | null> {
    const result = await this.db.query<{ value: string }>(`
      SELECT sfa.value
      FROM subscriptions s
      JOIN subscription_feature_access sfa ON s.id = sfa.subscription_id
      JOIN features f ON sfa.feature_id = f.id
      WHERE s.user_id = $1 
        AND s.status = 'ACTIVE'
        AND f.code = $2
        AND sfa.is_active = true
      LIMIT 1
    `, [userId, featureCode])

    return result.rows[0]?.value || null
  }
}

