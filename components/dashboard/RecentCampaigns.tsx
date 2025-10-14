import Link from 'next/link'
import { Mail, Eye, MousePointer, Clock } from 'lucide-react'

interface Campaign {
  id: bigint
  name: string
  status: string
  createdAt: Date
  sendDate: Date | null
  campaignMetrics: {
    totalSent: number
    totalOpened: number
    totalClicked: number
  }[]
}

interface RecentCampaignsProps {
  campaigns: Campaign[]
}

export function RecentCampaigns({ campaigns }: RecentCampaignsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800'
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Campaigns
          </h3>
          <Link
            href="/dashboard/campaigns"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        <div className="mt-5">
          {campaigns.length === 0 ? (
            <div className="text-center py-6">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first campaign.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/campaigns/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Campaign
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const metrics = campaign.campaignMetrics[0]
                const openRate = metrics ? (metrics.totalOpened / metrics.totalSent) * 100 : 0
                const clickRate = metrics ? (metrics.totalClicked / metrics.totalSent) * 100 : 0

                return (
                  <div key={campaign.id.toString()} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {campaign.name}
                        </h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(campaign.createdAt)}
                          </span>
                          {campaign.sendDate && (
                            <span>Sent: {formatDate(campaign.sendDate)}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                    
                    {metrics && (
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {metrics.totalSent.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Sent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {openRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500 flex items-center justify-center">
                            <Eye className="h-3 w-3 mr-1" />
                            Open Rate
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {clickRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500 flex items-center justify-center">
                            <MousePointer className="h-3 w-3 mr-1" />
                            Click Rate
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

