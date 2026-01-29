import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// 키워드 추출 함수
function extractKeywords(text: string): string[] {
  // 기본 불용어
  const stopWords = ['이', '가', '은', '는', '을', '를', '에', '의', '와', '과', '도', '로', '으로', '에서', '부터', '까지', '하고', '그리고', '또는', '및']

  // 공백으로 분리하고 정리
  const words = text
    .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, ' ') // 특수문자 제거
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2 && !stopWords.includes(w))

  return Array.from(new Set(words)) // 중복 제거
}

// IP 해시 함수
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

// 키워드 연결 생성/업데이트 함수
async function createOrUpdateConnection(fromKeywordId: string, toKeywordId: string) {
  // 항상 작은 ID가 먼저 오도록 정렬 (중복 방지)
  const [firstId, secondId] = [fromKeywordId, toKeywordId].sort()

  try {
    // upsert: 있으면 strength +1, 없으면 생성
    await prisma.keywordConnection.upsert({
      where: {
        fromKeywordId_toKeywordId: {
          fromKeywordId: firstId,
          toKeywordId: secondId
        }
      },
      update: {
        strength: { increment: 1 }
      },
      create: {
        fromKeywordId: firstId,
        toKeywordId: secondId,
        strength: 1
      }
    })
  } catch (error) {
    console.error('Connection creation error:', error)
  }
}

// 여러 키워드 간 모든 연결 생성
async function createKeywordConnections(keywordIds: string[]) {
  if (keywordIds.length < 2) return

  // 모든 쌍에 대해 연결 생성
  for (let i = 0; i < keywordIds.length; i++) {
    for (let j = i + 1; j < keywordIds.length; j++) {
      await createOrUpdateConnection(keywordIds[i], keywordIds[j])
    }
  }
}

// GET - 관심사 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keywordId = searchParams.get('keywordId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (keywordId) {
      where.keywordId = keywordId
    }

    const [interests, total] = await Promise.all([
      prisma.interest.findMany({
        where,
        include: {
          keyword: true,
          user: {
            select: { id: true, name: true, image: true }
          },
          _count: {
            select: { likes: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.interest.count({ where })
    ])

    return NextResponse.json({
      interests: interests.map(i => ({
        ...i,
        likeCount: i._count.likes,
        _count: undefined,
      })),
      total,
      hasMore: offset + interests.length < total
    })
  } catch (error) {
    console.error('Get interests error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 관심사 등록 (단일 키워드 또는 복수 키워드)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { keyword, keywords, content, visibility = 'ANONYMOUS', nickname } = body

    // 단일 키워드 또는 복수 키워드 배열 처리
    let keywordList: string[] = []
    if (keywords && Array.isArray(keywords)) {
      keywordList = keywords.map((k: string) => k.trim()).filter((k: string) => k.length > 0)
    } else if (keyword && keyword.trim().length > 0) {
      keywordList = [keyword.trim()]
    }

    if (keywordList.length === 0) {
      return NextResponse.json(
        { error: '관심 키워드를 입력해주세요' },
        { status: 400 }
      )
    }

    // 최대 5개까지만 허용
    if (keywordList.length > 5) {
      return NextResponse.json(
        { error: '한 번에 최대 5개까지만 입력할 수 있습니다' },
        { status: 400 }
      )
    }

    // IP 해시 추출 (중복 방지용)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    const ipHash = hashIP(ip)

    // 세션 ID 생성 (비회원용)
    const sessionId = request.cookies.get('interest_session')?.value || crypto.randomUUID()

    // 오늘 입력 횟수 확인
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayCount = await prisma.interest.count({
      where: {
        createdAt: { gte: today },
        OR: [
          { userId: session?.user?.id },
          { sessionId: sessionId },
          { ipHash: ipHash }
        ]
      }
    })

    // 하루 최대 횟수 확인
    const maxPerDay = await prisma.interestSetting.findUnique({
      where: { key: 'maxInterestsPerDay' }
    })
    const maxCount = parseInt(maxPerDay?.value || '3')

    // 남은 등록 가능 횟수
    const remainingCount = maxCount - todayCount
    if (remainingCount <= 0) {
      return NextResponse.json(
        { error: `하루에 ${maxCount}개까지만 입력할 수 있습니다` },
        { status: 429 }
      )
    }

    // 등록 가능한 만큼만 처리
    const keywordsToProcess = keywordList.slice(0, remainingCount)

    // 닉네임 결정
    let displayNickname = null
    if (visibility === 'MEMBER' && session?.user) {
      displayNickname = session.user.name
    } else if (visibility === 'NICKNAME' && nickname) {
      displayNickname = nickname
    }

    const createdInterests = []
    const createdKeywordIds: string[] = []

    // 각 키워드에 대해 처리
    for (const kw of keywordsToProcess) {
      // 키워드 찾기 또는 생성
      let keywordRecord = await prisma.interestKeyword.findUnique({
        where: { keyword: kw }
      })

      if (!keywordRecord) {
        keywordRecord = await prisma.interestKeyword.create({
          data: {
            keyword: kw,
            totalCount: 0,
            monthlyCount: 0,
            likeCount: 0,
          }
        })
      }

      // 관심사 생성
      const interest = await prisma.interest.create({
        data: {
          keywordId: keywordRecord.id,
          content: content?.trim() || null,
          userId: session?.user?.id || null,
          sessionId: session?.user ? null : sessionId,
          nickname: displayNickname,
          visibility,
          ipHash,
        },
        include: {
          keyword: true,
        }
      })

      // 키워드 카운트 업데이트
      await prisma.interestKeyword.update({
        where: { id: keywordRecord.id },
        data: {
          totalCount: { increment: 1 },
          monthlyCount: { increment: 1 },
          lastUsedAt: new Date(),
        }
      })

      createdInterests.push(interest)
      createdKeywordIds.push(keywordRecord.id)
    }

    // 복수 키워드인 경우 연결 생성
    if (createdKeywordIds.length > 1) {
      await createKeywordConnections(createdKeywordIds)
    }

    // 세션 쿠키 설정을 위한 응답
    const response = NextResponse.json({
      success: true,
      interests: createdInterests,
      interest: createdInterests[0], // 하위 호환성
      message: createdInterests.length === 1
        ? '관심사가 등록되었습니다'
        : `${createdInterests.length}개의 관심사가 등록되었습니다`,
      remaining: maxCount - todayCount - createdInterests.length
    })

    // 비회원의 경우 세션 쿠키 설정
    if (!session?.user) {
      response.cookies.set('interest_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1년
      })
    }

    return response
  } catch (error) {
    console.error('Create interest error:', error)
    return NextResponse.json(
      { error: '등록 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
