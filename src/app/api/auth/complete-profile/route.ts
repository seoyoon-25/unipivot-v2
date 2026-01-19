import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      skipProfile,
      displayName,
      phone,
      origin,
      birthRegion,
      birthCity,
      residenceRegion,
      birthYear,
      gender,
      occupation,
      organization,
      referralSource,
      termsAgreed,
      privacyAgreed,
      marketingAgreed,
    } = body;

    // 프로필 건너뛰기 요청
    if (skipProfile) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { profileCompleted: true },
      });

      return NextResponse.json({ success: true });
    }

    // 필수 약관 동의 확인
    if (!termsAgreed || !privacyAgreed) {
      return NextResponse.json({ error: '필수 약관에 동의해주세요.' }, { status: 400 });
    }

    const now = new Date();

    // 프로필 업데이트
    const updateData: any = {
      profileCompleted: true,
      termsAgreed: true,
      privacyAgreed: true,
      termsAgreedAt: now,
      privacyAgreedAt: now,
    };

    if (displayName) updateData.displayName = displayName;
    if (phone) updateData.phone = phone;
    if (origin && ['SOUTH', 'NORTH', 'OVERSEAS'].includes(origin)) {
      updateData.origin = origin;
    }
    if (birthRegion) updateData.birthRegion = birthRegion;
    if (birthCity) updateData.birthCity = birthCity;
    if (residenceRegion) updateData.residenceRegion = residenceRegion;
    if (birthYear && birthYear >= 1900 && birthYear <= new Date().getFullYear()) {
      updateData.birthYear = birthYear;
    }
    if (gender && ['MALE', 'FEMALE'].includes(gender)) {
      updateData.gender = gender;
    }
    if (occupation) updateData.occupation = occupation;
    if (organization) updateData.organization = organization;
    if (referralSource) updateData.referralSource = referralSource;

    // 마케팅 동의
    if (marketingAgreed) {
      updateData.marketingAgreed = true;
      updateData.marketingAgreedAt = now;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'PROFILE_COMPLETE',
        target: 'User',
        targetId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json({ error: '프로필 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
