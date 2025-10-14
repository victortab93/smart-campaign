import { Users, Mail, Send, BarChart3 } from 'lucide-react'

interface Stats {
  totalContacts: number
  totalCampaigns: number
  activeCampaigns: number
  totalEmailsSent: number
}

interface DashboardStatsProps {
  stats: Stats
}

const statCards = [
  {
    name: 'Total Contacts',
    icon: Users,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    name: 'Total Campaigns',
    icon: Mail,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    name: 'Active Campaigns',
    icon: Send,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  {
    name: 'Emails Sent',
    icon: BarChart3,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  }
]

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statValues = [
    stats.totalContacts,
    stats.totalCampaigns,
    stats.activeCampaigns,
    stats.totalEmailsSent
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => {
        const Icon = card.icon
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
                      {statValues[index].toLocaleString()}
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

