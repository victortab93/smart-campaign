import { Database } from '../database'

export interface User {
  id: bigint
  organization_id: bigint | null
  email: string
  password_hash: string | null
  name: string | null
  role_in_org: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface UserWithRoles extends User {
  roles: {
    id: bigint
    code: string
    name: string
    organization_id: bigint | null
  }[]
  organization?: {
    id: bigint
    name: string
  } | null
}

export interface CreateUserData {
  email: string
  password_hash?: string
  name?: string
  role_in_org?: string
  organization_id?: bigint
  is_active?: boolean
}

export interface UpdateUserData {
  email?: string
  password_hash?: string
  name?: string
  role_in_org?: string
  organization_id?: bigint
  is_active?: boolean
}

export class UserRepository {
  constructor(private db: Database) {}

  async findById(id: bigint): Promise<UserWithRoles | null> {
    const result = await this.db.query<UserWithRoles>(`
      SELECT 
        u.id,
        u.organization_id,
        u.email,
        u.password_hash,
        u.name,
        u.role_in_org,
        u.is_active,
        u.created_at,
        u.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'code', r.code,
              'name', r.name,
              'organization_id', ur.organization_id
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) as roles,
        CASE 
          WHEN o.id IS NOT NULL THEN 
            json_build_object('id', o.id, 'name', o.name)
          ELSE NULL 
        END as organization
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = $1
      GROUP BY u.id, u.organization_id, u.email, u.password_hash, u.name, u.role_in_org, u.is_active, u.created_at, u.updated_at, o.id, o.name
    `, [id])

    return result.rows[0] || null
  }

  async findByEmail(email: string): Promise<UserWithRoles | null> {
    const result = await this.db.query<UserWithRoles>(`
      SELECT 
        u.id,
        u.organization_id,
        u.email,
        u.password_hash,
        u.name,
        u.role_in_org,
        u.is_active,
        u.created_at,
        u.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'code', r.code,
              'name', r.name,
              'organization_id', ur.organization_id
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) as roles,
        CASE 
          WHEN o.id IS NOT NULL THEN 
            json_build_object('id', o.id, 'name', o.name)
          ELSE NULL 
        END as organization
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = $1
      GROUP BY u.id, u.organization_id, u.email, u.password_hash, u.name, u.role_in_org, u.is_active, u.created_at, u.updated_at, o.id, o.name
    `, [email])

    return result.rows[0] || null
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<UserWithRoles[]> {
    const result = await this.db.query<UserWithRoles>(`
      SELECT 
        u.id,
        u.organization_id,
        u.email,
        u.password_hash,
        u.name,
        u.role_in_org,
        u.is_active,
        u.created_at,
        u.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'code', r.code,
              'name', r.name,
              'organization_id', ur.organization_id
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) as roles,
        CASE 
          WHEN o.id IS NOT NULL THEN 
            json_build_object('id', o.id, 'name', o.name)
          ELSE NULL 
        END as organization
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      GROUP BY u.id, u.organization_id, u.email, u.password_hash, u.name, u.role_in_org, u.is_active, u.created_at, u.updated_at, o.id, o.name
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    return result.rows
  }

  async create(data: CreateUserData): Promise<User> {
    const result = await this.db.query<User>(`
      INSERT INTO users (email, password_hash, name, role_in_org, organization_id, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.email,
      data.password_hash || null,
      data.name || null,
      data.role_in_org || 'INDIVIDUAL',
      data.organization_id || null,
      data.is_active !== false
    ])

    return result.rows[0]
  }

  async update(id: bigint, data: UpdateUserData): Promise<User | null> {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.email !== undefined) {
      fields.push(`email = $${paramCount}`)
      values.push(data.email)
      paramCount++
    }

    if (data.password_hash !== undefined) {
      fields.push(`password_hash = $${paramCount}`)
      values.push(data.password_hash)
      paramCount++
    }

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount}`)
      values.push(data.name)
      paramCount++
    }

    if (data.role_in_org !== undefined) {
      fields.push(`role_in_org = $${paramCount}`)
      values.push(data.role_in_org)
      paramCount++
    }

    if (data.organization_id !== undefined) {
      fields.push(`organization_id = $${paramCount}`)
      values.push(data.organization_id)
      paramCount++
    }

    if (data.is_active !== undefined) {
      fields.push(`is_active = $${paramCount}`)
      values.push(data.is_active)
      paramCount++
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await this.db.query<User>(`
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values)

    return result.rows[0] || null
  }

  async delete(id: bigint): Promise<boolean> {
    const result = await this.db.query(`
      DELETE FROM users WHERE id = $1
    `, [id])

    return result.rowCount > 0
  }

  async assignRole(userId: bigint, roleId: bigint, organizationId?: bigint): Promise<void> {
    await this.db.query(`
      INSERT INTO user_roles (user_id, role_id, organization_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, role_id, organization_id) DO NOTHING
    `, [userId, roleId, organizationId || null])
  }

  async removeRole(userId: bigint, roleId: bigint, organizationId?: bigint): Promise<void> {
    await this.db.query(`
      DELETE FROM user_roles 
      WHERE user_id = $1 AND role_id = $2 AND organization_id = $3
    `, [userId, roleId, organizationId || null])
  }

  async getUserRoles(userId: bigint): Promise<{ id: bigint; code: string; name: string; organization_id: bigint | null }[]> {
    const result = await this.db.query(`
      SELECT r.id, r.code, r.name, ur.organization_id
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `, [userId])

    return result.rows
  }

  async hasPermission(userId: bigint, permissionCode: string, organizationId?: bigint): Promise<boolean> {
    const result = await this.db.query(`
      SELECT 1
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = $1 
        AND p.code = $2
        AND (ur.organization_id = $3 OR ur.organization_id IS NULL)
      LIMIT 1
    `, [userId, permissionCode, organizationId || null])

    return result.rows.length > 0
  }

  async count(): Promise<number> {
    const result = await this.db.query<{ count: string }>(`
      SELECT COUNT(*) as count FROM users
    `)

    return parseInt(result.rows[0].count)
  }

  async countActive(): Promise<number> {
    const result = await this.db.query<{ count: string }>(`
      SELECT COUNT(*) as count FROM users WHERE is_active = true
    `)

    return parseInt(result.rows[0].count)
  }
}

