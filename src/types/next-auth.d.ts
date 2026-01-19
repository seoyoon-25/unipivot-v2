import type { DefaultSession, DefaultUser } from 'next-auth'
import type { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      grade: number
      profileCompleted: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    grade: number
    profileCompleted: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    grade: number
    profileCompleted: boolean
  }
}
