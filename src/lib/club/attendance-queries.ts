import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * 내 출석 현황 조회
 */
export async function getMyAttendance() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const attendances = await prisma.programAttendance.findMany({
    where: {
      participant: { userId: session.user.id },
    },
    include: {
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
          bookTitle: true,
          program: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      session: { date: 'desc' },
    },
  })

  return attendances.map((a) => ({
    id: a.id,
    status: a.status,
    checkedAt: a.checkedAt,
    checkMethod: a.checkMethod,
    session: {
      id: a.session.id,
      sessionNo: a.session.sessionNo,
      title: a.session.title,
      date: a.session.date,
      bookTitle: a.session.bookTitle,
      programTitle: a.session.program.title,
      programId: a.session.program.id,
    },
  }))
}

/**
 * 프로그램별 출석 요약
 */
export async function getMyAttendanceSummary() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const programs = await prisma.programParticipant.findMany({
    where: {
      userId: session.user.id,
      program: { status: { in: ['ONGOING', 'COMPLETED'] } },
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          _count: {
            select: { sessions: true },
          },
        },
      },
      attendances: {
        select: {
          status: true,
        },
      },
    },
  })

  return programs.map((p) => {
    const present = p.attendances.filter((a) => a.status === 'PRESENT').length
    const late = p.attendances.filter((a) => a.status === 'LATE').length
    const total = p.program._count.sessions

    return {
      programId: p.program.id,
      programTitle: p.program.title,
      totalSessions: total,
      present,
      late,
      absent: total - present - late,
      rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
    }
  })
}

/**
 * 진행자: 세션별 출석 현황 조회
 */
export async function getSessionAttendance(sessionId: string) {
  const attendances = await prisma.programAttendance.findMany({
    where: { sessionId },
    include: {
      participant: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      participant: { user: { name: 'asc' } },
    },
  })

  return attendances.map((a) => ({
    id: a.id,
    status: a.status,
    checkedAt: a.checkedAt,
    checkMethod: a.checkMethod,
    note: a.note,
    user: {
      id: a.participant.user.id,
      name: a.participant.user.name,
      email: a.participant.user.email,
    },
  }))
}

/**
 * 진행자: 프로그램의 세션 목록 (출석 관리용)
 */
export async function getFacilitatorSessions() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  // Get programs where user is facilitator
  const memberships = await prisma.programMembership.findMany({
    where: {
      userId: session.user.id,
      role: { in: ['ORGANIZER', 'FACILITATOR'] },
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          status: true,
          sessions: {
            orderBy: { date: 'desc' },
            select: {
              id: true,
              sessionNo: true,
              title: true,
              date: true,
              bookTitle: true,
              _count: {
                select: {
                  attendances: true,
                },
              },
            },
          },
          _count: {
            select: { participants: true },
          },
        },
      },
    },
  })

  // Also include programs where user is a facilitator via SessionFacilitator
  const sessionFacilitators = await prisma.sessionFacilitator.findMany({
    where: { userId: session.user.id },
    include: {
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
          bookTitle: true,
          programId: true,
          program: {
            select: {
              id: true,
              title: true,
              status: true,
              _count: { select: { participants: true } },
            },
          },
          _count: { select: { attendances: true } },
        },
      },
    },
  })

  // Build a combined list of programs
  const programsMap = new Map<string, {
    id: string
    title: string
    status: string
    totalParticipants: number
    sessions: {
      id: string
      sessionNo: number
      title: string | null
      date: Date
      bookTitle: string | null
      attendanceCount: number
    }[]
  }>()

  for (const m of memberships) {
    programsMap.set(m.program.id, {
      id: m.program.id,
      title: m.program.title,
      status: m.program.status,
      totalParticipants: m.program._count.participants,
      sessions: m.program.sessions.map((s) => ({
        id: s.id,
        sessionNo: s.sessionNo,
        title: s.title,
        date: s.date,
        bookTitle: s.bookTitle,
        attendanceCount: s._count.attendances,
      })),
    })
  }

  // Add sessions from SessionFacilitator if not already included
  for (const sf of sessionFacilitators) {
    const prog = sf.session.program
    if (!programsMap.has(prog.id)) {
      programsMap.set(prog.id, {
        id: prog.id,
        title: prog.title,
        status: prog.status,
        totalParticipants: prog._count.participants,
        sessions: [],
      })
    }
    const existing = programsMap.get(prog.id)!
    if (!existing.sessions.find((s) => s.id === sf.session.id)) {
      existing.sessions.push({
        id: sf.session.id,
        sessionNo: sf.session.sessionNo,
        title: sf.session.title,
        date: sf.session.date,
        bookTitle: sf.session.bookTitle,
        attendanceCount: sf.session._count.attendances,
      })
    }
  }

  return Array.from(programsMap.values())
}
