'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// 한국 은행 목록
export const KOREAN_BANKS = [
  { code: 'KB', name: 'KB국민은행' },
  { code: 'SHINHAN', name: '신한은행' },
  { code: 'WOORI', name: '우리은행' },
  { code: 'HANA', name: '하나은행' },
  { code: 'NH', name: 'NH농협은행' },
  { code: 'IBK', name: 'IBK기업은행' },
  { code: 'SC', name: 'SC제일은행' },
  { code: 'CITI', name: '씨티은행' },
  { code: 'KBANK', name: '케이뱅크' },
  { code: 'KAKAO', name: '카카오뱅크' },
  { code: 'TOSS', name: '토스뱅크' },
  { code: 'DGB', name: 'DGB대구은행' },
  { code: 'BNK', name: 'BNK부산은행' },
  { code: 'KWANGJU', name: '광주은행' },
  { code: 'JEONBUK', name: '전북은행' },
  { code: 'JEJU', name: '제주은행' },
  { code: 'KYUNGNAM', name: '경남은행' },
  { code: 'SUHYUP', name: '수협은행' },
  { code: 'POST', name: '우체국' },
  { code: 'SAEMAUL', name: '새마을금고' },
  { code: 'CU', name: '신협' },
] as const

export type BankCode = typeof KOREAN_BANKS[number]['code']

interface BankAccountInput {
  bankCode: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isDefault?: boolean
}

/**
 * 내 계좌 목록 조회
 */
export async function getMyBankAccounts() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const accounts = await prisma.bankAccount.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return accounts
}

/**
 * 기본 계좌 조회
 */
export async function getDefaultBankAccount() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  const account = await prisma.bankAccount.findFirst({
    where: {
      userId: session.user.id,
      isDefault: true,
    },
  })

  return account
}

/**
 * 계좌 추가
 */
export async function addBankAccount(input: BankAccountInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const { bankCode, bankName, accountNumber, accountHolder, isDefault } = input

  // 유효성 검사
  if (!bankCode || !bankName) {
    throw new Error('은행을 선택해주세요.')
  }
  if (!accountNumber || accountNumber.length < 10) {
    throw new Error('올바른 계좌번호를 입력해주세요.')
  }
  if (!accountHolder || accountHolder.length < 2) {
    throw new Error('예금주명을 입력해주세요.')
  }

  // 중복 체크
  const existing = await prisma.bankAccount.findUnique({
    where: {
      userId_bankCode_accountNumber: {
        userId: session.user.id,
        bankCode,
        accountNumber: accountNumber.replace(/[^0-9]/g, ''),
      },
    },
  })

  if (existing) {
    throw new Error('이미 등록된 계좌입니다.')
  }

  // 첫 계좌이거나 기본 계좌로 설정하면 다른 계좌의 기본 설정 해제
  if (isDefault) {
    await prisma.bankAccount.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    })
  }

  // 첫 계좌인지 확인
  const existingCount = await prisma.bankAccount.count({
    where: { userId: session.user.id },
  })

  const account = await prisma.bankAccount.create({
    data: {
      userId: session.user.id,
      bankCode,
      bankName,
      accountNumber: accountNumber.replace(/[^0-9]/g, ''),
      accountHolder,
      isDefault: existingCount === 0 ? true : (isDefault || false),
    },
  })

  revalidatePath('/mypage/settings/bank-account')

  return account
}

/**
 * 계좌 수정
 */
export async function updateBankAccount(
  accountId: string,
  input: Partial<BankAccountInput>
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
  })

  if (!account || account.userId !== session.user.id) {
    throw new Error('계좌를 찾을 수 없습니다.')
  }

  // 기본 계좌로 설정하면 다른 계좌의 기본 설정 해제
  if (input.isDefault) {
    await prisma.bankAccount.updateMany({
      where: {
        userId: session.user.id,
        id: { not: accountId },
      },
      data: { isDefault: false },
    })
  }

  const updated = await prisma.bankAccount.update({
    where: { id: accountId },
    data: {
      ...(input.bankCode && { bankCode: input.bankCode }),
      ...(input.bankName && { bankName: input.bankName }),
      ...(input.accountNumber && { accountNumber: input.accountNumber.replace(/[^0-9]/g, '') }),
      ...(input.accountHolder && { accountHolder: input.accountHolder }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
    },
  })

  revalidatePath('/mypage/settings/bank-account')

  return updated
}

/**
 * 계좌 삭제
 */
export async function deleteBankAccount(accountId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
  })

  if (!account || account.userId !== session.user.id) {
    throw new Error('계좌를 찾을 수 없습니다.')
  }

  await prisma.bankAccount.delete({
    where: { id: accountId },
  })

  // 삭제한 계좌가 기본 계좌였다면 다른 계좌를 기본으로 설정
  if (account.isDefault) {
    const firstAccount = await prisma.bankAccount.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (firstAccount) {
      await prisma.bankAccount.update({
        where: { id: firstAccount.id },
        data: { isDefault: true },
      })
    }
  }

  revalidatePath('/mypage/settings/bank-account')

  return { success: true }
}

/**
 * 기본 계좌 설정
 */
export async function setDefaultBankAccount(accountId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
  })

  if (!account || account.userId !== session.user.id) {
    throw new Error('계좌를 찾을 수 없습니다.')
  }

  // 모든 계좌의 기본 설정 해제
  await prisma.bankAccount.updateMany({
    where: { userId: session.user.id },
    data: { isDefault: false },
  })

  // 선택한 계좌를 기본으로 설정
  await prisma.bankAccount.update({
    where: { id: accountId },
    data: { isDefault: true },
  })

  revalidatePath('/mypage/settings/bank-account')

  return { success: true }
}
