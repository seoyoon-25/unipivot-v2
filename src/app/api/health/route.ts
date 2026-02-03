import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  // 관리자 인증 확인
  let isAdmin = false
  try {
    const session = await getServerSession(authOptions)
    isAdmin = !!session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
  } catch {
    // 세션 조회 실패 시 비인증으로 처리
  }

  // 비인증 요청: DB 연결 상태만 반환 (인프라 정보 노출 차단)
  if (!isAdmin) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return NextResponse.json({ status: 'ok' })
    } catch {
      return NextResponse.json({ status: 'error' }, { status: 503 })
    }
  }

  // 관리자: 상세 인프라 정보 반환
  const checks = {
    status: 'ok' as 'ok' | 'degraded' | 'error',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    services: {} as Record<string, { status: string; latency?: number; detail?: string }>,
  }

  // Database check
  const dbStart = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.services.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    }
  } catch {
    checks.services.database = { status: 'error', detail: 'Database connection failed' }
    checks.status = 'degraded'
  }

  // Memory check
  const memUsage = process.memoryUsage()
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
  checks.services.memory = {
    status: heapUsedMB < 500 ? 'ok' : 'warning',
    latency: heapUsedMB,
    detail: `${heapUsedMB}MB / ${heapTotalMB}MB`,
  }

  // Uptime
  checks.services.uptime = {
    status: 'ok',
    latency: Math.round(process.uptime()),
    detail: `${Math.round(process.uptime())}s`,
  }

  return NextResponse.json(checks, {
    status: checks.status === 'ok' ? 200 : 503,
  })
}
