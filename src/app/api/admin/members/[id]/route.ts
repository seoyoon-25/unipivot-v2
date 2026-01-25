import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { normalizePhone } from '@/lib/services/member-matching';

// GET /api/admin/members/[id] - 회원 상세 조회
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        stats: true,
        statusLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        attendances: {
          orderBy: [{ programId: 'asc' }, { sessionNumber: 'asc' }],
          include: {
            program: {
              select: { id: true, title: true, slug: true, type: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 프로그램별 역할 조회 (member.userId가 있는 경우)
    let membershipRoles: Record<string, string> = {};
    if (member.userId) {
      const memberships = await prisma.programMembership.findMany({
        where: { userId: member.userId },
        select: { programId: true, role: true },
      });
      membershipRoles = memberships.reduce((acc, m) => {
        acc[m.programId] = m.role;
        return acc;
      }, {} as Record<string, string>);
    }

    // 출석 데이터를 프로그램별로 그룹핑하여 통계 계산
    const programMap = new Map<string, {
      programId: string;
      programTitle: string;
      programType: string;
      role: string | null;
      totalSessions: number;
      attendedSessions: number;
      reportSubmitted: number;
      sessions: Array<{
        sessionNumber: number;
        sessionDate: Date | null;
        attended: boolean;
        reportSubmitted: boolean;
      }>;
    }>();

    for (const att of member.attendances) {
      const existing = programMap.get(att.programId);
      const sessionData = {
        sessionNumber: att.sessionNumber,
        sessionDate: att.sessionDate,
        attended: att.attended,
        reportSubmitted: att.reportSubmitted,
      };

      if (existing) {
        existing.totalSessions++;
        if (att.attended) existing.attendedSessions++;
        if (att.reportSubmitted) existing.reportSubmitted++;
        existing.sessions.push(sessionData);
      } else {
        programMap.set(att.programId, {
          programId: att.programId,
          programTitle: att.program.title,
          programType: att.program.type,
          role: membershipRoles[att.programId] || null,
          totalSessions: 1,
          attendedSessions: att.attended ? 1 : 0,
          reportSubmitted: att.reportSubmitted ? 1 : 0,
          sessions: [sessionData],
        });
      }
    }

    // 통계 계산 및 배열 변환
    const programParticipations = Array.from(programMap.values()).map(p => ({
      ...p,
      attendanceRate: p.totalSessions > 0 ? Math.round((p.attendedSessions / p.totalSessions) * 100) : 0,
      reportRate: p.totalSessions > 0 ? Math.round((p.reportSubmitted / p.totalSessions) * 100) : 0,
      sessions: p.sessions.sort((a, b) => a.sessionNumber - b.sessionNumber),
    }));

    return NextResponse.json({
      ...member,
      programParticipations,
    });
  } catch (error) {
    console.error('Get member error:', error);
    return NextResponse.json({ error: '회원 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PATCH /api/admin/members/[id] - 회원 수정
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { phone, ...updateData } = body;

    // 전화번호 정규화
    if (phone !== undefined) {
      updateData.phone = phone ? normalizePhone(phone) : null;
    }

    const member = await prisma.member.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: '회원 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE /api/admin/members/[id] - 회원 삭제
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    await prisma.member.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: '회원 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
