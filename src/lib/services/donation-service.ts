import prisma from '@/lib/db'
import { generateDonationReceiptPDF, generateReceiptNumber } from '@/lib/utils/donation-receipt'
import * as fs from 'fs/promises'
import path from 'path'

interface ConvertDepositInput {
  applicationId: string
  amount: number
  donorName: string
  isAnonymous: boolean
  message?: string
  receiptRequested?: boolean
}

/**
 * 보증금을 후원으로 전환
 */
export async function convertDepositToDonation(input: ConvertDepositInput) {
  const { applicationId, amount, donorName, isAnonymous, message, receiptRequested } = input

  // 신청 정보 조회
  const application = await prisma.programApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: true,
      program: true,
    },
  })

  if (!application) {
    throw new Error('신청 정보를 찾을 수 없습니다.')
  }

  // 트랜잭션으로 처리
  const result = await prisma.$transaction(async (tx) => {
    // 1. 후원 기록 생성
    const donation = await tx.donation.create({
      data: {
        userId: application.userId,
        donorName: isAnonymous ? '익명' : donorName,
        anonymous: isAnonymous,
        type: 'DEPOSIT_CONVERT',
        sourceType: 'PROGRAM_DEPOSIT',
        sourceId: applicationId,
        amount,
        message,
        receiptRequested: receiptRequested || false,
        status: 'COMPLETED',
      },
    })

    // 2. 신청 상태 업데이트
    await tx.programApplication.update({
      where: { id: applicationId },
      data: {
        depositStatus: 'DONATED',
        donatedAmount: amount,
        donatedAt: new Date(),
      },
    })

    // 3. 프로그램 보증금 설정 업데이트 (후원 총액)
    if (application.program.id) {
      await tx.depositSetting.updateMany({
        where: { programId: application.program.id },
        data: {
          totalDonated: { increment: amount },
        },
      })
    }

    // 4. 회계 기록 생성 (선택)
    try {
      await tx.transaction.create({
        data: {
          type: 'INCOME',
          category: 'DONATION',
          amount,
          description: `보증금 후원 전환 - ${isAnonymous ? '익명' : donorName} (${application.program.title})`,
          date: new Date(),
        },
      })
    } catch (error) {
      // Transaction 모델이 없을 경우 무시
      console.log('Transaction record skipped:', error)
    }

    return donation
  })

  return result
}

/**
 * 후원 목록 조회 (프로그램별)
 */
export async function getDonationsByProgram(programId: string) {
  const donations = await prisma.donation.findMany({
    where: {
      sourceType: 'PROGRAM_DEPOSIT',
      sourceId: {
        in: (
          await prisma.programApplication.findMany({
            where: { programId },
            select: { id: true },
          })
        ).map((a) => a.id),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const summary = {
    total: donations.length,
    totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
    anonymousCount: donations.filter((d) => d.anonymous).length,
    receiptRequestedCount: donations.filter((d) => d.receiptRequested).length,
  }

  return { donations, summary }
}

/**
 * 기부금 영수증 발급 처리
 */
export async function issueReceipt(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!donation) {
    throw new Error('후원 정보를 찾을 수 없습니다.')
  }

  if (donation.receiptIssued) {
    throw new Error('이미 영수증이 발급되었습니다.')
  }

  // 영수증 번호 생성
  const receiptNumber = generateReceiptNumber(donationId)

  // PDF 영수증 생성
  const pdfBytes = await generateDonationReceiptPDF({
    donationId,
    receiptNumber,
    donorName: donation.donorName || donation.user?.name || '익명',
    donorEmail: donation.user?.email || undefined,
    amount: donation.amount,
    donationType: donation.type === 'MONTHLY' ? '정기 후원' :
                  donation.type === 'DEPOSIT_CONVERT' ? '보증금 전환 후원' : '일시 후원',
    donationDate: donation.createdAt,
    organizationName: process.env.ORGANIZATION_NAME || 'UniPivot',
    organizationAddress: process.env.ORGANIZATION_ADDRESS || '서울특별시',
    organizationContact: process.env.ORGANIZATION_CONTACT || 'contact@unipivot.org',
    organizationRegistrationNumber: process.env.ORGANIZATION_REG_NUMBER || '000-00-00000',
  })

  // PDF 파일 저장
  const receiptsDir = path.join(process.cwd(), 'public', 'receipts')
  await fs.mkdir(receiptsDir, { recursive: true })

  const fileName = `receipt_${donationId}_${receiptNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  const filePath = path.join(receiptsDir, fileName)
  await fs.writeFile(filePath, pdfBytes)

  // 데이터베이스 업데이트
  const updated = await prisma.donation.update({
    where: { id: donationId },
    data: {
      receiptIssued: true,
      receiptIssuedAt: new Date(),
    },
  })

  return {
    ...updated,
    receiptNumber,
    receiptUrl: `/receipts/${fileName}`,
  }
}

/**
 * 기부금 영수증 다운로드
 */
export async function getReceiptPDF(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!donation) {
    throw new Error('후원 정보를 찾을 수 없습니다.')
  }

  if (!donation.receiptIssued) {
    throw new Error('영수증이 발급되지 않았습니다.')
  }

  // 영수증 번호 생성 (동일한 방식으로 재생성)
  const receiptNumber = generateReceiptNumber(donationId)

  // PDF 생성
  const pdfBytes = await generateDonationReceiptPDF({
    donationId,
    receiptNumber,
    donorName: donation.donorName || donation.user?.name || '익명',
    donorEmail: donation.user?.email || undefined,
    amount: donation.amount,
    donationType: donation.type === 'MONTHLY' ? '정기 후원' :
                  donation.type === 'DEPOSIT_CONVERT' ? '보증금 전환 후원' : '일시 후원',
    donationDate: donation.createdAt,
    organizationName: process.env.ORGANIZATION_NAME || 'UniPivot',
    organizationAddress: process.env.ORGANIZATION_ADDRESS || '서울특별시',
    organizationContact: process.env.ORGANIZATION_CONTACT || 'contact@unipivot.org',
    organizationRegistrationNumber: process.env.ORGANIZATION_REG_NUMBER || '000-00-00000',
  })

  return {
    pdfBytes,
    fileName: `donation_receipt_${donationId}.pdf`,
  }
}

/**
 * 후원 통계
 */
export async function getDonationStats(startDate?: Date, endDate?: Date) {
  const where: any = {
    status: 'COMPLETED',
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const donations = await prisma.donation.findMany({
    where,
    select: {
      amount: true,
      type: true,
      anonymous: true,
      createdAt: true,
    },
  })

  return {
    totalCount: donations.length,
    totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
    byType: {
      oneTime: donations.filter((d) => d.type === 'ONE_TIME').length,
      monthly: donations.filter((d) => d.type === 'MONTHLY').length,
      depositConvert: donations.filter((d) => d.type === 'DEPOSIT_CONVERT').length,
    },
    anonymousCount: donations.filter((d) => d.anonymous).length,
  }
}
