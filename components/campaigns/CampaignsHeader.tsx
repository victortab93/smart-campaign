'use client'

import Link from 'next/link'
import { Plus, Filter, Download } from 'lucide-react'

interface CampaignsHeaderProps {
  totalCampaigns: number
}

export function CampaignsHeader({ totalCampaigns }: CampaignsHeaderProps) {
  return (
    <div className="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your email campaigns ({totalCampaigns.toLocaleString()} campaigns)
        </p>
      </div>
      
      <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Link>
        </div>
      </div>
    </div>
  )
}

