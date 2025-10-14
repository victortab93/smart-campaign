import { Database } from '../database'
import { UserRepository } from '../repositories/user.repository'
import { ContactRepository } from '../repositories/contact.repository'
import { CampaignRepository } from '../repositories/campaign.repository'
import { SubscriptionRepository } from '../repositories/subscription.repository'
import { AuthService } from '../services/auth.service'

export interface UserContext {
  userId: bigint
  organizationId?: bigint
  roles: string[]
}

export interface DashboardStats {
  totalContacts: number
  totalCampaigns: number
  activeCampaigns: number
  totalEmailsSent: number
}

export interface ContactData {
  id?: bigint
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  tags?: string[]
}

export interface CampaignData {
  id?: bigint
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

export class UserBFF {
  private userRepository: UserRepository
  private contactRepository: ContactRepository
  private campaignRepository: CampaignRepository
  private subscriptionRepository: SubscriptionRepository
  private authService: AuthService

  constructor(private db: Database) {
    this.userRepository = new UserRepository(db)
    this.contactRepository = new ContactRepository(db)
    this.campaignRepository = new CampaignRepository(db)
    this.subscriptionRepository = new SubscriptionRepository(db)
    this.authService = new AuthService(db)
  }

  // Authentication methods
  async login(email: string, password: string) {
    return await this.authService.login({ email, password })
  }

  async register(email: string, password: string, name?: string) {
    return await this.authService.register({ email, password, name })
  }

  async validateToken(token: string) {
    return await this.authService.validateToken(token)
  }

  // Dashboard methods
  async getDashboardStats(context: UserContext): Promise<DashboardStats> {
    const [contactsCount, campaignsCount, campaignsStats] = await Promise.all([
      this.contactRepository.count({
        user_id: context.userId,
        organization_id: context.organizationId
      }),
      this.campaignRepository.count({
        user_id: context.userId,
        organization_id: context.organizationId
      }),
      this.campaignRepository.getStats(context.userId, context.organizationId)
    ])

    // Get total emails sent from campaign metrics
    const emailsResult = await this.db.query<{ total: string }>(`
      SELECT COALESCE(SUM(cm.total_sent), 0) as total
      FROM campaign_metrics cm
      JOIN campaigns c ON cm.campaign_id = c.id
      WHERE (c.user_id = $1 OR c.organization_id = $2)
    `, [context.userId, context.organizationId || null])

    return {
      totalContacts: contactsCount,
      totalCampaigns: campaignsCount,
      activeCampaigns: campaignsStats.sent,
      totalEmailsSent: parseInt(emailsResult.rows[0].total)
    }
  }

  async getRecentCampaigns(context: UserContext, limit: number = 5) {
    return await this.campaignRepository.findAll({
      user_id: context.userId,
      organization_id: context.organizationId,
      limit
    })
  }

  // Contact methods
  async getContacts(context: UserContext, filters: {
    search?: string
    tags?: string[]
    limit?: number
    offset?: number
  } = {}) {
    return await this.contactRepository.findAll({
      user_id: context.userId,
      organization_id: context.organizationId,
      ...filters
    })
  }

  async getContact(context: UserContext, contactId: bigint) {
    const contact = await this.contactRepository.findById(contactId)
    
    // Check if user has access to this contact
    if (!contact || 
        (contact.user_id !== context.userId && contact.organization_id !== context.organizationId)) {
      return null
    }

    return contact
  }

  async createContact(context: UserContext, data: ContactData) {
    return await this.contactRepository.create({
      user_id: context.userId,
      organization_id: context.organizationId,
      ...data
    })
  }

  async updateContact(context: UserContext, contactId: bigint, data: ContactData) {
    // Check if user has access to this contact
    const contact = await this.getContact(context, contactId)
    if (!contact) {
      throw new Error('Contact not found or access denied')
    }

    return await this.contactRepository.update(contactId, data)
  }

  async deleteContact(context: UserContext, contactId: bigint) {
    // Check if user has access to this contact
    const contact = await this.getContact(context, contactId)
    if (!contact) {
      throw new Error('Contact not found or access denied')
    }

    return await this.contactRepository.delete(contactId)
  }

  async getContactTags(context: UserContext) {
    return await this.contactRepository.getTags(context.userId, context.organizationId)
  }

  // Campaign methods
  async getCampaigns(context: UserContext, filters: {
    status?: string
    search?: string
    limit?: number
    offset?: number
  } = {}) {
    return await this.campaignRepository.findAll({
      user_id: context.userId,
      organization_id: context.organizationId,
      ...filters
    })
  }

  async getCampaign(context: UserContext, campaignId: bigint) {
    const campaign = await this.campaignRepository.findById(campaignId)
    
    // Check if user has access to this campaign
    if (!campaign || 
        (campaign.user_id !== context.userId && campaign.organization_id !== context.organizationId)) {
      return null
    }

    return campaign
  }

  async createCampaign(context: UserContext, data: CampaignData) {
    // Get user's active subscription
    const subscription = await this.subscriptionRepository.findActiveByUserId(context.userId)
    if (!subscription) {
      throw new Error('No active subscription found')
    }

    return await this.campaignRepository.create({
      subscription_id: subscription.id,
      user_id: context.userId,
      organization_id: context.organizationId,
      ...data
    })
  }

  async updateCampaign(context: UserContext, campaignId: bigint, data: CampaignData) {
    // Check if user has access to this campaign
    const campaign = await this.getCampaign(context, campaignId)
    if (!campaign) {
      throw new Error('Campaign not found or access denied')
    }

    return await this.campaignRepository.update(campaignId, data)
  }

  async deleteCampaign(context: UserContext, campaignId: bigint) {
    // Check if user has access to this campaign
    const campaign = await this.getCampaign(context, campaignId)
    if (!campaign) {
      throw new Error('Campaign not found or access denied')
    }

    return await this.campaignRepository.delete(campaignId)
  }

  // Subscription methods
  async getSubscription(context: UserContext) {
    return await this.subscriptionRepository.findActiveByUserId(context.userId)
  }

  async getPlans() {
    return await this.subscriptionRepository.getAllPlans()
  }

  async getPlan(planId: bigint) {
    return await this.subscriptionRepository.getPlanById(planId)
  }

  async hasFeatureAccess(context: UserContext, featureCode: string): Promise<boolean> {
    return await this.subscriptionRepository.hasFeatureAccess(context.userId, featureCode)
  }

  async getFeatureValue(context: UserContext, featureCode: string): Promise<string | null> {
    return await this.subscriptionRepository.getFeatureValue(context.userId, featureCode)
  }

  // User profile methods
  async getUserProfile(context: UserContext) {
    return await this.userRepository.findById(context.userId)
  }

  async updateUserProfile(context: UserContext, data: {
    name?: string
    email?: string
  }) {
    return await this.userRepository.update(context.userId, data)
  }

  async changePassword(context: UserContext, currentPassword: string, newPassword: string) {
    return await this.authService.changePassword(context.userId, currentPassword, newPassword)
  }

  // Utility methods
  async checkPermission(context: UserContext, permissionCode: string): Promise<boolean> {
    return await this.authService.hasPermission(
      context.userId, 
      permissionCode, 
      context.organizationId
    )
  }

  async getUserRoles(context: UserContext) {
    return await this.authService.getUserRoles(context.userId)
  }
}

