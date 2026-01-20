/**
 * Phase 13: 진행자 지원 + RSVP + 인센티브 시스템 타입 정의
 */

// 프로그램 역할
export type ProgramRole = 'ORGANIZER' | 'PARTICIPANT'

// 진행자 유형
export type FacilitatorType = 'ORGANIZER' | 'VOLUNTEER'

// 지원 상태
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// RSVP 상태
export type RSVPStatus = 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'

// 인센티브 유형
export type IncentiveType = 'ATTENDANCE' | 'REPORT'

// 체크리스트 항목 카테고리
export type ChecklistCategory = 'preparation' | 'content' | 'planning' | 'materials'

// 체크리스트 항목
export interface ChecklistItem {
  id: string
  text: string
  order: number
  category: ChecklistCategory
  optional?: boolean
}

// 체크리스트 템플릿
export interface ChecklistTemplate {
  items: ChecklistItem[]
  isRequired: boolean
}

// 진행자 인센티브 정보
export interface FacilitatorIncentive {
  granted: boolean
  type?: IncentiveType
  applied: boolean
  description: string
}

// 진행자 지원 정보
export interface FacilitatorApplicationInfo {
  id: string
  sessionId: string
  userId: string
  status: ApplicationStatus
  message?: string | null
  reviewedBy?: string | null
  reviewedAt?: Date | null
  reviewNote?: string | null
  createdAt: Date
  user?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

// 세션 진행자 정보
export interface SessionFacilitatorInfo {
  id: string
  sessionId: string
  userId: string
  type: FacilitatorType
  assignedBy?: string | null
  note?: string | null
  incentiveGranted: boolean
  incentiveType?: IncentiveType | null
  incentiveApplied: boolean
  createdAt: Date
  user?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  checklist?: {
    completedItems: string[]
    progress: number
  }
}

// RSVP 정보
export interface SessionRSVPInfo {
  id: string
  sessionId: string
  userId: string
  status: RSVPStatus
  respondedAt?: Date | null
  note?: string | null
  reminderSentAt?: Date | null
  createdAt: Date
  user?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

// RSVP 통계
export interface RSVPStats {
  total: number
  attending: number
  notAttending: number
  maybe: number
  pending: number
  responseRate: number
}

// 환급 계산 결과 (인센티브 반영)
export interface RefundEligibilityWithIncentive {
  isEligible: boolean
  reason: string
  criteria: {
    attendance: {
      count: number
      total: number
      rate: number
      met: boolean
      waivers: number // 진행자 인센티브로 면제받은 횟수
    }
    review: {
      count: number
      total: number
      rate: number
      met: boolean
      waivers: number // 진행자 인센티브로 면제받은 횟수
    }
  }
  facilitatorSessions: number // 진행한 횟수
}

// 프로그램 멤버십 정보
export interface ProgramMembershipInfo {
  id: string
  programId: string
  userId: string
  role: ProgramRole
  createdAt: Date
  user?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

// 기본 체크리스트 템플릿 타입
export type DefaultChecklistType = 'basic' | 'detailed' | 'simple'

// 기본 체크리스트 템플릿
export const DEFAULT_CHECKLIST_TEMPLATES: Record<DefaultChecklistType, ChecklistItem[]> = {
  basic: [
    { id: '1', text: '읽기 범위 확인', category: 'preparation', order: 1 },
    { id: '2', text: '토론 질문 3개 이상 준비', category: 'content', order: 2 },
    { id: '3', text: '타임 테이블 작성', category: 'planning', order: 3 },
    { id: '4', text: '발제문 작성 (선택)', category: 'content', order: 4, optional: true },
    { id: '5', text: '진행 순서 확인', category: 'planning', order: 5 },
    { id: '6', text: '자료 준비 (선택)', category: 'materials', order: 6, optional: true },
  ],
  detailed: [
    { id: '1', text: '책 전체 읽기 완료', category: 'preparation', order: 1 },
    { id: '2', text: '읽기 범위 재확인', category: 'preparation', order: 2 },
    { id: '3', text: '핵심 키워드 정리', category: 'content', order: 3 },
    { id: '4', text: '토론 질문 5개 이상 준비', category: 'content', order: 4 },
    { id: '5', text: '발제문 작성', category: 'content', order: 5 },
    { id: '6', text: '관련 자료 조사', category: 'materials', order: 6, optional: true },
    { id: '7', text: '타임 테이블 작성 (분 단위)', category: 'planning', order: 7 },
    { id: '8', text: '진행 멘트 준비', category: 'planning', order: 8 },
    { id: '9', text: 'PPT/자료 준비 (선택)', category: 'materials', order: 9, optional: true },
    { id: '10', text: '최종 점검', category: 'preparation', order: 10 },
  ],
  simple: [
    { id: '1', text: '읽기 범위 확인', category: 'preparation', order: 1 },
    { id: '2', text: '토론 질문 준비', category: 'content', order: 2 },
    { id: '3', text: '진행 순서 확인', category: 'planning', order: 3 },
  ],
}

// 체크리스트 카테고리 정보
export const CHECKLIST_CATEGORIES: Record<ChecklistCategory, { name: string; emoji: string }> = {
  preparation: { name: '사전 준비', emoji: '📚' },
  content: { name: '내용 준비', emoji: '📝' },
  planning: { name: '진행 계획', emoji: '📋' },
  materials: { name: '자료 준비', emoji: '📎' },
}

// RSVP 상태 정보
export const RSVP_STATUS_INFO: Record<RSVPStatus, { name: string; emoji: string; color: string }> = {
  PENDING: { name: '미응답', emoji: '⏳', color: 'text-gray-500 bg-gray-100' },
  ATTENDING: { name: '참석', emoji: '✅', color: 'text-green-700 bg-green-100' },
  NOT_ATTENDING: { name: '불참', emoji: '❌', color: 'text-red-700 bg-red-100' },
  MAYBE: { name: '미정', emoji: '❓', color: 'text-yellow-700 bg-yellow-100' },
}

// 진행자 유형 정보
export const FACILITATOR_TYPE_INFO: Record<FacilitatorType, { name: string; emoji: string; color: string }> = {
  ORGANIZER: { name: '운영진', emoji: '👑', color: 'text-purple-700 bg-purple-100' },
  VOLUNTEER: { name: '참가자 진행', emoji: '🙋', color: 'text-blue-700 bg-blue-100' },
}

// 지원 상태 정보
export const APPLICATION_STATUS_INFO: Record<ApplicationStatus, { name: string; emoji: string; color: string }> = {
  PENDING: { name: '대기 중', emoji: '⏳', color: 'text-yellow-700 bg-yellow-100' },
  APPROVED: { name: '승인됨', emoji: '✅', color: 'text-green-700 bg-green-100' },
  REJECTED: { name: '거절됨', emoji: '❌', color: 'text-red-700 bg-red-100' },
}
