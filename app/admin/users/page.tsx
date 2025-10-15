import { getServerSession } from 'next-auth'
import { initializeDatabase, Database } from '@/lib/database'
import { UserRepository } from '@/lib/repositories/user.repository'
import { UsersList } from '@/components/admin/UsersList'
import { UsersHeader } from '@/components/admin/UsersHeader'

export default async function AdminUsersPage() {
  const session = await getServerSession()
  
  if (!session) {
    return null
  }

  initializeDatabase()
  const db = new Database()
  const userRepo = new UserRepository(db)

  const usersRaw = await userRepo.findAll(100, 0)
  // map to UI shape expected by UsersList
  const users = usersRaw.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    roleInOrg: u.roleInOrg,
    isActive: u.isActive,
    createdAt: u.createdAt,
    organization: u.organization ? { name: u.organization.name } : null,
    userRoles: u.roles.map(r => ({ role: { code: r.code, name: r.name } })),
    subscriptions: []
  }))

  const roles = await db.query<{ id: bigint; code: string; name: string }>(
    `SELECT id, code, name FROM roles ORDER BY name ASC`
  )
  await db.release()

  return (
    <div className="space-y-6">
      <UsersHeader totalUsers={users.length} />
      <UsersList users={users} roles={roles.rows} />
    </div>
  )
}

