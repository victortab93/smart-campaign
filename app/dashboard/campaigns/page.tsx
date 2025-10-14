import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CampaignsList } from '@/components/campaigns/CampaignsList'
import { CampaignsHeader } from '@/components/campaigns/CampaignsHeader'

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return null
  }

  // Get user's campaigns
  const campaigns = await prisma.campaign.findMany({
    where: {
      OR: [
        { userId: BigInt(session.user.id) },
        { organizationId: session.user.organizationId ? BigInt(session.user.organizationId) : undefined }
      ]
    },
    include: {
      campaignContent: true,
      campaignMetrics: true,
      subscription: {
        include: {
          plan: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <CampaignsHeader totalCampaigns={campaigns.length} />
      <CampaignsList campaigns={campaigns} />
    </div>
  )
}

