import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateMemberCode, normalizePhone } from '@/lib/services/member-matching';

// GET /api/admin/members - 회원 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const grade = searchParams.get('grade') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const skip = (page - 1) * limit;

    // 검색 조건
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { memberCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (grade) {
      where.grade = grade;
    }

    if (status) {
      where.status = status;
    }

    // 정렬
    let orderBy: any = {};
    if (sortBy === 'attendanceRate') {
      orderBy = { stats: { attendanceRate: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          stats: {
            select: {
              attendanceRate: true,
              reportRate: true,
              totalPrograms: true,
              noShowCount: true,
            },
          },
        },
      }),
      prisma.member.count({ where }),
    ]);

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: '회원 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/admin/members - 회원 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      birthYear,
      birthDate,
      gender,
      email,
      phone,
      kakaoId,
      organization,
      origin,
      hometown,
      residence,
      grade = 'NEW',
      status = 'ACTIVE',
      joinedAt,
    } = body;

    if (!name) {
      return NextResponse.json({ error: '이름은 필수입니다.' }, { status: 400 });
    }

    // 고유번호 생성
    const memberCode = await generateMemberCode(birthYear || null, joinedAt ? new Date(joinedAt) : new Date());

    // 전화번호 정규화
    const normalizedPhone = phone ? normalizePhone(phone) : undefined;

    const member = await prisma.member.create({
      data: {
        memberCode,
        name,
        birthYear,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        email,
        phone: normalizedPhone,
        kakaoId,
        organization,
        origin,
        hometown,
        residence,
        grade,
        status,
        joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
      },
    });

    // 통계 초기화
    await prisma.memberStats.create({
      data: { memberId: member.id },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: '회원 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
