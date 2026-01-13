import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: { startsWith: 'theme.' },
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching theme settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    // Determine the type based on the key
    let type = 'TEXT'
    if (key.includes('Color')) {
      type = 'TEXT'
    } else if (key.includes('logo') || key.includes('favicon') || key.includes('image')) {
      type = 'IMAGE'
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value, type },
      create: { key, value, type },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error saving theme setting:', error)
    return NextResponse.json(
      { error: 'Failed to save theme setting' },
      { status: 500 }
    )
  }
}
