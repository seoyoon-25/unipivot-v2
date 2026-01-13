export const BANKS = [
  { code: '004', name: 'KB국민은행', shortName: '국민' },
  { code: '088', name: '신한은행', shortName: '신한' },
  { code: '020', name: '우리은행', shortName: '우리' },
  { code: '081', name: '하나은행', shortName: '하나' },
  { code: '011', name: 'NH농협은행', shortName: '농협' },
  { code: '023', name: 'SC제일은행', shortName: 'SC제일' },
  { code: '027', name: '씨티은행', shortName: '씨티' },
  { code: '031', name: '대구은행', shortName: '대구' },
  { code: '032', name: '부산은행', shortName: '부산' },
  { code: '034', name: '광주은행', shortName: '광주' },
  { code: '035', name: '제주은행', shortName: '제주' },
  { code: '037', name: '전북은행', shortName: '전북' },
  { code: '039', name: '경남은행', shortName: '경남' },
  { code: '045', name: '새마을금고', shortName: '새마을' },
  { code: '048', name: '신협', shortName: '신협' },
  { code: '071', name: '우체국', shortName: '우체국' },
  { code: '089', name: '케이뱅크', shortName: '케이' },
  { code: '090', name: '카카오뱅크', shortName: '카카오' },
  { code: '092', name: '토스뱅크', shortName: '토스' },
] as const

export type BankCode = typeof BANKS[number]['code']
export type Bank = typeof BANKS[number]

export const getBankByCode = (code: string): Bank | undefined =>
  BANKS.find((bank) => bank.code === code)

export const getBankByName = (name: string): Bank | undefined =>
  BANKS.find((bank) => bank.name === name || bank.shortName === name)

export const formatAccountNumber = (accountNumber: string, bankCode?: string): string => {
  // 계좌번호에서 숫자만 추출
  const numbers = accountNumber.replace(/\D/g, '')

  // 은행별 포맷 (간략화)
  if (bankCode === '090') {
    // 카카오뱅크: 3333-00-0000000
    if (numbers.length === 13) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6)}`
    }
  } else if (bankCode === '004' || bankCode === '088') {
    // 국민, 신한: 000000-00-000000
    if (numbers.length === 14) {
      return `${numbers.slice(0, 6)}-${numbers.slice(6, 8)}-${numbers.slice(8)}`
    }
  }

  // 기본: 그대로 반환
  return accountNumber
}

// 계좌번호 마스킹
export const maskAccountNumber = (accountNumber: string): string => {
  const numbers = accountNumber.replace(/\D/g, '')
  if (numbers.length <= 4) return accountNumber

  const visible = 4
  const masked = numbers.slice(0, -visible).replace(/./g, '*')
  return masked + numbers.slice(-visible)
}
