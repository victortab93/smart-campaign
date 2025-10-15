import { getServerSession } from 'next-auth'
import { initializeDatabase, Database } from '@/lib/database'
import { CampaignRepository } from '@/lib/repositories/campaign.repository'
import { CampaignsList } from '@/components/campaigns/CampaignsList'
import { CampaignsHeader } from '@/components/campaigns/CampaignsHeader'
import type { CampaignListItem } from '@/types/domain'

export default async function CampaignsPage() {
  const session = await getServerSession()
  
  if (!session) {
    return null
  }

  initializeDatabase()
  const db = new Database()
  const repo = new CampaignRepository(db)
  const campaignsRaw = await repo.findAll({
    user_id: BigInt(session.user.id),
    organization_id: session.user.organizationId ? BigInt(session.user.organizationId) : undefined
  })
  const campaigns: CampaignListItem[] = campaignsRaw.map(c => ({
    id: c.id,
    name: c.name,
    status: c.status,
    createdAt: c.created_at,
    sendDate: c.send_date,
    campaignMetrics: c.metrics.map(m => ({
      totalSent: m.total_sent,
      totalOpened: m.total_opened,
      totalClicked: m.total_clicked,
      totalBounced: m.total_bounced ?? 0
    })),
    campaignContent: [{ subject: c.content?.[0]?.subject || null }],
    subscription: { plan: { name: c.subscription.plan.name } }
  }))
  await db.release()

  return (
    <div className="space-y-6">
      <CampaignsHeader totalCampaigns={campaigns.length} />
      <CampaignsList campaigns={campaigns} />
    </div>
  )
}

