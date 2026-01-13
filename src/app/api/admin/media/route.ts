import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readdir, stat, unlink } from 'fs/promises'
import path from 'path'

interface MediaFile {
  name: string
  url: string
  thumbnailUrl?: string
  size: number
  type: 'image' | 'file'
  createdAt: string
}

// GET: 미디어 파일 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // all, image, file
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const files: MediaFile[] = []

    // 이미지 폴더 스캔
    if (type === 'all' || type === 'image') {
      const imageDir = path.join(process.cwd(), 'public', 'uploads', 'images')
      try {
        const imageFiles = await readdir(imageDir)
        for (const fileName of imageFiles) {
          if (search && !fileName.toLowerCase().includes(search.toLowerCase())) continue

          const filePath = path.join(imageDir, fileName)
          const fileStat = await stat(filePath)

          if (fileStat.isFile()) {
            files.push({
              name: fileName,
              url: `/uploads/images/${fileName}`,
              thumbnailUrl: `/uploads/thumbnails/${fileName.replace(/\.[^.]+$/, '_thumb.webp')}`,
              size: fileStat.size,
              type: 'image',
              createdAt: fileStat.birthtime.toISOString(),
            })
          }
        }
      } catch (e) {
        // 폴더가 없으면 무시
      }
    }

    // 파일 폴더 스캔
    if (type === 'all' || type === 'file') {
      const fileDir = path.join(process.cwd(), 'public', 'uploads', 'files')
      try {
        const docFiles = await readdir(fileDir)
        for (const fileName of docFiles) {
          if (search && !fileName.toLowerCase().includes(search.toLowerCase())) continue

          const filePath = path.join(fileDir, fileName)
          const fileStat = await stat(filePath)

          if (fileStat.isFile()) {
            files.push({
              name: fileName,
              url: `/uploads/files/${fileName}`,
              size: fileStat.size,
              type: 'file',
              createdAt: fileStat.birthtime.toISOString(),
            })
          }
        }
      } catch (e) {
        // 폴더가 없으면 무시
      }
    }

    // 최신순 정렬
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 페이지네이션
    const total = files.length
    const start = (page - 1) * limit
    const paginatedFiles = files.slice(start, start + limit)

    return NextResponse.json({
      files: paginatedFiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Media list error:', error)
    return NextResponse.json({ error: '미디어 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// DELETE: 미디어 파일 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { url } = await request.json()

    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: '잘못된 파일 경로입니다.' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', url)

    try {
      await unlink(filePath)

      // 이미지의 경우 썸네일도 삭제 시도
      if (url.includes('/images/')) {
        const thumbPath = filePath
          .replace('/images/', '/thumbnails/')
          .replace(/\.[^.]+$/, '_thumb.webp')
        try {
          await unlink(thumbPath)
        } catch {
          // 썸네일이 없으면 무시
        }
      }

      return NextResponse.json({ success: true, message: '파일이 삭제되었습니다.' })
    } catch {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 })
    }
  } catch (error) {
    console.error('Media delete error:', error)
    return NextResponse.json({ error: '파일 삭제에 실패했습니다.' }, { status: 500 })
  }
}
