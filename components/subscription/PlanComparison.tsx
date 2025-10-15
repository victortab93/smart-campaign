'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'
import type { PlanOption } from '@/types/domain'

interface PlanComparisonProps {
  plans: PlanOption[]
  currentPlan?: PlanOption
}

export function PlanComparison({ plans, currentPlan }: PlanComparisonProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const getPrice = (plan: PlanOption) => {
    return billingCycle === 'yearly' && plan.priceYearly 
      ? plan.priceYearly 
      : plan.priceMonthly
  }

  const getBillingText = (plan: PlanOption) => {
    return billingCycle === 'yearly' && plan.priceYearly 
      ? '/year' 
      : '/month'
  }

  const isCurrentPlan = (plan: PlanOption) => {
    return currentPlan?.id === plan.id
  }

  const getFeatureValue = (plan: PlanOption, featureName: string) => {
    const planFeature = plan.planFeatures.find(pf => pf.feature.name === featureName)
    return planFeature?.value || 'false'
  }

  const startCheckout = async (plan: PlanOption) => {
    try {
      const referenceId = `sub-${plan.id}-${Date.now()}`
      const res = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getPrice(plan).toFixed(2),
          currency: 'USD',
          referenceId,
          description: `SmartCampaign ${plan.name} plan`,
          returnUrl: `${window.location.origin}/dashboard/subscription?status=approved`,
          cancelUrl: `${window.location.origin}/dashboard/subscription?status=cancelled`
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create order')
      if (data.approveUrl) {
        window.location.href = data.approveUrl
      } else {
        toast.error('No approval link from PayPal')
      }
    } catch (err) {
      toast.error('Checkout failed')
    }
  }

  // Get all unique features across all plans
  const allFeatures = Array.from(
    new Set(plans.flatMap(plan => plan.planFeatures.map(pf => pf.feature.name)))
  )

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Available Plans
          </h3>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md border ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              {billingCycle === 'yearly' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Save 20%
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id.toString()}
              className={`relative rounded-lg border p-6 ${
                isCurrentPlan(plan)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              {isCurrentPlan(plan) && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center">
                <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${getPrice(plan)}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    {getBillingText(plan)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <ul className="space-y-3">
                  {allFeatures.map((featureName) => {
                    const value = getFeatureValue(plan, featureName)
                    const hasFeature = value === 'true' || value === 'unlimited' || (value !== 'false' && !isNaN(Number(value)))
                    
                    return (
                      <li key={featureName} className="flex items-start">
                        {hasFeature ? (
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 mt-0.5" />
                        )}
                        <span className="ml-3 text-sm text-gray-700">
                          {featureName}
                          {value !== 'true' && value !== 'false' && value !== 'unlimited' && hasFeature && (
                            <span className="text-gray-500"> ({value})</span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="mt-6">
                {isCurrentPlan(plan) ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-sm font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button onClick={() => startCheckout(plan)} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {currentPlan ? 'Switch Plan' : 'Get Started'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

