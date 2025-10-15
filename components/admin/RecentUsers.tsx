import Link from 'next/link'
import { User, Mail, Calendar, Shield, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { UserWithRoles } from '@/lib/repositories/user.repository'


interface RecentUsersProps {
  users: UserWithRoles[]
}

export function RecentUsers({ users }: RecentUsersProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800'
      case 'ADMIN_GLOBAL':
        return 'bg-orange-100 text-orange-800'
      case 'OWNER':
        return 'bg-blue-100 text-blue-800'
      case 'ADMIN_ORG':
        return 'bg-green-100 text-green-800'
      case 'EDITOR':
        return 'bg-purple-100 text-purple-800'
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Users
          </h3>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            View all
          </Link>
        </div>
        
        <div className="mt-5">
          {users.length === 0 ? (
            <div className="text-center py-6">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
              <p className="mt-1 text-sm text-gray-500">
                No users have been created yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id.toString()} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {user.name || user.email}
                          </h4>
                          <div className="flex items-center mt-1">
                            <Mail className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {formatDate(user.createdAt)}
                        </span>
                        {user.organization && (
                          <span>{user.organization.name}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.roleInOrg)}`}>
                        {user.roleInOrg}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <div className="relative">
                        <button className="p-1 text-gray-400 hover:text-gray-500">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

