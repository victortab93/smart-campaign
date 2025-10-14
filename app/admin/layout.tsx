import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Check if user has admin privileges
  const user = await prisma.user.findUnique({
    where: { id: BigInt(session.user.id) },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const hasAdminAccess = user.userRoles.some(ur => 
    ['SUPER_ADMIN', 'ADMIN_GLOBAL'].includes(ur.role.code)
  )

  if (!hasAdminAccess) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader user={session.user} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

