import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/check-role'
import { generateRecommendations } from '@/lib/club/recommendation-service'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await generateRecommendations(user.id)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result)
}
