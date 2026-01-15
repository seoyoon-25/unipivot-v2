import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

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
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

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
    if (key.includes('logo') || key.includes('favicon') || key.includes('image')) {
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

// Bulk update all theme settings at once
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      )
    }

    const results = []

    for (const [key, value] of Object.entries(settings)) {
      if (!key.startsWith('theme.')) continue

      let type = 'TEXT'
      if (key.includes('logo') || key.includes('favicon') || key.includes('image')) {
        type = 'IMAGE'
      }

      const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: { value: value as string, type },
        create: { key, value: value as string, type },
      })
      results.push(setting)
    }

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    console.error('Error saving theme settings:', error)
    return NextResponse.json(
      { error: 'Failed to save theme settings' },
      { status: 500 }
    )
  }
}
