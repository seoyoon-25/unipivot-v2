import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  const isAdmin = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'

  // 회원 전용 페이지
  const memberRoutes = ['/my', '/my/profile', '/my/programs', '/my/reports', '/my/points', '/my/settings']
  const isMemberRoute = memberRoutes.some((route) => pathname.startsWith(route))

  // 관리자 전용 페이지
  const isAdminRoute = pathname.startsWith('/admin')

  // 인증 페이지 (로그인한 사용자는 접근 불가)
  const authRoutes = ['/login', '/register', '/forgot-password']
  const isAuthRoute = authRoutes.includes(pathname)

  // 로그인한 사용자가 인증 페이지에 접근하면 메인으로 리다이렉트
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  // 회원 전용 페이지에 비로그인 사용자가 접근하면 로그인으로 리다이렉트
  if (isMemberRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 관리자 페이지에 비관리자가 접근하면 메인으로 리다이렉트
  if (isAdminRoute && !isAdmin) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.nextUrl)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/my/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
}
