import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LAB_DOMAIN = process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'bestcome.org'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('host') || ''

  // 유니클럽 도메인 처리 (club.bestcome.org)
  const isClubDomain = hostname.startsWith('club.')
  if (isClubDomain) {
    if (!pathname.startsWith('/club') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      const url = req.nextUrl.clone()
      url.pathname = `/club${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // 메인 도메인에서 /bookshelf 접근 시 클럽 도메인으로 리다이렉트
  if (!isClubDomain && pathname.startsWith('/bookshelf')) {
    const clubUrl = new URL(`https://club.${MAIN_DOMAIN}/bookclub/bookshelf`)
    return NextResponse.redirect(clubUrl)
  }

  // 리서치랩 도메인 처리 (lab.bestcome.org)
  const isLabDomain = hostname.includes('lab.') || hostname === LAB_DOMAIN

  // 토큰 가져오기 (모든 경로에서 필요)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
  })
  const isLoggedIn = !!token
  const isAdmin = token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'

  // 리서치랩 도메인 처리
  if (isLabDomain) {
    // 리서치랩 도메인에서 /lab 경로가 아닌 요청은 /lab으로 리라이트
    if (!pathname.startsWith('/lab') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      const url = req.nextUrl.clone()
      url.pathname = `/lab${pathname}`
      return NextResponse.rewrite(url)
    }

    // 리서치랩 인증 필수 (로그인/회원가입 페이지 제외)
    const labPublicPaths = ['/login', '/register', '/forgot-password']
    const isLabPublicPath = labPublicPaths.some(p => pathname.startsWith(p))

    if (!isLabPublicPath && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      if (!isLoggedIn) {
        // 메인 도메인 로그인 페이지로 리다이렉트 (callback URL 포함)
        const callbackUrl = `https://${LAB_DOMAIN}${pathname}`
        const loginUrl = new URL(`https://${MAIN_DOMAIN}/login`)
        loginUrl.searchParams.set('callbackUrl', callbackUrl)
        return NextResponse.redirect(loginUrl)
      }
    }

    return NextResponse.next()
  }

  // 리서치랩 경로 인증 필수 (메인 도메인에서 접근 시)
  const isLabRoute = pathname.startsWith('/lab')
  if (isLabRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 회원 전용 페이지
  const memberRoutes = ['/my', '/my/profile', '/my/programs', '/my/reports', '/my/points', '/my/settings', '/my/applications', '/my/likes', '/my/notifications']
  const isMemberRoute = memberRoutes.some((route) => pathname.startsWith(route))

  // 관리자 전용 페이지
  const isAdminRoute = pathname.startsWith('/admin')

  // 인증 페이지 (로그인한 사용자는 접근 불가)
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthRoute = authRoutes.includes(pathname) || pathname.startsWith('/reset-password')

  // 프로필 완성 페이지
  const isCompleteProfilePage = pathname === '/complete-profile'

  // 로그인한 사용자가 인증 페이지에 접근하면 메인으로 리다이렉트
  // 단, 프로필 미완성 사용자는 complete-profile로
  if (isAuthRoute && isLoggedIn) {
    if (token?.profileCompleted === false) {
      return NextResponse.redirect(new URL('/complete-profile', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  // 프로필 미완성 사용자가 다른 페이지에 접근하면 complete-profile로 리다이렉트
  // (API 경로, 정적 파일, 인증 페이지, complete-profile 페이지 제외)
  const isExemptFromProfileCheck =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    isAuthRoute ||
    isCompleteProfilePage ||
    pathname === '/' // 메인 페이지는 허용

  if (isLoggedIn && token?.profileCompleted === false && !isExemptFromProfileCheck) {
    const completeProfileUrl = new URL('/complete-profile', req.nextUrl)
    completeProfileUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(completeProfileUrl)
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
    '/reset-password',
    '/complete-profile',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)' // 리서치랩 도메인용 catch-all
  ],
}
