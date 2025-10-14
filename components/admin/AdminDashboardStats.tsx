import { Users, Mail, Send, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalCampaigns: number
  campaignsSent: number
  totalEmailsSent: number
  deliverabilityRate: number
}

interface AdminDashboardStatsProps {
  stats: Stats
}

const statCards = [
  {
    name: 'Total Users',
    icon: Users,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    value: 'totalUsers'
  },
  {
    name: 'Active Users',
    icon: TrendingUp,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    value: 'activeUsers'
  },
  {
    name: 'Total Campaigns',
    icon: Mail,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    value: 'totalCampaigns'
  },
  {
    name: 'Campaigns Sent',
    icon: Send,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    value: 'campaignsSent'
  },
  {
    name: 'Emails Sent',
    icon: BarChart3,
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    value: 'totalEmailsSent'
  },
  {
    name: 'Deliverability Rate',
    icon: AlertTriangle,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    value: 'deliverabilityRate',
    suffix: '%'
  }
]

export function AdminDashboardStats({ stats }: AdminDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.value as keyof Stats]
        const displayValue = typeof value === 'number' 
          ? value.toLocaleString() 
          : value
        const suffix = card.suffix || ''

        return (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {displayValue}{suffix}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

