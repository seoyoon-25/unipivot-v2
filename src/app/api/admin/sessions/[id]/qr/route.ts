import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { randomBytes } from 'crypto'

// POST /api/admin/sessions/[id]/qr - QR 코드 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const expiresInHours = body.expiresInHours || 2

    // Generate unique QR code
    const qrCode = randomBytes(16).toString('hex')
    const qrExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

    // Update session with QR code
    const programSession = await prisma.programSession.update({
      where: { id },
      data: {
        qrCode,
        qrExpiresAt
      }
    })

    return NextResponse.json({
      qrCode,
      qrExpiresAt,
      attendanceUrl: `/attendance/${qrCode}`
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/sessions/[id]/qr - QR 코드 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.programSession.update({
      where: { id },
      data: {
        qrCode: null,
        qrExpiresAt: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
