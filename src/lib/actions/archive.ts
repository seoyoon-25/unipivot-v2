'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 아카이브 생성
export async function createSessionArchive(
  sessionId: string,
  data: {
    summary?: string
    highlights?: string[]
    photos?: string[]
    topKeywords?: string[]
    nextSessionPreview?: string
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  return await prisma.sessionArchive.upsert({
    where: { sessionId },
    create: {
      sessionId,
      summary: data.summary,
      highlights: data.highlights ? JSON.stringify(data.highlights) : null,
      photos: data.photos ? JSON.stringify(data.photos) : null,
      topKeywords: data.topKeywords ? JSON.stringify(data.topKeywords) : null,
      nextSessionPreview: data.nextSessionPreview
    },
    update: {
      summary: data.summary,
      highlights: data.highlights ? JSON.stringify(data.highlights) : undefined,
      photos: data.photos ? JSON.stringify(data.photos) : undefined,
      topKeywords: data.topKeywords ? JSON.stringify(data.topKeywords) : undefined,
      nextSessionPreview: data.nextSessionPreview
    }
  })
}

// 아카이브 조회
export async function getSessionArchive(sessionId: string) {
  const archive = await prisma.sessionArchive.findUnique({
    where: { sessionId },
    include: {
      session: {
        include: {
          program: {
            select: {
              id: true,
              title: true,
              type: true
            }
          },
          attendances: {
            include: {
              participant: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true
                    }
                  }
                }
              }
            }
          },
          speakingStats: true,
          facilitators: {
            include: {
              user: {
                select: { id: true, name: true, image: true }
              }
            }
          }
        }
      }
    }
  })

  if (!archive) return null

  // JSON 파싱
  return {
    ...archive,
    highlights: archive.highlights ? JSON.parse(archive.highlights) : [],
    photos: archive.photos ? JSON.parse(archive.photos) : [],
    topKeywords: archive.topKeywords ? JSON.parse(archive.topKeywords) : []
  }
}

// 프로그램 전체 아카이브 조회
export async function getProgramArchives(programId: string) {
  const sessions = await prisma.programSession.findMany({
    where: { programId },
    include: {
      archive: true,
      attendances: true,
      speakingStats: true
    },
    orderBy: { sessionNo: 'asc' }
  })

  return sessions.map(session => ({
    sessionId: session.id,
    sessionNo: session.sessionNo,
    date: session.date,
    title: session.title,
    bookTitle: session.bookTitle,
    attendanceCount: session.attendances.filter(
      a => a.status === 'PRESENT'
    ).length,
    hasArchive: !!session.archive,
    archive: session.archive
      ? {
          ...session.archive,
          highlights: session.archive.highlights
            ? JSON.parse(session.archive.highlights)
            : [],
          photos: session.archive.photos
            ? JSON.parse(session.archive.photos)
            : []
        }
      : null
  }))
}

// AI 요약 생성
export async function generateArchiveSummary(sessionId: string) {
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: true,
      bookReports: {
        include: { author: { select: { name: true } } }
      },
      speakingStats: true,
      attendances: {
        include: {
          participant: {
            include: {
              user: { select: { name: true } }
            }
          }
        }
      }
    }
  })

  if (!session) {
    return { error: '세션을 찾을 수 없습니다.' }
  }

  const attendees = session.attendances
    .filter(a => a.status === 'PRESENT')
    .map(a => a.participant.user.name)
    .join(', ')

  const reportSummary = session.bookReports
    .slice(0, 3)
    .map(r => `- ${r.author.name}: ${r.content.slice(0, 100)}...`)
    .join('\n')

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    return {
      summary: `${session.sessionNo}회차 모임이 진행되었습니다. ${attendees}님이 참석하셨습니다.`,
      keywords: ['독서', '토론']
    }
  }

  const prompt = `다음 독서모임 정보를 바탕으로 간단한 요약을 작성해주세요:

프로그램: ${session.program.title}
회차: ${session.sessionNo}회차
책: ${session.bookTitle || '미정'}
읽을 범위: ${session.bookRange || '미정'}
참석자: ${attendees}

독후감 일부:
${reportSummary}

요구사항:
1. 2-3문장으로 요약
2. 주요 키워드 3-5개 추출
3. 긍정적인 톤

응답 형식:
요약: [요약 내용]
키워드: [키워드1, 키워드2, ...]`

  try {
    let response = ''

    if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await res.json()
      response = data.content?.[0]?.text || ''
    } else if (process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await res.json()
      response = data.choices?.[0]?.message?.content || ''
    }

    // 파싱
    const summaryMatch = response.match(/요약:\s*(.+)/i)
    const keywordsMatch = response.match(/키워드:\s*\[?([^\]]+)\]?/i)

    const summary = summaryMatch?.[1]?.trim() || response
    const keywords = keywordsMatch?.[1]
      ?.split(',')
      .map((k: string) => k.trim())
      .filter(Boolean) || ['독서', '토론']

    return { summary, keywords }
  } catch (error) {
    console.error('AI 요약 생성 오류:', error)
    return {
      summary: `${session.sessionNo}회차 모임이 진행되었습니다.`,
      keywords: ['독서', '토론']
    }
  }
}

// 사진 추가
export async function addArchivePhoto(sessionId: string, photoUrl: string) {
  const archive = await prisma.sessionArchive.findUnique({
    where: { sessionId }
  })

  const currentPhotos: string[] = archive?.photos
    ? JSON.parse(archive.photos)
    : []

  currentPhotos.push(photoUrl)

  return await prisma.sessionArchive.upsert({
    where: { sessionId },
    create: {
      sessionId,
      photos: JSON.stringify(currentPhotos)
    },
    update: {
      photos: JSON.stringify(currentPhotos)
    }
  })
}

// 사진 삭제
export async function removeArchivePhoto(sessionId: string, photoUrl: string) {
  const archive = await prisma.sessionArchive.findUnique({
    where: { sessionId }
  })

  if (!archive?.photos) return archive

  const currentPhotos: string[] = JSON.parse(archive.photos)
  const updatedPhotos = currentPhotos.filter(p => p !== photoUrl)

  return await prisma.sessionArchive.update({
    where: { sessionId },
    data: {
      photos: JSON.stringify(updatedPhotos)
    }
  })
}

// 하이라이트 추가
export async function addArchiveHighlight(
  sessionId: string,
  highlight: string
) {
  const archive = await prisma.sessionArchive.findUnique({
    where: { sessionId }
  })

  const currentHighlights: string[] = archive?.highlights
    ? JSON.parse(archive.highlights)
    : []

  currentHighlights.push(highlight)

  return await prisma.sessionArchive.upsert({
    where: { sessionId },
    create: {
      sessionId,
      highlights: JSON.stringify(currentHighlights)
    },
    update: {
      highlights: JSON.stringify(currentHighlights)
    }
  })
}

// 졸업 앨범 데이터 조회
export async function getGraduationAlbumData(programId: string) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          attendances: true
        }
      },
      sessions: {
        include: {
          archive: true,
          attendances: true,
          speakingStats: true,
          bookReports: true
        },
        orderBy: { sessionNo: 'asc' }
      }
    }
  })

  if (!program) return null

  // 통계 계산
  const totalSessions = program.sessions.length
  const totalParticipants = program.participants.length

  // 참가자별 통계
  const participantStats = program.participants.map(p => {
    const attendances = p.attendances.filter(a => a.status === 'PRESENT').length
    const attendanceRate = totalSessions > 0
      ? Math.round((attendances / totalSessions) * 100)
      : 0

    return {
      user: p.user,
      attendanceCount: attendances,
      attendanceRate
    }
  })

  // 전체 사진 수집
  const allPhotos: string[] = []
  program.sessions.forEach(session => {
    if (session.archive?.photos) {
      const photos = JSON.parse(session.archive.photos)
      allPhotos.push(...photos)
    }
  })

  // 베스트 발언자
  const speakingStatsAll = program.sessions
    .filter(s => s.speakingStats)
    .map(s => s.speakingStats!)

  return {
    program: {
      id: program.id,
      title: program.title,
      startDate: program.startDate,
      endDate: program.endDate
    },
    stats: {
      totalSessions,
      totalParticipants,
      totalReports: program.sessions.reduce(
        (sum, s) => sum + s.bookReports.length,
        0
      ),
      totalPhotos: allPhotos.length
    },
    participantStats: participantStats.sort(
      (a, b) => b.attendanceRate - a.attendanceRate
    ),
    sessions: program.sessions.map(s => ({
      id: s.id,
      sessionNo: s.sessionNo,
      date: s.date,
      title: s.title,
      bookTitle: s.bookTitle,
      attendanceCount: s.attendances.filter(a => a.status === 'PRESENT').length,
      archive: s.archive
        ? {
            summary: s.archive.summary,
            photos: s.archive.photos ? JSON.parse(s.archive.photos) : []
          }
        : null
    })),
    allPhotos
  }
}
