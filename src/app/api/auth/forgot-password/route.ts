import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 보안상 사용자 존재 여부와 관계없이 성공 응답
    // (악의적 사용자가 등록된 이메일을 확인하는 것을 방지)
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // 소셜 로그인 사용자인 경우 (비밀번호가 없는 경우)
    if (!user.password) {
      // 계정이 연결된 소셜 로그인 제공자 확인
      const accounts = await prisma.account.findMany({
        where: { userId: user.id },
        select: { provider: true }
      })
      
      const providers = accounts.map(a => {
        if (a.provider === 'google') return 'Google'
        if (a.provider === 'kakao') return '카카오'
        if (a.provider === 'naver') return '네이버'
        return a.provider
      }).join(', ')

      return NextResponse.json(
        { error: `이 계정은 ${providers} 로그인으로 가입되었습니다. 해당 서비스로 로그인해주세요.` },
        { status: 400 }
      )
    }

    // 기존 토큰 삭제
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // 새 토큰 생성
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1시간 후 만료

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // 이메일 발송
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://bestcome.org'
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    const emailSent = await sendPasswordResetEmail(email, resetLink)

    if (!emailSent) {
      return NextResponse.json(
        { error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
