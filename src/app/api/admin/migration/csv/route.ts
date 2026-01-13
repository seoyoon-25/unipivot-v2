import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/admin/migration/csv - CSV 데이터 가져오기
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 체크
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tableType = formData.get('type') as string
    const skipExisting = formData.get('skipExisting') !== 'false'

    if (!file) {
      return NextResponse.json({ error: '파일을 선택해주세요.' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length !== headers.length) {
        results.errors.push(`Line ${i + 1}: Invalid column count`)
        continue
      }

      const row: Record<string, string> = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx]
      })

      try {
        switch (tableType) {
          case 'members':
            await importMember(row, skipExisting, results)
            break
          case 'programs':
            await importProgram(row, skipExisting, results)
            break
          case 'transactions':
            await importTransaction(row, session.user.id, results)
            break
          default:
            results.errors.push(`Unknown table type: ${tableType}`)
        }
      } catch (err) {
        results.errors.push(`Line ${i + 1}: ${err}`)
      }
    }

    // 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CSV_IMPORT',
        target: tableType,
        details: `Imported: ${results.imported}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`
      }
    })

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error importing CSV:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

async function importMember(
  row: Record<string, string>,
  skipExisting: boolean,
  results: { imported: number; skipped: number; errors: string[] }
) {
  if (!row.email) {
    results.errors.push('Email is required')
    return
  }

  if (skipExisting) {
    const existing = await prisma.user.findUnique({
      where: { email: row.email }
    })
    if (existing) {
      results.skipped++
      return
    }
  }

  await prisma.user.upsert({
    where: { email: row.email },
    update: {
      name: row.name || null,
      phone: row.phone || null,
      origin: row.origin || 'IMPORT',
      status: row.status || 'ACTIVE'
    },
    create: {
      email: row.email,
      name: row.name || null,
      phone: row.phone || null,
      origin: row.origin || 'IMPORT',
      status: row.status || 'ACTIVE'
    }
  })
  results.imported++
}

async function importProgram(
  row: Record<string, string>,
  skipExisting: boolean,
  results: { imported: number; skipped: number; errors: string[] }
) {
  if (!row.title) {
    results.errors.push('Title is required')
    return
  }

  const slug = row.title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now()

  if (skipExisting) {
    const existing = await prisma.program.findFirst({
      where: { title: row.title }
    })
    if (existing) {
      results.skipped++
      return
    }
  }

  await prisma.program.create({
    data: {
      slug,
      title: row.title,
      type: row.type || 'BOOKCLUB',
      description: row.description || null,
      capacity: row.capacity ? parseInt(row.capacity) : 20,
      fee: row.fee ? parseInt(row.fee) : 0,
      status: row.status || 'DRAFT',
      startDate: row.startDate ? new Date(row.startDate) : null,
      endDate: row.endDate ? new Date(row.endDate) : null
    }
  })
  results.imported++
}

async function importTransaction(
  row: Record<string, string>,
  userId: string,
  results: { imported: number; skipped: number; errors: string[] }
) {
  if (!row.date || !row.type || !row.amount) {
    results.errors.push('Date, type, and amount are required')
    return
  }

  // 기금 찾기 또는 생성
  let fund = await prisma.fund.findFirst({
    where: { name: row.fundName || '일반기금' }
  })
  if (!fund) {
    fund = await prisma.fund.create({
      data: {
        name: row.fundName || '일반기금',
        type: 'GENERAL',
        balance: 0
      }
    })
  }

  // 계정과목 찾기
  let account = await prisma.financeAccount.findFirst({
    where: { code: row.accountCode }
  })
  if (!account) {
    // 기본 계정 사용
    account = await prisma.financeAccount.findFirst({
      where: { type: row.type === 'INCOME' ? 'INCOME' : 'EXPENSE' }
    })
  }

  if (!account) {
    results.errors.push(`Account not found: ${row.accountCode}`)
    return
  }

  const amount = parseInt(row.amount)

  await prisma.$transaction(async (tx) => {
    await tx.financeTransaction.create({
      data: {
        date: new Date(row.date),
        type: row.type as 'INCOME' | 'EXPENSE',
        fundId: fund!.id,
        financeAccountId: account!.id,
        amount,
        description: row.description || '',
        vendor: row.vendor || null,
        paymentMethod: row.paymentMethod || null,
        createdBy: userId
      }
    })

    // 기금 잔액 업데이트
    const balanceChange = row.type === 'INCOME' ? amount : -amount
    await tx.fund.update({
      where: { id: fund!.id },
      data: { balance: { increment: balanceChange } }
    })
  })

  results.imported++
}
