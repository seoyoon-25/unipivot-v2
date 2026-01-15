import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

// 커스텀 코드 수정 스키마 (일부 필드 수정 불가)
const updateCustomCodeSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100).optional(),
  description: z.string().optional(),
  code: z.string().min(1, '코드를 입력해주세요').optional(),
  language: z.string().optional(),
  position: z.enum(['head', 'body_start', 'body_end', 'before_closing_head', 'after_opening_body']).optional(),
  priority: z.number().int().min(0).max(999).optional(),
  conditionalLoad: z.boolean().optional(),
  conditions: z.any().optional(),
  targetPages: z.string().optional(),
  excludePages: z.string().optional(),
  targetDevices: z.string().optional(),
  targetRoles: z.string().optional(),
  isScheduled: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  async: z.boolean().optional(),
  defer: z.boolean().optional(),
  preload: z.boolean().optional(),
  version: z.string().optional(),
  changelog: z.string().optional(),
  isTrusted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isDevelopment: z.boolean().optional()
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 특정 커스텀 코드 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const customCode = await prisma.customCode.findUnique({
      where: { id: params.id },
      include: {
        executions: {
          orderBy: { executionTime: 'desc' },
          take: 10,
          select: {
            id: true,
            executionTime: true,
            loadTime: true,
            success: true,
            errorMessage: true,
            pageUrl: true,
            deviceType: true
          }
        },
        dependencies: {
          include: {
            dependent: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        dependents: {
          include: {
            parent: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        _count: {
          select: {
            executions: true
          }
        }
      }
    })

    if (!customCode) {
      return NextResponse.json(
        { error: '커스텀 코드를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ customCode })

  } catch (error) {
    console.error('Error fetching custom code:', error)
    return NextResponse.json(
      { error: '커스텀 코드를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 커스텀 코드 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const existingCode = await prisma.customCode.findUnique({
      where: { id: params.id }
    })

    if (!existingCode) {
      return NextResponse.json(
        { error: '커스텀 코드를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateCustomCodeSchema.parse(body)

    // 코드가 변경된 경우 해시 재생성
    let codeHash = existingCode.codeHash
    let hashVerified = existingCode.hashVerified

    if (validatedData.code && validatedData.code !== existingCode.code) {
      codeHash = crypto.createHash('sha256').update(validatedData.code).digest('hex')
      hashVerified = true

      // 보안 검증 (신뢰할 수 있는 코드가 아닌 경우)
      if (!validatedData.isTrusted && !existingCode.isTrusted) {
        // 간단한 보안 검사
        if (validatedData.code.includes('eval(') || validatedData.code.includes('document.write')) {
          return NextResponse.json(
            { error: '보안상 위험한 코드가 포함되어 있습니다.' },
            { status: 400 }
          )
        }
      }
    }

    // JSON 필드 유효성 검증
    const jsonFields = ['targetPages', 'excludePages', 'targetDevices', 'targetRoles']
    for (const field of jsonFields) {
      if (validatedData[field as keyof typeof validatedData]) {
        try {
          JSON.parse(validatedData[field as keyof typeof validatedData] as string)
        } catch {
          return NextResponse.json(
            { error: `${field} 필드의 JSON 형식이 올바르지 않습니다.` },
            { status: 400 }
          )
        }
      }
    }

    // 날짜 변환
    const updateData: any = { ...validatedData }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate)
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate)
    }

    const updatedCode = await prisma.customCode.update({
      where: { id: params.id },
      data: {
        ...updateData,
        codeHash,
        hashVerified,
        updatedBy: userId!
      }
    })

    return NextResponse.json({ customCode: updatedCode })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating custom code:', error)
    return NextResponse.json(
      { error: '커스텀 코드 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 커스텀 코드 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const existingCode = await prisma.customCode.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            dependents: true // 이 코드에 의존하는 다른 코드들
          }
        }
      }
    })

    if (!existingCode) {
      return NextResponse.json(
        { error: '커스텀 코드를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 의존성이 있는 경우 경고
    if (existingCode._count.dependents > 0) {
      return NextResponse.json(
        { error: `${existingCode._count.dependents}개의 다른 코드가 이 코드에 의존하고 있습니다. 먼저 의존성을 해제해주세요.` },
        { status: 400 }
      )
    }

    await prisma.customCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting custom code:', error)
    return NextResponse.json(
      { error: '커스텀 코드 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}