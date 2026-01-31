import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/check-role';
import prisma from '@/lib/db';
import { generateCSV, formatDateForExport } from '@/lib/club/export-utils';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const programId = searchParams.get('programId');

  let csv = '';
  let filename = '';

  switch (type) {
    case 'members': {
      const members = await prisma.user.findMany({
        include: { _count: { select: { programParticipants: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const roleLabels: Record<string, string> = {
        SUPER_ADMIN: '최고관리자',
        ADMIN: '관리자',
        FACILITATOR: '운영진',
        USER: '회원',
      };

      const headers = ['이름', '이메일', '역할', '가입일', '참여 프로그램 수'];
      const rows = members.map((m) => [
        m.name || '',
        m.email,
        roleLabels[m.role] || m.role,
        formatDateForExport(m.createdAt),
        String(m._count.programParticipants),
      ]);

      csv = generateCSV(headers, rows);
      filename = `members_${new Date().toISOString().split('T')[0]}.csv`;
      break;
    }

    case 'participants': {
      if (!programId) {
        return NextResponse.json(
          { error: 'programId required' },
          { status: 400 },
        );
      }

      const program = await prisma.program.findUnique({
        where: { id: programId },
        include: {
          participants: {
            include: { user: true },
            orderBy: { joinedAt: 'asc' },
          },
        },
      });

      if (!program) {
        return NextResponse.json(
          { error: 'Program not found' },
          { status: 404 },
        );
      }

      const headers = ['이름', '이메일', '상태', '가입일'];
      const rows = program.participants.map((p) => [
        p.user.name || '',
        p.user.email,
        p.status === 'ACTIVE'
          ? '활동중'
          : p.status === 'INACTIVE'
            ? '비활동'
            : p.status,
        formatDateForExport(p.joinedAt),
      ]);

      csv = generateCSV(headers, rows);
      const safeTitle = program.title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      filename = `${safeTitle}_participants_${new Date().toISOString().split('T')[0]}.csv`;
      break;
    }

    case 'attendance': {
      if (!programId) {
        return NextResponse.json(
          { error: 'programId required' },
          { status: 400 },
        );
      }

      const attendances = await prisma.programAttendance.findMany({
        where: { session: { programId } },
        include: {
          session: { include: { program: { select: { title: true } } } },
          participant: { include: { user: { select: { name: true } } } },
        },
        orderBy: [{ session: { sessionNo: 'asc' } }],
      });

      const statusLabels: Record<string, string> = {
        PRESENT: '출석',
        LATE: '지각',
        ABSENT: '결석',
        EXCUSED: '사유결석',
      };

      const headers = ['프로그램', '회차', '날짜', '참가자', '상태'];
      const rows = attendances.map((a) => [
        a.session.program.title,
        String(a.session.sessionNo),
        formatDateForExport(a.session.date),
        a.participant.user.name || '',
        statusLabels[a.status] || a.status,
      ]);

      csv = generateCSV(headers, rows);
      filename = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
      break;
    }

    default:
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
