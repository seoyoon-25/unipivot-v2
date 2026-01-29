import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare, hash } from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import KakaoProvider from 'next-auth/providers/kakao'
import NaverProvider from 'next-auth/providers/naver'
import { prisma } from './db'

// OAuth providers - 환경변수가 설정된 경우에만 활성화
const getProviders = () => {
  const providers: any[] = [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error('등록되지 않은 이메일입니다.')
        }

        const isValid = await compare(credentials.password as string, user.password)

        if (!isValid) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }

        if (user.status === 'BANNED') {
          throw new Error('정지된 계정입니다. 관리자에게 문의하세요.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          grade: user.grade,
          profileCompleted: user.profileCompleted,
        }
      },
    }),
  ]

  // Google OAuth - 환경변수가 모두 설정된 경우에만 활성화
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    )
  }

  // Kakao OAuth - 환경변수가 모두 설정된 경우에만 활성화
  if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
    providers.push(
      KakaoProvider({
        clientId: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
      })
    )
  }

  // Naver OAuth - 환경변수가 모두 설정된 경우에만 활성화
  if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
    providers.push(
      NaverProvider({
        clientId: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
      })
    )
  }

  return providers
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: getProviders(),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production'
          ? '.bestcome.org'
          : undefined,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production'
          ? '.bestcome.org'
          : undefined,
      },
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'USER'
        token.grade = (user as { grade?: number }).grade ?? 1
        token.profileCompleted = (user as { profileCompleted?: boolean }).profileCompleted ?? true
      }
      // 세션 업데이트 시 등급 정보 갱신
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, grade: true, profileCompleted: true }
        })
        if (dbUser) {
          token.role = dbUser.role
          token.grade = dbUser.grade
          token.profileCompleted = dbUser.profileCompleted
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
        (session.user as { role?: string }).role = token.role as string
        (session.user as { grade?: number }).grade = token.grade as number
        (session.user as { profileCompleted?: boolean }).profileCompleted = token.profileCompleted as boolean
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          // 소셜 로그인으로 신규 가입 시 profileCompleted = false
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              profileCompleted: false,
            },
          })
          // 신규 사용자의 profileCompleted 상태를 user 객체에 추가
          ;(user as { profileCompleted?: boolean }).profileCompleted = false
        } else {
          // 기존 사용자의 profileCompleted 상태를 user 객체에 추가
          ;(user as { profileCompleted?: boolean }).profileCompleted = existingUser.profileCompleted
        }
      } else {
        // 일반 로그인의 경우 DB에서 profileCompleted 상태 조회
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { profileCompleted: true }
        })
        ;(user as { profileCompleted?: boolean }).profileCompleted = dbUser?.profileCompleted ?? true
      }
      return true
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          target: 'User',
          targetId: user.id,
        },
      })
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}
