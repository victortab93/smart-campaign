import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Database } from '../database'
import { UserRepository, UserWithRoles } from '../repositories/user.repository'

export interface AuthResult {
  user: UserWithRoles
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
  organization_id?: bigint
}

export class AuthService {
  private userRepository: UserRepository

  constructor(private db: Database) {
    this.userRepository = new UserRepository(db)
  }

  async login(credentials: LoginCredentials): Promise<AuthResult | null> {
    const user = await this.userRepository.findByEmail(credentials.email)
    
    if (!user || !user.password_hash) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)
    if (!isPasswordValid) {
      return null
    }

    if (!user.is_active) {
      return null
    }

    const token = this.generateToken(user)
    return { user, token }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      password_hash: passwordHash,
      name: data.name,
      role_in_org: 'INDIVIDUAL',
      organization_id: data.organization_id,
      is_active: true
    })

    // Get the INDIVIDUAL role and assign it
    const individualRole = await this.db.query(`
      SELECT id FROM roles WHERE code = 'INDIVIDUAL'
    `)

    if (individualRole.rows.length > 0) {
      await this.userRepository.assignRole(
        user.id, 
        individualRole.rows[0].id, 
        data.organization_id || null
      )
    }

    // Get user with roles
    const userWithRoles = await this.userRepository.findById(user.id)
    if (!userWithRoles) {
      throw new Error('Failed to create user')
    }

    const token = this.generateToken(userWithRoles)
    return { user: userWithRoles, token }
  }

  async validateToken(token: string): Promise<UserWithRoles | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      const user = await this.userRepository.findById(BigInt(decoded.userId))
      return user
    } catch (error) {
      return null
    }
  }

  async refreshToken(userId: bigint): Promise<string> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    return this.generateToken(user)
  }

  async changePassword(userId: bigint, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId)
    if (!user || !user.password_hash) {
      return false
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isCurrentPasswordValid) {
      return false
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12)
    await this.userRepository.update(userId, { password_hash: newPasswordHash })
    
    return true
  }

  async resetPassword(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      return false
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id.toString(), type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    // TODO: Send email with reset token
    // For now, just log it
    console.log(`Password reset token for ${email}: ${resetToken}`)
    
    return true
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      if (decoded.type !== 'password_reset') {
        return false
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12)
      await this.userRepository.update(BigInt(decoded.userId), { password_hash: newPasswordHash })
      
      return true
    } catch (error) {
      return false
    }
  }

  async hasPermission(userId: bigint, permissionCode: string, organizationId?: bigint): Promise<boolean> {
    return await this.userRepository.hasPermission(userId, permissionCode, organizationId)
  }

  async getUserRoles(userId: bigint): Promise<{ id: bigint; code: string; name: string; organization_id: bigint | null }[]> {
    return await this.userRepository.getUserRoles(userId)
  }

  private generateToken(user: UserWithRoles): string {
    return jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
        roles: user.roles.map(r => r.code),
        organizationId: user.organization_id?.toString()
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )
  }
}

