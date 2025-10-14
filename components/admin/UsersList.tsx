'use client'

import { useState } from 'react'
import { 
  Mail, 
  Calendar, 
  Shield, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  User,
  Building
} from 'lucide-react'

interface User {
  id: bigint
  email: string
  name: string | null
  roleInOrg: string
  isActive: boolean
  createdAt: Date
  organization: {
    name: string
  } | null
  userRoles: {
    role: {
      code: string
      name: string
    }
  }[]
  subscriptions: {
    plan: {
      name: string
    }
  }[]
}

interface Role {
  id: bigint
  code: string
  name: string
}

interface UsersListProps {
  users: User[]
  roles: Role[]
}

export function UsersList({ users, roles }: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showActions, setShowActions] = useState<bigint | null>(null)

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === '' || 
      user.userRoles.some(ur => ur.role.code === selectedRole)
    
    return matchesSearch && matchesRole
  })

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
      {/* Search and Filter */}
      <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
            >
              <option value="">All roles</option>
              {roles.map(role => (
                <option key={role.id.toString()} value={role.code}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="divide-y divide-gray-200">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedRole 
                ? 'Try adjusting your search or filter criteria.'
                : 'No users have been created yet.'
              }
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id.toString()} className="px-4 py-6 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </h3>
                      <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.roleInOrg)}`}>
                        {user.roleInOrg}
                      </span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </div>
                      {user.organization && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {user.organization.name}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {formatDate(user.createdAt)}
                      </div>
                    </div>
                    
                    {user.subscriptions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          Plan: {user.subscriptions[0].plan.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {showActions === user.id && (
                      <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Eye className="mr-3 h-4 w-4" />
                          View Details
                        </button>
                        <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Edit className="mr-3 h-4 w-4" />
                          Edit User
                        </button>
                        <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Shield className="mr-3 h-4 w-4" />
                          Manage Roles
                        </button>
                        <button className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                          <Trash2 className="mr-3 h-4 w-4" />
                          Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="px-4 py-3 sm:px-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">{filteredUsers.length}</span> of{' '}
                  <span className="font-medium">{filteredUsers.length}</span> results
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

