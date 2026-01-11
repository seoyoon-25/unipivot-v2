import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

const registerSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  phone: z.string().optional(),
  origin: z.enum(['SOUTH', 'NORTH', 'OVERSEAS']).optional(),
  birthYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
  occupation: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(validatedData.password)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        origin: validatedData.origin,
        birthYear: validatedData.birthYear,
        occupation: validatedData.occupation,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        target: 'User',
        targetId: user.id,
      },
    })

    return NextResponse.json({
      message: '회원가입이 완료되었습니다.',
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
