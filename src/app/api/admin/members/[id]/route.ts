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
          orderBy: { sessionDate: 'desc' },
          take: 100,
          include: {
            program: {
              select: { id: true, title: true, slug: true },
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

    return NextResponse.json(member);
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
