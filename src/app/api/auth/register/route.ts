import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const registerSchema = z.object({
  // Step 1 - 기본 정보
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),

  // Step 2 - 추가 정보
  displayName: z.string().min(1, '활동명을 입력해주세요.').optional(),
  phone: z.string().optional(),
  origin: z.enum(['SOUTH', 'NORTH', 'OVERSEAS']).optional(),
  birthRegion: z.string().optional(),
  birthCity: z.string().optional(),
  residenceRegion: z.string().optional(),
  birthYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  occupation: z.string().optional(),
  organization: z.string().optional(),
  referralSource: z.string().optional(),

  // Step 3 - 약관 동의
  termsAgreed: z.boolean().default(false),
  privacyAgreed: z.boolean().default(false),
  marketingAgreed: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // 필수 약관 동의 확인
    if (!validatedData.termsAgreed || !validatedData.privacyAgreed) {
      return NextResponse.json(
        { error: '필수 약관에 동의해주세요.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const now = new Date();

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        displayName: validatedData.displayName,
        phone: validatedData.phone,
        origin: validatedData.origin,
        birthRegion: validatedData.birthRegion,
        birthCity: validatedData.birthCity,
        residenceRegion: validatedData.residenceRegion,
        birthYear: validatedData.birthYear,
        gender: validatedData.gender,
        occupation: validatedData.occupation,
        organization: validatedData.organization,
        referralSource: validatedData.referralSource,
        termsAgreed: validatedData.termsAgreed,
        privacyAgreed: validatedData.privacyAgreed,
        marketingAgreed: validatedData.marketingAgreed,
        termsAgreedAt: validatedData.termsAgreed ? now : null,
        privacyAgreedAt: validatedData.privacyAgreed ? now : null,
        marketingAgreedAt: validatedData.marketingAgreed ? now : null,
        profileCompleted: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        target: 'User',
        targetId: user.id,
      },
    });

    return NextResponse.json({
      message: '회원가입이 완료되었습니다.',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
