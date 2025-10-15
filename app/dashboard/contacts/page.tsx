import { getServerSession } from 'next-auth'
import { initializeDatabase, Database } from '@/lib/database'
import { ContactRepository } from '@/lib/repositories/contact.repository'
import { ContactsList } from '@/components/contacts/ContactsList'
import { ContactsHeader } from '@/components/contacts/ContactsHeader'

export default async function ContactsPage() {
  const session = await getServerSession()
  
  if (!session) {
    return null
  }

  initializeDatabase()
  const db = new Database()
  const repo = new ContactRepository(db)

  const contactsRaw = await repo.findAll({
    userId: BigInt(session.user.id),
    organizationId: session.user.organizationId ? BigInt(session.user.organizationId) : undefined
  })
  const contacts = contactsRaw.map(c => ({
    id: c.id,
    userId: c.userId,
    organizationId: c.organizationId,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    contactTags: c.tags.map(tag => ({ tag })),
    campaignRecipients: []
  }))

  const uniqueTags = await repo.getTags(BigInt(session.user.id), session.user.organizationId ? BigInt(session.user.organizationId) : undefined)
  await db.release()

  return (
    <div className="space-y-6">
      <ContactsHeader totalContacts={contacts.length} />
      <ContactsList contacts={contacts} tags={uniqueTags} />
    </div>
  )
}

