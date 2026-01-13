import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

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
    await mkdir(uploadDir, { recursive: true })

    // 파일명 생성 (UUID + 원본 확장자)
    const fileName = `${uuidv4()}.${extension}`
    const filePath = path.join(uploadDir, fileName)

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // 공개 URL 반환
    const url = `/uploads/images/${fileName}`

    return NextResponse.json({
      url,
      name: originalName,
      size: file.size,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 })
  }
}
