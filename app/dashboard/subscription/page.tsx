import { getServerSession } from 'next-auth'
import { initializeDatabase, Database } from '@/lib/database'
import { SubscriptionRepository } from '@/lib/repositories/subscription.repository'
import { SubscriptionOverview } from '@/components/subscription/SubscriptionOverview'
import { PlanComparison } from '@/components/subscription/PlanComparison'
import { BillingHistory } from '@/components/subscription/BillingHistory'

export default async function SubscriptionPage() {
  const session = await getServerSession()
  
  if (!session) {
    return null
  }

  initializeDatabase()
  const db = new Database()
  const repo = new SubscriptionRepository(db)
  const active = await repo.findActiveByUserId(BigInt(session.user.id))
  const subscription = active
    ? {
        id: active.id,
        status: active.status,
        startDate: active.start_date,
        endDate: active.end_date,
        trialEndDate: active.trial_end_date,
        autoRenew: active.auto_renew,
        plan: {
          id: active.plan.id,
          code: active.plan.code,
          name: active.plan.name,
          description: active.plan.description,
          priceMonthly: Number(active.plan.price_monthly),
          priceYearly: active.plan.price_yearly ? Number(active.plan.price_yearly) : null,
          planFeatures: active.features.map(f => ({ feature: { name: f.name, type: 'limit' }, value: f.value }))
        },
        invoices: []
      }
    : null

  const plansRaw = await repo.getAllPlans()
  const plans = plansRaw.map(p => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    priceMonthly: Number(p.price_monthly),
    priceYearly: p.price_yearly ? Number(p.price_yearly) : null,
    planFeatures: p.features.map(pf => ({ feature: { name: pf.feature.name, type: pf.feature.type }, value: pf.value }))
  }))
  await db.release()

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

