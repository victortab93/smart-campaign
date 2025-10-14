'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  Tag, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter
} from 'lucide-react'

interface Contact {
  id: bigint
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  createdAt: Date
  contactTags: { tag: string }[]
  campaignRecipients: {
    campaign: {
      name: string
    }
  }[]
}

interface ContactsListProps {
  contacts: Contact[]
  tags: string[]
}

export function ContactsList({ contacts, tags }: ContactsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [showActions, setShowActions] = useState<bigint | null>(null)

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = selectedTag === '' || 
      contact.contactTags.some(tag => tag.tag === selectedTag)
    
    return matchesSearch && matchesTag
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
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
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All tags</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="divide-y divide-gray-200">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedTag 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first contact.'
              }
            </p>
            {!searchTerm && !selectedTag && (
              <div className="mt-6">
                <Link
                  href="/dashboard/contacts/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Contact
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div key={contact.id.toString()} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {contact.firstName?.charAt(0) || contact.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        {contact.firstName && contact.lastName 
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.firstName || contact.email
                        }
                      </h3>
                      {contact.contactTags.length > 0 && (
                        <div className="ml-2 flex space-x-1">
                          {contact.contactTags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag.tag}
                            </span>
                          ))}
                          {contact.contactTags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{contact.contactTags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {contact.phone}
                        </div>
                      )}
                      <div>Added {formatDate(contact.createdAt)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {contact.campaignRecipients.length} campaigns
                  </span>
                  
                  <div className="relative">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowActions(showActions === contact.id ? null : contact.id)}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {showActions === contact.id && (
                      <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Link
                          href={`/dashboard/contacts/${contact.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="mr-3 h-4 w-4" />
                          View Details
                        </Link>
                        <Link
                          href={`/dashboard/contacts/${contact.id}/edit`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="mr-3 h-4 w-4" />
                          Edit
                        </Link>
                        <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Trash2 className="mr-3 h-4 w-4" />
                          Delete
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
      {filteredContacts.length > 0 && (
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
                  <span className="font-medium">{filteredContacts.length}</span> of{' '}
                  <span className="font-medium">{filteredContacts.length}</span> results
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

