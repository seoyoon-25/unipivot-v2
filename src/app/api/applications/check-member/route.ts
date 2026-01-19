import { NextRequest, NextResponse } from 'next/server'
import { matchApplicant, normalizePhone } from '@/lib/services/member-matching'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, birthYear } = body

    if (!name) {
      return NextResponse.json({ matched: false })
    }

    const result = await matchApplicant({
      name,
      email,
      phone: phone ? normalizePhone(phone) : undefined,
      birthYear,
    })

    return NextResponse.json({
      matched: result.matched,
      alertLevel: result.alertLevel,
      memberGrade: result.member?.grade,
    })
  } catch (error) {
    console.error('Check member error:', error)
    return NextResponse.json({ matched: false })
  }
}
