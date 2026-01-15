import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

interface RouteParams {
  params: Promise<{ sessionKey: string }>
}

// GET: 미리보기 세션 데이터 조회 (공개)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionKey } = await params
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')
    const snapshotId = searchParams.get('snapshotId')

    // 세션 조회
    const session = await prisma.previewSession.findUnique({
      where: { sessionKey },
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 활성화 및 만료 확인
    if (!session.isActive) {
      return NextResponse.json(
        { error: '비활성화된 미리보기 세션입니다.' },
        { status: 403 }
      )
    }

    if (session.expiresAt && new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: '만료된 미리보기 세션입니다.' },
        { status: 410 }
      )
    }

    // 비밀번호 확인
    if (session.password) {
      if (!password) {
        return NextResponse.json(
          { error: '비밀번호가 필요합니다.', requiresPassword: true },
          { status: 401 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, session.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: '잘못된 비밀번호입니다.' },
          { status: 401 }
        )
      }
    }

    // 조회수 증가 (비동기)
    prisma.previewSession.update({
      where: { id: session.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date()
      }
    }).catch(console.error)

    // 특정 스냅샷 조회
    let currentSnapshot = session.snapshots[0] // 최신 스냅샷
    if (snapshotId) {
      const requestedSnapshot = session.snapshots.find(s => s.id === snapshotId)
      if (requestedSnapshot) {
        currentSnapshot = requestedSnapshot
      }
    }

    if (!currentSnapshot) {
      return NextResponse.json(
        { error: '미리보기 데이터가 없습니다.' },
        { status: 404 }
      )
    }

    // 응답 데이터 구성
    const responseData = {
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        isPublic: session.isPublic,
        allowEdit: session.allowEdit,
        viewCount: session.viewCount + 1, // 증가된 조회수 반영
        updatedAt: session.updatedAt
      },
      snapshot: {
        id: currentSnapshot.id,
        name: currentSnapshot.name,
        description: currentSnapshot.description,
        dataType: currentSnapshot.dataType,
        device: currentSnapshot.device,
        theme: currentSnapshot.theme,
        createdAt: currentSnapshot.createdAt
      },
      data: currentSnapshot.data,
      snapshots: session.snapshots.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        dataType: s.dataType,
        device: s.device,
        theme: s.theme,
        createdAt: s.createdAt
      }))
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching preview session:', error)
    return NextResponse.json(
      { error: '미리보기 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 미리보기 세션 상태 업데이트 (편집 허용된 경우)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionKey } = await params
    const body = await request.json()
    const { password, action, data } = body

    // 세션 조회
    const session = await prisma.previewSession.findUnique({
      where: { sessionKey }
    })

    if (!session) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 편집 권한 확인
    if (!session.allowEdit) {
      return NextResponse.json(
        { error: '편집이 허용되지 않은 세션입니다.' },
        { status: 403 }
      )
    }

    // 활성화 및 만료 확인
    if (!session.isActive) {
      return NextResponse.json(
        { error: '비활성화된 미리보기 세션입니다.' },
        { status: 403 }
      )
    }

    if (session.expiresAt && new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: '만료된 미리보기 세션입니다.' },
        { status: 410 }
      )
    }

    // 비밀번호 확인
    if (session.password) {
      if (!password) {
        return NextResponse.json(
          { error: '비밀번호가 필요합니다.' },
          { status: 401 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, session.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: '잘못된 비밀번호입니다.' },
          { status: 401 }
        )
      }
    }

    // 액션별 처리
    switch (action) {
      case 'update_snapshot':
        // 새 스냅샷 생성
        const snapshot = await prisma.previewSnapshot.create({
          data: {
            sessionId: session.id,
            name: data.name || `편집 스냅샷 ${new Date().toISOString()}`,
            description: data.description || '미리보기에서 편집된 스냅샷',
            dataType: data.dataType || 'full',
            data: data.snapshotData,
            checksum: require('crypto')
              .createHash('md5')
              .update(JSON.stringify(data.snapshotData))
              .digest('hex'),
            device: data.device || 'desktop',
            theme: data.theme || 'light',
            createdBy: 'preview-edit'
          }
        })

        return NextResponse.json({
          message: '스냅샷이 생성되었습니다.',
          snapshot
        })

      default:
        return NextResponse.json(
          { error: '지원되지 않는 액션입니다.' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error updating preview session:', error)
    return NextResponse.json(
      { error: '미리보기 세션 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}