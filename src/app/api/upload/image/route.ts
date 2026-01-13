import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { optimizeImage, generateThumbnail, getImageMetadata } from '@/lib/utils/image-optimizer'

// 허용된 이미지 확장자
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const skipOptimize = formData.get('skipOptimize') === 'true'
    const generateThumb = formData.get('generateThumbnail') === 'true'

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    // 파일 크기 확인
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 확장자 확인
    const originalName = file.name
    const extension = originalName.split('.').pop()?.toLowerCase()

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (jpg, png, gif, webp만 가능)' },
        { status: 400 }
      )
    }

    // 업로드 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images')
    const thumbDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
    await mkdir(uploadDir, { recursive: true })
    await mkdir(thumbDir, { recursive: true })

    // 파일 버퍼 읽기
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 파일명 생성
    const fileId = uuidv4()
    let finalBuffer: Buffer = buffer
    let finalExtension = extension
    let optimizedSize = file.size

    // GIF가 아닌 경우 WebP로 최적화
    if (!skipOptimize && extension !== 'gif') {
      try {
        const optimized = await optimizeImage(buffer, {
          width: 1920,
          quality: 85,
          format: 'webp',
        })
        finalBuffer = Buffer.from(optimized.buffer)
        finalExtension = 'webp'
        optimizedSize = optimized.size
      } catch (err) {
        console.warn('Image optimization failed, using original:', err)
      }
    }

    const fileName = `${fileId}.${finalExtension}`
    const filePath = path.join(uploadDir, fileName)

    // 파일 저장
    await writeFile(filePath, finalBuffer)

    // 공개 URL
    const url = `/uploads/images/${fileName}`

    // 썸네일 생성 (요청 시)
    let thumbnailUrl: string | undefined
    if (generateThumb && extension !== 'gif') {
      try {
        const thumb = await generateThumbnail(buffer, 200)
        const thumbFileName = `${fileId}_thumb.webp`
        await writeFile(path.join(thumbDir, thumbFileName), Buffer.from(thumb.buffer))
        thumbnailUrl = `/uploads/thumbnails/${thumbFileName}`
      } catch (err) {
        console.warn('Thumbnail generation failed:', err)
      }
    }

    // 메타데이터 읽기
    let metadata
    try {
      metadata = await getImageMetadata(finalBuffer)
    } catch (err) {
      metadata = { width: 0, height: 0 }
    }

    return NextResponse.json({
      url,
      thumbnailUrl,
      name: originalName,
      size: file.size,
      optimizedSize,
      width: metadata.width,
      height: metadata.height,
      format: finalExtension,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 })
  }
}
