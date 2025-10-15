import { Database } from '../database'

// CamelCase types exposed to the app; SQL maps snake_case -> camelCase
export interface Contact {
  id: bigint
  userId: bigint | null
  organizationId: bigint | null
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ContactWithTags extends Contact {
  tags: string[]
}

export interface CreateContactData {
  userId?: bigint
  organizationId?: bigint
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  tags?: string[]
}

export interface UpdateContactData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  tags?: string[]
}

export interface ContactFilters {
  userId?: bigint
  organizationId?: bigint
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export class ContactRepository {
  constructor(private db: Database) {}

  async findById(id: bigint): Promise<ContactWithTags | null> {
    const result = await this.db.query<ContactWithTags>(`
      SELECT 
        c.id,
        c.user_id AS "userId",
        c.organization_id AS "organizationId",
        c.first_name AS "firstName",
        c.last_name AS "lastName",
        c.email,
        c.phone,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        COALESCE(
          array_agg(ct.tag) FILTER (WHERE ct.tag IS NOT NULL),
          ARRAY[]::text[]
        ) as tags
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      WHERE c.id = $1
      GROUP BY c.id, c.user_id, c.organization_id, c.first_name, c.last_name, c.email, c.phone, c.created_at, c.updated_at
    `, [id])

    return result.rows[0] || null
  }

  async findByEmail(email: string, userId?: bigint, organizationId?: bigint): Promise<ContactWithTags | null> {
    let query = `
      SELECT 
        c.id,
        c.user_id AS "userId",
        c.organization_id AS "organizationId",
        c.first_name AS "firstName",
        c.last_name AS "lastName",
        c.email,
        c.phone,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        COALESCE(
          array_agg(ct.tag) FILTER (WHERE ct.tag IS NOT NULL),
          ARRAY[]::text[]
        ) as tags
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      WHERE c.email = $1
    `
    
    const params: any[] = [email]
    let paramCount = 1

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

    query += `
      GROUP BY c.id, c.user_id, c.organization_id, c.first_name, c.last_name, c.email, c.phone, c.created_at, c.updated_at
    `

    const result = await this.db.query<ContactWithTags>(query, params)
    return result.rows[0] || null
  }

  async findAll(filters: ContactFilters = {}): Promise<ContactWithTags[]> {
    let query = `
      SELECT 
        c.id,
        c.user_id AS "userId",
        c.organization_id AS "organizationId",
        c.first_name AS "firstName",
        c.last_name AS "lastName",
        c.email,
        c.phone,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        COALESCE(
          array_agg(ct.tag) FILTER (WHERE ct.tag IS NOT NULL),
          ARRAY[]::text[]
        ) as tags
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0

    if (filters.userId !== undefined) {
      paramCount++
      query += ` AND c.user_id = $${paramCount}`
      params.push(filters.userId)
    }

    if (filters.organizationId !== undefined) {
      paramCount++
      query += ` AND c.organization_id = $${paramCount}`
      params.push(filters.organizationId)
    }

    if (filters.search) {
      paramCount++
      query += ` AND (
        c.first_name ILIKE $${paramCount} OR 
        c.last_name ILIKE $${paramCount} OR 
        c.email ILIKE $${paramCount}
      )`
      params.push(`%${filters.search}%`)
    }

    if (filters.tags && filters.tags.length > 0) {
      paramCount++
      query += ` AND c.id IN (
        SELECT contact_id 
        FROM contact_tags 
        WHERE tag = ANY($${paramCount})
      )`
      params.push(filters.tags)
    }

    query += `
      GROUP BY c.id, c.user_id, c.organization_id, c.first_name, c.last_name, c.email, c.phone, c.created_at, c.updated_at
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

    const result = await this.db.query<ContactWithTags>(query, params)
    return result.rows
  }

  async create(data: CreateContactData): Promise<ContactWithTags> {
    return await this.db.transaction(async (db) => {
      // Create contact
      const contactResult = await db.query<Contact>(`
        INSERT INTO contacts (user_id, organization_id, first_name, last_name, email, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        data.userId || null,
        data.organizationId || null,
        data.firstName || null,
        data.lastName || null,
        data.email,
        data.phone || null
      ])

      const row: any = contactResult.rows[0]
      const contact: Contact = {
        id: row.id,
        userId: row.user_id,
        organizationId: row.organization_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }

      // Add tags if provided
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          await db.query(`
            INSERT INTO contact_tags (contact_id, tag)
            VALUES ($1, $2)
            ON CONFLICT (contact_id, tag) DO NOTHING
          `, [contact.id, tag])
        }
      }

      // Return contact with tags
      const result = await db.query<ContactWithTags>(`
        SELECT 
          c.id,
          c.user_id AS "userId",
          c.organization_id AS "organizationId",
          c.first_name AS "firstName",
          c.last_name AS "lastName",
          c.email,
          c.phone,
          c.created_at AS "createdAt",
          c.updated_at AS "updatedAt",
          COALESCE(
            array_agg(ct.tag) FILTER (WHERE ct.tag IS NOT NULL),
            ARRAY[]::text[]
          ) as tags
        FROM contacts c
        LEFT JOIN contact_tags ct ON c.id = ct.contact_id
        WHERE c.id = $1
        GROUP BY c.id, c.user_id, c.organization_id, c.first_name, c.last_name, c.email, c.phone, c.created_at, c.updated_at
      `, [contact.id])

      return result.rows[0]
    })
  }

  async update(id: bigint, data: UpdateContactData): Promise<ContactWithTags | null> {
    return await this.db.transaction(async (db) => {
      const fields: string[] = []
      const values: any[] = []
      let paramCount = 1

      if (data.firstName !== undefined) {
        fields.push(`first_name = $${paramCount}`)
        values.push(data.firstName)
        paramCount++
      }

      if (data.lastName !== undefined) {
        fields.push(`last_name = $${paramCount}`)
        values.push(data.lastName)
        paramCount++
      }

      if (data.email !== undefined) {
        fields.push(`email = $${paramCount}`)
        values.push(data.email)
        paramCount++
      }

      if (data.phone !== undefined) {
        fields.push(`phone = $${paramCount}`)
        values.push(data.phone)
        paramCount++
      }

      if (fields.length === 0 && !data.tags) {
        return this.findById(id)
      }

      if (fields.length > 0) {
        fields.push(`updated_at = CURRENT_TIMESTAMP`)
        values.push(id)

        await db.query(`
          UPDATE contacts 
          SET ${fields.join(', ')}
          WHERE id = $${paramCount}
        `, values)
      }

      // Update tags if provided
      if (data.tags !== undefined) {
        // Remove existing tags
        await db.query(`
          DELETE FROM contact_tags WHERE contact_id = $1
        `, [id])

        // Add new tags
        for (const tag of data.tags) {
          await db.query(`
            INSERT INTO contact_tags (contact_id, tag)
            VALUES ($1, $2)
          `, [id, tag])
        }
      }

      // Return updated contact with tags
      const result = await db.query<ContactWithTags>(`
        SELECT 
          c.id,
          c.user_id AS "userId",
          c.organization_id AS "organizationId",
          c.first_name AS "firstName",
          c.last_name AS "lastName",
          c.email,
          c.phone,
          c.created_at AS "createdAt",
          c.updated_at AS "updatedAt",
          COALESCE(
            array_agg(ct.tag) FILTER (WHERE ct.tag IS NOT NULL),
            ARRAY[]::text[]
          ) as tags
        FROM contacts c
        LEFT JOIN contact_tags ct ON c.id = ct.contact_id
        WHERE c.id = $1
        GROUP BY c.id, c.user_id, c.organization_id, c.first_name, c.last_name, c.email, c.phone, c.created_at, c.updated_at
      `, [id])

      return result.rows[0] || null
    })
  }

  async delete(id: bigint): Promise<boolean> {
    return await this.db.transaction(async (db) => {
      // Delete contact tags first
      await db.query(`
        DELETE FROM contact_tags WHERE contact_id = $1
      `, [id])

      // Delete contact
      const result = await db.query(`
        DELETE FROM contacts WHERE id = $1
      `, [id])

      return result.rowCount > 0
    })
  }

  async addTag(contactId: bigint, tag: string): Promise<void> {
    await this.db.query(`
      INSERT INTO contact_tags (contact_id, tag)
      VALUES ($1, $2)
      ON CONFLICT (contact_id, tag) DO NOTHING
    `, [contactId, tag])
  }

  async removeTag(contactId: bigint, tag: string): Promise<void> {
    await this.db.query(`
      DELETE FROM contact_tags 
      WHERE contact_id = $1 AND tag = $2
    `, [contactId, tag])
  }

  async getTags(userId?: bigint, organizationId?: bigint): Promise<string[]> {
    let query = `
      SELECT DISTINCT tag
      FROM contact_tags ct
      JOIN contacts c ON ct.contact_id = c.id
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

    query += ` ORDER BY tag`

    const result = await this.db.query<{ tag: string }>(query, params)
    return result.rows.map(row => row.tag)
  }

  async count(filters: ContactFilters = {}): Promise<number> {
    let query = `
      SELECT COUNT(DISTINCT c.id) as count
      FROM contacts c
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0

    if (filters.userId !== undefined) {
      paramCount++
      query += ` AND c.user_id = $${paramCount}`
      params.push(filters.userId)
    }

    if (filters.organizationId !== undefined) {
      paramCount++
      query += ` AND c.organization_id = $${paramCount}`
      params.push(filters.organizationId)
    }

    if (filters.search) {
      paramCount++
      query += ` AND (
        c.first_name ILIKE $${paramCount} OR 
        c.last_name ILIKE $${paramCount} OR 
        c.email ILIKE $${paramCount}
      )`
      params.push(`%${filters.search}%`)
    }

    if (filters.tags && filters.tags.length > 0) {
      paramCount++
      query += ` AND c.id IN (
        SELECT contact_id 
        FROM contact_tags 
        WHERE tag = ANY($${paramCount})
      )`
      params.push(filters.tags)
    }

    const result = await this.db.query<{ count: string }>(query, params)
    return parseInt(result.rows[0].count)
  }
}

