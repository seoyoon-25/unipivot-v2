import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LAB_DOMAIN = process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'bestcome.org'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('host') || ''

  // 리서치랩 도메인 처리 (lab.bestcome.org)
  const isLabDomain = hostname.includes('lab.') || hostname === LAB_DOMAIN

  if (isLabDomain) {
    // 리서치랩 도메인에서 /lab 경로가 아닌 요청은 /lab으로 리라이트
    if (!pathname.startsWith('/lab') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = req.nextUrl.clone()
      url.pathname = `/lab${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // 메인 도메인에서 /lab 경로 접근 시 리서치랩 도메인으로 리다이렉트 (선택적)
  // if (pathname.startsWith('/lab') && !isLabDomain) {
  //   return NextResponse.redirect(new URL(`https://${LAB_DOMAIN}${pathname.replace('/lab', '')}`, req.url))
  // }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
  })
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
    '/lab/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)' // 리서치랩 도메인용 catch-all
  ],
}
