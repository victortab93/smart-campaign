import { Check, CreditCard, Calendar, AlertCircle } from 'lucide-react'

interface SubscriptionOverviewProps {
  subscription: {
    id: bigint
    status: string
    startDate: Date
    endDate: Date | null
    trialEndDate: Date | null
    autoRenew: boolean
    plan: {
      name: string
      priceMonthly: number
      priceYearly: number | null
      planFeatures: {
        feature: {
          name: string
          type: string
        }
        value: string
      }[]
    }
  }
}

export function SubscriptionOverview({ subscription }: SubscriptionOverviewProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isTrial = subscription.status === 'TRIAL'
  const isActive = subscription.status === 'ACTIVE'

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Current Plan
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {subscription.plan.name} - ${subscription.plan.priceMonthly}/month
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
            {isTrial && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Trial
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Started</p>
                <p className="text-sm text-gray-900">{formatDate(subscription.startDate)}</p>
              </div>
            </div>
          </div>

          {subscription.endDate && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    {isTrial ? 'Trial ends' : 'Next billing'}
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDate(subscription.trialEndDate || subscription.endDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Auto-renewal</p>
                <p className="text-sm text-gray-900">
                  {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subscription.plan.planFeatures.map((planFeature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">
                  {planFeature.feature.name}
                  {planFeature.feature.type === 'limit' && planFeature.value !== 'unlimited' && (
                    <span className="text-gray-500"> ({planFeature.value})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          {isActive && (
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Change Plan
            </button>
          )}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Update Payment Method
          </button>
          {isActive && (
            <button className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

