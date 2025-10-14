import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContactsList } from '@/components/contacts/ContactsList'
import { ContactsHeader } from '@/components/contacts/ContactsHeader'

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return null
  }

  // Get user's contacts
  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { userId: BigInt(session.user.id) },
        { organizationId: session.user.organizationId ? BigInt(session.user.organizationId) : undefined }
      ]
    },
    include: {
      contactTags: true,
      campaignRecipients: {
        include: {
          campaign: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get contact tags for filtering
  const tags = await prisma.contactTag.findMany({
    where: {
      contact: {
        OR: [
          { userId: BigInt(session.user.id) },
          { organizationId: session.user.organizationId ? BigInt(session.user.organizationId) : undefined }
        ]
      }
    },
    select: {
      tag: true
    },
    distinct: ['tag']
  })

  const uniqueTags = tags.map(t => t.tag)

  return (
    <div className="space-y-6">
      <ContactsHeader totalContacts={contacts.length} />
      <ContactsList contacts={contacts} tags={uniqueTags} />
    </div>
  )
}

