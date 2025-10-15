'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Mail, 
  Calendar, 
  Users, 
  Eye, 
  MousePointer, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Copy
} from 'lucide-react'
import type { CampaignListItem } from '@/types/domain'

interface CampaignsListProps {
  campaigns: CampaignListItem[]
}

export function CampaignsList({ campaigns }: CampaignsListProps) {
  const [showActions, setShowActions] = useState<bigint | null>(null)

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Mail className="h-4 w-4" />
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4" />
      case 'DRAFT':
        return <Edit className="h-4 w-4" />
      case 'CANCELLED':
        return <Pause className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="divide-y divide-gray-200">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
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
          campaigns.map((campaign) => {
            const metrics = campaign.campaignMetrics[0]
            const openRate = metrics ? (metrics.totalOpened / metrics.totalSent) * 100 : 0
            const clickRate = metrics ? (metrics.totalClicked / metrics.totalSent) * 100 : 0
            const bounceRate = metrics ? (metrics.totalBounced / metrics.totalSent) * 100 : 0

            return (
              <div key={campaign.id.toString()} className="px-4 py-6 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {campaign.name}
                      </h3>
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1">{campaign.status}</span>
                      </span>
                    </div>
                    
                    {campaign.campaignContent[0]?.subject && (
                      <p className="mt-1 text-sm text-gray-500">
                        Subject: {campaign.campaignContent[0].subject}
                      </p>
                    )}
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created {formatDateShort(campaign.createdAt)}</span>
                      {campaign.sendDate && (
                        <span>Sent {formatDateShort(campaign.sendDate)}</span>
                      )}
                      <span>Plan: {campaign.subscription.plan.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {metrics && (
                      <div className="hidden sm:flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {metrics.totalSent.toLocaleString()}
                          </div>
                          <div className="text-gray-500">Sent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {openRate.toFixed(1)}%
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            Open
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {clickRate.toFixed(1)}%
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <MousePointer className="h-3 w-3 mr-1" />
                            Click
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {bounceRate.toFixed(1)}%
                          </div>
                          <div className="text-gray-500">Bounce</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setShowActions(showActions === campaign.id ? null : campaign.id)}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {showActions === campaign.id && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Link
                            href={`/dashboard/campaigns/${campaign.id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="mr-3 h-4 w-4" />
                            View Details
                          </Link>
                          <Link
                            href={`/dashboard/campaigns/${campaign.id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="mr-3 h-4 w-4" />
                            Edit
                          </Link>
                          <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Copy className="mr-3 h-4 w-4" />
                            Duplicate
                          </button>
                          {campaign.status === 'DRAFT' && (
                            <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <Play className="mr-3 h-4 w-4" />
                              Send Now
                            </button>
                          )}
                          <button className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

