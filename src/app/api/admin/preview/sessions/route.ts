import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// 미리보기 세션 생성 스키마
const createPreviewSessionSchema = z.object({
  title: z.string().min(1, '세션 제목을 입력해주세요'),
  description: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  password: z.string().optional(),
  allowEdit: z.boolean().default(false),
  isPublic: z.boolean().default(false)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 미리보기 세션 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {
      userId // 본인이 만든 세션만 조회
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [sessions, total] = await Promise.all([
      prisma.previewSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          snapshots: {
            select: { id: true, name: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 3
          },
          _count: {
            select: { snapshots: true, changes: true }
          }
        }
      }),
      prisma.previewSession.count({ where })
    ])

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching preview sessions:', error)
    return NextResponse.json(
      { error: '미리보기 세션 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 미리보기 세션 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPreviewSessionSchema.parse(body)

    // 세션 키 생성 (고유하고 추측하기 어려운 키)
    const sessionKey = crypto.randomBytes(16).toString('hex')

    // 비밀번호가 있으면 해시 처리
    let hashedPassword = null
    if (validatedData.password) {
      hashedPassword = await bcrypt.hash(validatedData.password, 12)
    }

    // 공유 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/preview/${sessionKey}`

    const session = await prisma.previewSession.create({
      data: {
        userId: userId!,
        sessionKey,
        title: validatedData.title,
        description: validatedData.description,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        password: hashedPassword,
        allowEdit: validatedData.allowEdit,
        isPublic: validatedData.isPublic,
        shareUrl
      }
    })

    // 현재 사이트 상태의 초기 스냅샷 생성
    await createInitialSnapshot(session.id, userId!)

    return NextResponse.json({ session }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating preview session:', error)
    return NextResponse.json(
      { error: '미리보기 세션 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 초기 스냅샷 생성 함수
async function createInitialSnapshot(sessionId: string, userId: string) {
  try {
    // 현재 사이트 설정들 수집
    const [sections, banners, floatingButtons, seoSettings, globalSeoSettings] = await Promise.all([
      prisma.siteSection.findMany({
        where: { isVisible: true },
        orderBy: { order: 'asc' }
      }),
      prisma.announcementBanner.findMany({
        where: { isActive: true }
      }),
      prisma.floatingButton.findMany({
        where: { isActive: true }
      }),
      prisma.seoSetting.findMany({
        where: { isActive: true }
      }),
      prisma.globalSeoSetting.findMany()
    ])

    const fullData = {
      sections,
      banners,
      floatingButtons,
      seoSettings,
      globalSeoSettings,
      timestamp: new Date().toISOString()
    }

    // 체크섬 생성
    const crypto = require('crypto')
    const checksum = crypto
      .createHash('md5')
      .update(JSON.stringify(fullData))
      .digest('hex')

    await prisma.previewSnapshot.create({
      data: {
        sessionId,
        name: '초기 스냅샷',
        description: '세션 생성 시점의 사이트 상태',
        dataType: 'full',
        data: JSON.stringify(fullData),
        checksum,
        createdBy: userId
      }
    })
  } catch (error) {
    console.error('Error creating initial snapshot:', error)
    // 초기 스냅샷 생성 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}