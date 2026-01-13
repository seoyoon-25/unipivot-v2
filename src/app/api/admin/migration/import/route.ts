import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/admin/migration/import - 데이터 가져오기
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

    const body = await request.json()
    const { data, options } = body

    if (!data) {
      return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 400 })
    }

    const results: Record<string, { imported: number; skipped: number; errors: string[] }> = {}
    const skipExisting = options?.skipExisting !== false

    // 회원 데이터 가져오기
    if (data.users && Array.isArray(data.users)) {
      results.users = { imported: 0, skipped: 0, errors: [] }

      for (const userData of data.users) {
        try {
          if (skipExisting) {
            const existing = await prisma.user.findUnique({
              where: { email: userData.email }
            })
            if (existing) {
              results.users.skipped++
              continue
            }
          }

          await prisma.user.upsert({
            where: { email: userData.email },
            update: {
              name: userData.name,
              phone: userData.phone,
              origin: userData.origin || 'IMPORT',
              status: userData.status || 'ACTIVE'
            },
            create: {
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              origin: userData.origin || 'IMPORT',
              status: userData.status || 'ACTIVE'
            }
          })
          results.users.imported++
        } catch (err) {
          results.users.errors.push(`Failed to import user ${userData.email}: ${err}`)
        }
      }
    }

    // 프로그램 데이터 가져오기
    if (data.programs && Array.isArray(data.programs)) {
      results.programs = { imported: 0, skipped: 0, errors: [] }

      for (const programData of data.programs) {
        try {
          if (skipExisting) {
            const existing = await prisma.program.findUnique({
              where: { slug: programData.slug }
            })
            if (existing) {
              results.programs.skipped++
              continue
            }
          }

          await prisma.program.upsert({
            where: { slug: programData.slug },
            update: {
              title: programData.title,
              type: programData.type,
              description: programData.description,
              content: programData.content,
              capacity: programData.capacity,
              fee: programData.fee,
              status: programData.status
            },
            create: {
              slug: programData.slug,
              title: programData.title,
              type: programData.type || 'BOOKCLUB',
              description: programData.description,
              content: programData.content,
              capacity: programData.capacity || 20,
              fee: programData.fee || 0,
              status: programData.status || 'DRAFT'
            }
          })
          results.programs.imported++
        } catch (err) {
          results.programs.errors.push(`Failed to import program ${programData.title}: ${err}`)
        }
      }
    }

    // 계정과목 데이터 가져오기
    if (data.financeAccounts && Array.isArray(data.financeAccounts)) {
      results.financeAccounts = { imported: 0, skipped: 0, errors: [] }

      for (const account of data.financeAccounts) {
        try {
          if (skipExisting) {
            const existing = await prisma.financeAccount.findUnique({
              where: { code: account.code }
            })
            if (existing) {
              results.financeAccounts.skipped++
              continue
            }
          }

          await prisma.financeAccount.upsert({
            where: { code: account.code },
            update: {
              name: account.name,
              type: account.type,
              category: account.category,
              description: account.description
            },
            create: {
              code: account.code,
              name: account.name,
              type: account.type,
              category: account.category,
              description: account.description
            }
          })
          results.financeAccounts.imported++
        } catch (err) {
          results.financeAccounts.errors.push(`Failed to import account ${account.code}: ${err}`)
        }
      }
    }

    // 공지사항 데이터 가져오기
    if (data.notices && Array.isArray(data.notices)) {
      results.notices = { imported: 0, skipped: 0, errors: [] }

      for (const notice of data.notices) {
        try {
          await prisma.notice.create({
            data: {
              title: notice.title,
              content: notice.content,
              isPinned: notice.isPinned || false,
              isPublic: notice.isPublic !== false
            }
          })
          results.notices.imported++
        } catch (err) {
          results.notices.errors.push(`Failed to import notice ${notice.title}: ${err}`)
        }
      }
    }

    // 도서 데이터 가져오기
    if (data.books && Array.isArray(data.books)) {
      results.books = { imported: 0, skipped: 0, errors: [] }

      for (const book of data.books) {
        try {
          const existing = await prisma.book.findFirst({
            where: { isbn: book.isbn || undefined, title: book.title }
          })
          if (existing && skipExisting) {
            results.books.skipped++
            continue
          }

          await prisma.book.create({
            data: {
              title: book.title,
              author: book.author,
              isbn: book.isbn,
              publisher: book.publisher,
              summary: book.summary || book.description,
              image: book.image || book.coverImage
            }
          })
          results.books.imported++
        } catch (err) {
          results.books.errors.push(`Failed to import book ${book.title}: ${err}`)
        }
      }
    }

    // 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DATA_IMPORT',
        target: Object.keys(results).join(','),
        details: JSON.stringify(results)
      }
    })

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
