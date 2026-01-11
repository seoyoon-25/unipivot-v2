import { NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string().min(1, '메시지를 입력해주세요.').max(1000),
  sessionId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const validatedData = chatSchema.parse(body)

    const response = await generateChatResponse(
      validatedData.message,
      validatedData.sessionId,
      session?.user?.id
    )

    return NextResponse.json({ response })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: '채팅 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
