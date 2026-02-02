import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// 허용된 파일 확장자
const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'hwp',
  'hwpx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'zip',
  'rar',
]
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'FACILITATOR']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: '파일 업로드 권한이 없습니다.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    // 파일 크기 확인
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기는 50MB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 확장자 확인
    const originalName = file.name
    const extension = originalName.split('.').pop()?.toLowerCase()

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다.' },
        { status: 400 }
      )
    }

    // 업로드 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'files')
    await mkdir(uploadDir, { recursive: true })

    // 파일명 생성 (UUID + 원본 확장자)
    const fileName = `${uuidv4()}.${extension}`
    const filePath = path.join(uploadDir, fileName)

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // 공개 URL 반환
    const url = `/uploads/files/${fileName}`

    // 파일 크기 포맷팅
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return NextResponse.json({
      url,
      name: originalName,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      type: extension,
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 })
  }
}
