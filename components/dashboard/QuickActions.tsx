import Link from 'next/link'
import { Plus, Users, Mail, FileText, BarChart3 } from 'lucide-react'

const quickActions = [
  {
    name: 'Create Campaign',
    description: 'Start a new email campaign',
    href: '/dashboard/campaigns/new',
    icon: Plus,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    name: 'Import Contacts',
    description: 'Add contacts from CSV/Excel',
    href: '/dashboard/contacts/import',
    icon: Users,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    name: 'Create Template',
    description: 'Design a new email template',
    href: '/dashboard/templates/new',
    icon: FileText,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    name: 'View Analytics',
    description: 'Check campaign performance',
    href: '/dashboard/analytics',
    icon: BarChart3,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  }
]

export function QuickActions() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Quick Actions
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started with these common tasks
        </p>
        
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.name}
                href={action.href}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 ${action.bgColor} group-hover:bg-opacity-75`}>
                    <Icon className={`h-6 w-6 ${action.textColor}`} />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
                <span
                  className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

