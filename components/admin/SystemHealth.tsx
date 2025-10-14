import { CheckCircle, AlertTriangle, XCircle, Server, Database, Mail, Shield } from 'lucide-react'

const systemChecks = [
  {
    name: 'Database Connection',
    status: 'healthy',
    icon: Database,
    description: 'All database operations are functioning normally'
  },
  {
    name: 'Email Service',
    status: 'healthy',
    icon: Mail,
    description: 'SMTP server is responding correctly'
  },
  {
    name: 'Authentication',
    status: 'healthy',
    icon: Shield,
    description: 'User authentication system is operational'
  },
  {
    name: 'API Endpoints',
    status: 'warning',
    icon: Server,
    description: 'Some API endpoints are experiencing slow response times'
  }
]

export function SystemHealth() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle
      case 'warning':
        return AlertTriangle
      case 'error':
        return XCircle
      default:
        return AlertTriangle
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'error':
        return 'bg-red-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          System Health
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Current system status and performance metrics
        </p>
        
        <div className="mt-6 space-y-4">
          {systemChecks.map((check) => {
            const Icon = check.icon
            const StatusIcon = getStatusIcon(check.status)
            
            return (
              <div key={check.name} className={`rounded-lg p-4 ${getStatusBgColor(check.status)}`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {check.name}
                      </h4>
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(check.status)}`} />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {check.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">45ms</div>
              <div className="text-sm text-gray-500">Avg Response</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

