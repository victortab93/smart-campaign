import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubscriptionOverview } from '@/components/subscription/SubscriptionOverview'
import { PlanComparison } from '@/components/subscription/PlanComparison'
import { BillingHistory } from '@/components/subscription/BillingHistory'

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return null
  }

  // Get user's current subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { userId: BigInt(session.user.id) },
        { organizationId: session.user.organizationId ? BigInt(session.user.organizationId) : undefined }
      ],
      status: 'ACTIVE'
    },
    include: {
      plan: {
        include: {
          planFeatures: {
            include: {
              feature: true
            }
          }
        }
      },
      invoices: {
        orderBy: { issuedAt: 'desc' },
        take: 10
      }
    }
  })

  // Get all available plans
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    include: {
      planFeatures: {
        include: {
          feature: true
        }
      }
    },
    orderBy: { priceMonthly: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription and billing
        </p>
      </div>

      {subscription ? (
        <>
          <SubscriptionOverview subscription={subscription} />
          <BillingHistory invoices={subscription.invoices} />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active subscription</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a plan to get started with SmartCampaign.
          </p>
        </div>
      )}

      <PlanComparison plans={plans} currentPlan={subscription?.plan} />
    </div>
  )
}

