import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminDashboardStats } from '@/components/admin/AdminDashboardStats'
import { RecentUsers } from '@/components/admin/RecentUsers'
import { SystemHealth } from '@/components/admin/SystemHealth'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return null
  }

  // Get system metrics
  const [
    totalUsers,
    activeUsers,
    totalCampaigns,
    campaignsSent,
    totalEmailsSent,
    recentUsers,
    recentCampaigns
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: 'SENT' } }),
    prisma.campaignMetrics.aggregate({
      _sum: { totalSent: true }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: true
      }
    }),
    prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        organization: true,
        campaignMetrics: true
      }
    })
  ])

  const stats = {
    totalUsers,
    activeUsers,
    totalCampaigns,
    campaignsSent,
    totalEmailsSent: totalEmailsSent._sum.totalSent || 0,
    deliverabilityRate: 95.2 // This would be calculated from actual data
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          System overview and management
        </p>
      </div>

      <AdminDashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentUsers users={recentUsers} />
        <SystemHealth />
      </div>
    </div>
  )
}

