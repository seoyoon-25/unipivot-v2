// 리서치랩 상수 정의

// 결혼 여부
export const MaritalStatusOptions = [
  { value: 'SINGLE', label: '미혼' },
  { value: 'MARRIED', label: '기혼' },
  { value: 'DIVORCED', label: '이혼' },
  { value: 'WIDOWED', label: '사별' },
  { value: 'SEPARATED', label: '별거' },
  { value: 'OTHER', label: '기타' },
] as const

export type MaritalStatus = typeof MaritalStatusOptions[number]['value']

// 학력
export const EducationLevelOptions = [
  { value: 'NONE', label: '무학' },
  { value: 'ELEMENTARY', label: '초등학교' },
  { value: 'MIDDLE', label: '중학교' },
  { value: 'HIGH', label: '고등학교' },
  { value: 'COLLEGE_2', label: '전문대(2-3년제)' },
  { value: 'COLLEGE_4', label: '대학교(4년제)' },
  { value: 'MASTERS', label: '석사' },
  { value: 'DOCTORATE', label: '박사' },
  { value: 'OTHER', label: '기타' },
] as const

export type EducationLevel = typeof EducationLevelOptions[number]['value']

// 직업 (복수 선택 가능)
export const OccupationOptions = [
  { value: 'STUDENT', label: '학생' },
  { value: 'OFFICE_WORKER', label: '회사원/직장인' },
  { value: 'SELF_EMPLOYED', label: '자영업' },
  { value: 'PUBLIC_SERVANT', label: '공무원' },
  { value: 'PROFESSIONAL', label: '전문직 (의사, 변호사, 회계사 등)' },
  { value: 'EDUCATOR', label: '교육자 (교사, 강사, 교수)' },
  { value: 'RESEARCHER', label: '연구원' },
  { value: 'HEALTHCARE', label: '의료/보건' },
  { value: 'SOCIAL_WORKER', label: '사회복지사' },
  { value: 'SERVICE', label: '서비스업' },
  { value: 'MANUFACTURING', label: '제조업/생산직' },
  { value: 'CONSTRUCTION', label: '건설업' },
  { value: 'AGRICULTURE', label: '농림어업' },
  { value: 'FREELANCER', label: '프리랜서' },
  { value: 'HOMEMAKER', label: '가사/육아' },
  { value: 'UNEMPLOYED', label: '무직/구직중' },
  { value: 'RETIRED', label: '은퇴' },
  { value: 'OTHER', label: '기타' },
] as const

export type Occupation = typeof OccupationOptions[number]['value']

// 뱃지 타입
export const BadgeTypes = {
  EXPERT: {
    id: 'expert',
    label: '전문가',
    description: '인증된 전문가/강사',
    color: 'bg-purple-500',
    icon: 'Award',
  },
  INSTRUCTOR: {
    id: 'instructor',
    label: '강사',
    description: '강연 경험 보유',
    color: 'bg-blue-500',
    icon: 'Mic',
  },
  PARTICIPANT: {
    id: 'participant',
    label: '참가자',
    description: '설문/인터뷰 참여자',
    color: 'bg-green-500',
    icon: 'ClipboardCheck',
  },
} as const

export type BadgeType = keyof typeof BadgeTypes

// 뱃지 데이터 인터페이스
export interface BadgeData {
  expert?: {
    earned: boolean
    earnedAt?: string
    expertProfileId?: string
  }
  instructor?: {
    earned: boolean
    earnedAt?: string
    matchCount: number
  }
  participant?: {
    earned: boolean
    earnedAt?: string
    surveyCount: number
    interviewCount: number
  }
}

// 전문가 인증 상태
export const ExpertVerificationStatus = {
  NONE: '미신청',
  PENDING: '심사중',
  VERIFIED: '인증완료',
  REJECTED: '반려',
} as const

export type ExpertVerificationStatusType = keyof typeof ExpertVerificationStatus

// 프로필 필수 필드
export const RequiredProfileFields = [
  'birthYear',
  'birthRegion',
  'hometown',
  'maritalStatus',
  'educationHometown',
  'educationKorea',
  'occupations',
] as const

// 프로필 완성도 확인
export function isProfileComplete(profile: {
  birthYear?: number | null
  birthRegion?: string | null
  hometown?: string | null
  maritalStatus?: string | null
  educationHometown?: string | null
  educationKorea?: string | null
  occupations?: string | null
}): boolean {
  return !!(
    profile.birthYear &&
    profile.birthRegion &&
    profile.hometown &&
    profile.maritalStatus &&
    profile.educationHometown &&
    profile.educationKorea &&
    profile.occupations
  )
}

// 라벨 찾기 헬퍼
export function getMaritalStatusLabel(value: string): string {
  return MaritalStatusOptions.find(opt => opt.value === value)?.label || value
}

export function getEducationLevelLabel(value: string): string {
  return EducationLevelOptions.find(opt => opt.value === value)?.label || value
}

export function getOccupationLabels(values: string[]): string[] {
  return values.map(v => OccupationOptions.find(opt => opt.value === v)?.label || v)
}
