import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/admin/members/[id]/status - 회원 상태 변경
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json({ error: '상태는 필수입니다.' }, { status: 400 });
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: '변경 사유는 필수입니다.' }, { status: 400 });
    }

    const validStatuses = ['ACTIVE', 'WATCH', 'WARNING', 'BLOCKED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: params.id },
      select: { status: true, grade: true },
    });

    if (!member) {
      return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 변경 이력 기록
    await prisma.memberStatusLog.create({
      data: {
        memberId: params.id,
        previousStatus: member.status,
        newStatus: status,
        reason,
        createdBy: session.user.name || session.user.email || 'Unknown',
      },
    });

    // 상태 업데이트
    const updated = await prisma.member.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Change member status error:', error);
    return NextResponse.json({ error: '상태 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
