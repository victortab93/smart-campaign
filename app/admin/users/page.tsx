import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UsersList } from '@/components/admin/UsersList'
import { UsersHeader } from '@/components/admin/UsersHeader'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return null
  }

  // Get all users with their organizations and roles
  const users = await prisma.user.findMany({
    include: {
      organization: true,
      userRoles: {
        include: {
          role: true
        }
      },
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: {
          plan: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get all roles for filtering
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      <UsersHeader totalUsers={users.length} />
      <UsersList users={users} roles={roles} />
    </div>
  )
}

