import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { initializeDatabase, Database } from '@/lib/database'
import { UserRepository } from '@/lib/repositories/user.repository'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // Check if user has admin privileges (raw SQL)
  initializeDatabase()
  const db = new Database()
  const userRepo = new UserRepository(db)
  const user = await userRepo.findById(BigInt(session.user.id))
  await db.release()

  if (!user) {
    redirect('/auth/signin')
  }

  const hasAdminAccess = user.roles.some(r => ['SUPER_ADMIN', 'ADMIN_GLOBAL'].includes(r.code))

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

