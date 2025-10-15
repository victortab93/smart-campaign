import { getServerSession } from 'next-auth'
import { initializeDatabase, Database } from '@/lib/database'
import { UserRepository } from '@/lib/repositories/user.repository'
import { CampaignRepository } from '@/lib/repositories/campaign.repository'
import { AdminDashboardStats } from '@/components/admin/AdminDashboardStats'
import { RecentUsers } from '@/components/admin/RecentUsers'
import { SystemHealth } from '@/components/admin/SystemHealth'

export default async function AdminDashboardPage() {
  const session = await getServerSession()
  
  if (!session) {
    return null
  }

  // Get system metrics
  initializeDatabase()
  const db = new Database()
  const userRepo = new UserRepository(db)
  const campRepo = new CampaignRepository(db)

  const [totalUsers, activeUsers, campaignsStats, recentUsersRaw, recentCampaignsRaw] = await Promise.all([
    userRepo.count(),
    userRepo.countActive(),
    campRepo.getStats(),
    userRepo.findAll(5, 0),
    campRepo.findAll({ limit: 5, offset: 0 })
  ])

  const totalEmailsSent = { _sum: { totalSent: 0 } }
  // Approximate emails sent from latest metrics if available
  const emailsSum = recentCampaignsRaw.reduce((sum, c) => sum + (c.metrics[0]?.total_sent || 0), 0)
  totalEmailsSent._sum.totalSent = emailsSum

  const recentUsers = recentUsersRaw
  const recentCampaigns = recentCampaignsRaw.map(c => ({
    id: c.id,
    name: c.name,
    status: c.status,
    createdAt: c.created_at,
    sendDate: c.send_date,
    campaignMetrics: c.metrics.map(m => ({
      totalSent: m.total_sent,
      totalOpened: m.total_opened,
      totalClicked: m.total_clicked
    }))
  }))

  await db.release()

  const stats = {
    totalUsers,
    activeUsers,
    totalCampaigns: campaignsStats.total,
    campaignsSent: campaignsStats.sent,
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

