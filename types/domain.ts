export type CampaignListItem = {
  id: bigint
  name: string
  status: string
  createdAt: Date
  sendDate: Date | null
  campaignContent: {
    subject: string | null
  }[]
  campaignMetrics: {
    totalSent: number
    totalOpened: number
    totalClicked: number
    totalBounced: number
  }[]
  subscription: {
    plan: {
      name: string
    }
  }
}

export type RecentCampaignItem = {
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

export type PlanFeatureItem = {
  feature: {
    name: string
    type: string
  }
  value: string
}

export type PlanOption = {
  id: bigint
  code: string
  name: string
  description: string | null
  priceMonthly: number
  priceYearly: number | null
  planFeatures: PlanFeatureItem[]
}

export type InvoiceItem = {
  id: bigint
  amount: number
  currency: string
  status: string
  issuedAt: Date
  paidAt: Date | null
  paymentProvider: string | null
  paymentReference: string | null
}

export type SubscriptionSummary = {
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
    planFeatures: PlanFeatureItem[]
  }
}


