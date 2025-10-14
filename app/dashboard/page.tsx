import { cookies } from 'next/headers'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentCampaigns } from '@/components/dashboard/RecentCampaigns'
import { QuickActions } from '@/components/dashboard/QuickActions'

async function getDashboardData() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  try {
    const [statsResponse, campaignsResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/stats`, {
        headers: {
          'Cookie': `auth-token=${token}`
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/campaigns?limit=5`, {
        headers: {
          'Cookie': `auth-token=${token}`
        }
      })
    ])

    if (!statsResponse.ok || !campaignsResponse.ok) {
      return null
    }

    const [statsData, campaignsData] = await Promise.all([
      statsResponse.json(),
      campaignsResponse.json()
    ])

    return {
      stats: statsData.stats,
      campaigns: campaignsData.campaigns || []
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  
  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Loading dashboard data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your campaigns.
        </p>
      </div>

      <DashboardStats stats={data.stats} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentCampaigns campaigns={data.campaigns} />
        <QuickActions />
      </div>
    </div>
  )
}
