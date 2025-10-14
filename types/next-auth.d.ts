import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      organizationId?: string
      roleInOrg?: string
      roles?: string[]
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    organizationId?: string
    roleInOrg?: string
    roles?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    organizationId?: string
    roleInOrg?: string
    roles?: string[]
  }
}

