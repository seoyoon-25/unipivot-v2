import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

// 커스텀 코드 생성/수정 스키마
const customCodeSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100),
  description: z.string().optional(),
  type: z.enum(['css', 'javascript', 'html']),
  code: z.string().min(1, '코드를 입력해주세요'),
  language: z.string().optional(),

  // 삽입 위치
  position: z.enum(['head', 'body_start', 'body_end', 'before_closing_head', 'after_opening_body']).default('head'),
  priority: z.number().int().min(0).max(999).default(0),

  // 조건부 로딩
  conditionalLoad: z.boolean().default(false),
  conditions: z.any().optional(),

  // 타겟팅
  targetPages: z.string().optional(), // JSON string
  excludePages: z.string().optional(), // JSON string
  targetDevices: z.string().optional(), // JSON string
  targetRoles: z.string().optional(), // JSON string

  // 스케줄링
  isScheduled: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  // 성능 설정
  async: z.boolean().default(false),
  defer: z.boolean().default(false),
  preload: z.boolean().default(false),

  // 버전 관리
  version: z.string().default('1.0.0'),
  changelog: z.string().optional(),

  // 보안
  isTrusted: z.boolean().default(false),

  // 상태
  isActive: z.boolean().default(true),
  isDevelopment: z.boolean().default(false)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// 코드 해시 생성
function generateCodeHash(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

// 코드 보안 검증
function validateCodeSecurity(code: string, type: string): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = []
  let isValid = true

  if (type === 'javascript') {
    // 위험한 JavaScript 패턴 검사
    const dangerousPatterns = [
      /eval\s*\(/i,
      /document\.write\s*\(/i,
      /innerHTML\s*=/i,
      /outerHTML\s*=/i,
      /execCommand\s*\(/i,
      /\.src\s*=.*javascript:/i,
      /window\.location\s*=.*javascript:/i
    ]

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        warnings.push('잠재적으로 위험한 JavaScript 패턴이 감지되었습니다.')
        isValid = false
      }
    })

    // 외부 리소스 로드 검사
    if (/fetch\s*\(|XMLHttpRequest|ajax/i.test(code)) {
      warnings.push('외부 API 호출이 감지되었습니다.')
    }
  }

  if (type === 'html') {
    // 위험한 HTML 패턴 검사
    const dangerousHTMLPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick, onload 등
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i
    ]

    dangerousHTMLPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        warnings.push('잠재적으로 위험한 HTML 태그나 속성이 감지되었습니다.')
        isValid = false
      }
    })
  }

  return { isValid, warnings }
}

// GET: 커스텀 코드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const position = searchParams.get('position')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (position) {
      where.position = position
    }

    const [customCodes, totalCount] = await Promise.all([
      prisma.customCode.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: {
              executions: true
            }
          }
        }
      }),
      prisma.customCode.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      customCodes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching custom codes:', error)
    return NextResponse.json(
      { error: '커스텀 코드 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 커스텀 코드 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = customCodeSchema.parse(body)

    // 코드 보안 검증
    const securityCheck = validateCodeSecurity(validatedData.code, validatedData.type)
    if (!securityCheck.isValid && !validatedData.isTrusted) {
      return NextResponse.json(
        {
          error: '보안 검사를 통과하지 못했습니다.',
          warnings: securityCheck.warnings
        },
        { status: 400 }
      )
    }

    // 코드 해시 생성
    const codeHash = generateCodeHash(validatedData.code)

    // JSON 문자열 유효성 검증
    const jsonFields = ['targetPages', 'excludePages', 'targetDevices', 'targetRoles']
    const processedData: any = { ...validatedData }

    for (const field of jsonFields) {
      if (processedData[field]) {
        try {
          JSON.parse(processedData[field])
        } catch {
          return NextResponse.json(
            { error: `${field} 필드의 JSON 형식이 올바르지 않습니다.` },
            { status: 400 }
          )
        }
      }
    }

    // 날짜 변환
    if (processedData.startDate) {
      processedData.startDate = new Date(processedData.startDate)
    }
    if (processedData.endDate) {
      processedData.endDate = new Date(processedData.endDate)
    }

    const customCode = await prisma.customCode.create({
      data: {
        ...processedData,
        codeHash,
        hashVerified: true,
        createdBy: userId!
      }
    })

    return NextResponse.json({
      customCode,
      securityWarnings: securityCheck.warnings
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating custom code:', error)
    return NextResponse.json(
      { error: '커스텀 코드 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}