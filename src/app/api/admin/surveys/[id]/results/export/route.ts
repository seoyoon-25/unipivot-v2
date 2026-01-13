import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 만족도 조사 결과 CSV 내보내기
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const survey = await prisma.satisfactionSurvey.findUnique({
      where: { id },
      include: {
        program: {
          select: { title: true },
        },
        responses: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: '조사를 찾을 수 없습니다.' }, { status: 404 })
    }

    const questions = survey.questions ? JSON.parse(survey.questions) : []

    // CSV 헤더 생성
    const headers = [
      '번호',
      '이름',
      '이메일',
      '연락처',
      '응답일시',
      '보증금 선택',
      ...questions.map((q: any, i: number) => `Q${i + 1}. ${q.question}`),
    ]

    // CSV 행 생성
    const rows = survey.responses.map((response, index) => {
      const answers = response.answers ? JSON.parse(response.answers) : {}

      const questionAnswers = questions.map((q: any) => {
        const answer = answers[q.id]
        if (answer === undefined || answer === null) return ''
        if (Array.isArray(answer)) return answer.join('; ')
        return String(answer)
      })

      return [
        index + 1,
        response.user?.name || '',
        response.user?.email || '',
        response.user?.phone || '',
        new Date(response.submittedAt).toLocaleString('ko-KR'),
        response.refundChoice === 'DONATE' ? '후원' : '반환',
        ...questionAnswers,
      ]
    })

    // CSV 문자열 생성 (BOM 포함)
    const BOM = '\uFEFF'
    const escapeCSV = (value: any) => {
      const str = String(value || '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvContent =
      BOM +
      [
        headers.map(escapeCSV).join(','),
        ...rows.map((row) => row.map(escapeCSV).join(',')),
      ].join('\n')

    // 파일명 생성
    const date = new Date().toISOString().split('T')[0]
    const filename = `${survey.program.title}_만족도조사_${date}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    console.error('Export survey results error:', error)
    return NextResponse.json(
      { error: '내보내기에 실패했습니다.' },
      { status: 500 }
    )
  }
}
