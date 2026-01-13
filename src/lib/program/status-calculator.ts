export type ProgramStatus = 'UPCOMING' | 'RECRUITING' | 'RECRUIT_CLOSED' | 'ONGOING' | 'COMPLETED' | 'DRAFT'

export const programStatusConfig = {
  DRAFT: {
    label: '준비중',
    color: 'gray',
    badgeClass: 'bg-gray-500 text-white',
  },
  UPCOMING: {
    label: '모집예정',
    color: 'purple',
    badgeClass: 'bg-purple-500 text-white',
  },
  RECRUITING: {
    label: '모집중',
    color: 'green',
    badgeClass: 'bg-green-500 text-white',
  },
  RECRUIT_CLOSED: {
    label: '모집마감',
    color: 'yellow',
    badgeClass: 'bg-yellow-500 text-white',
  },
  ONGOING: {
    label: '진행중',
    color: 'blue',
    badgeClass: 'bg-blue-500 text-white',
  },
  COMPLETED: {
    label: '완료',
    color: 'gray',
    badgeClass: 'bg-gray-400 text-white',
  },
}

export const feeTypeConfig = {
  FREE: { label: '무료' },
  DEPOSIT: { label: '보증금' },
  FEE: { label: '참가비' },
  TUITION: { label: '수강료' },
}

export const applicationSourceConfig = {
  EXISTING_MEMBER: { label: '기존회원', hasReferrer: false },
  HANA_FOUNDATION: { label: '남북하나재단 공지', hasReferrer: false },
  SNS: { label: 'SNS 홍보', hasReferrer: false },
  KAKAO_GROUP: { label: '관련 카톡방', hasReferrer: false },
  KAKAO_CHANNEL: { label: '카카오채널/문자', hasReferrer: false },
  REFERRAL: { label: '지인추천', hasReferrer: true },
}

export const applicationStatusConfig = {
  PENDING: { label: '대기', color: 'yellow', badgeClass: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: '합격', color: 'green', badgeClass: 'bg-green-100 text-green-800' },
  ADDITIONAL: { label: '추가합격', color: 'blue', badgeClass: 'bg-blue-100 text-blue-800' },
  REJECTED: { label: '불합격', color: 'red', badgeClass: 'bg-red-100 text-red-800' },
  NO_CONTACT: { label: '연락안됨', color: 'gray', badgeClass: 'bg-gray-100 text-gray-800' },
}

export const programTypeConfig = {
  BOOKCLUB: { label: '독서모임', description: '남Book북한걸음' },
  SEMINAR: { label: '강연 및 세미나', description: '정기 교육 세미나' },
  KMOVE: { label: 'K-Move', description: 'K-move 프로그램' },
  DEBATE: { label: '토론회', description: '주제별 토론회' },
  WORKSHOP: { label: '워크숍', description: '실습 워크숍' },
  OTHER: { label: '기타', description: '기타 프로그램' },
}

interface ProgramDates {
  status?: string
  recruitStartDate?: Date | string | null
  recruitEndDate?: Date | string | null
  startDate?: Date | string | null
  endDate?: Date | string | null
}

export function getProgramStatus(program: ProgramDates): ProgramStatus {
  // If status is already set to DRAFT or manual status, use it
  if (program.status === 'DRAFT') {
    return 'DRAFT'
  }

  const now = new Date()
  const recruitStart = program.recruitStartDate ? new Date(program.recruitStartDate) : null
  const recruitEnd = program.recruitEndDate ? new Date(program.recruitEndDate) : null
  const startDate = program.startDate ? new Date(program.startDate) : null
  const endDate = program.endDate ? new Date(program.endDate) : null

  // No dates set - treat as draft
  if (!recruitStart && !recruitEnd && !startDate && !endDate) {
    return 'DRAFT'
  }

  // Calculate status based on dates
  if (recruitStart && now < recruitStart) {
    return 'UPCOMING'
  }

  if (recruitStart && recruitEnd && now >= recruitStart && now <= recruitEnd) {
    return 'RECRUITING'
  }

  if (recruitEnd && startDate && now > recruitEnd && now < startDate) {
    return 'RECRUIT_CLOSED'
  }

  if (startDate && endDate && now >= startDate && now <= endDate) {
    return 'ONGOING'
  }

  if (endDate && now > endDate) {
    return 'COMPLETED'
  }

  // Fallback to manual status or RECRUITING
  if (program.status && program.status !== 'DRAFT') {
    return program.status as ProgramStatus
  }

  return 'RECRUITING'
}

export function getStatusLabel(status: ProgramStatus): string {
  return programStatusConfig[status]?.label || status
}

export function getStatusBadgeClass(status: ProgramStatus): string {
  return programStatusConfig[status]?.badgeClass || 'bg-gray-500 text-white'
}

export function getFeeDisplay(feeType: string, feeAmount: number): string {
  if (feeType === 'FREE' || feeAmount === 0) {
    return '무료'
  }
  const config = feeTypeConfig[feeType as keyof typeof feeTypeConfig]
  const label = config?.label || '비용'
  return `${label} ${feeAmount.toLocaleString()}원`
}

export function getProgramTypeLabel(type: string): string {
  return programTypeConfig[type as keyof typeof programTypeConfig]?.label || type
}

export function getModeLabel(isOnline: boolean): string {
  return isOnline ? '온라인' : '오프라인'
}
