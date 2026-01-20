/**
 * 독후감 관련 유틸리티
 *
 * 마감 기준: 모임 전날 23:59
 */

/**
 * 독후감 마감일 계산
 * @param sessionDate 모임 날짜
 * @returns 마감일 (모임 전날 23:59:59)
 */
export function getReviewDeadline(sessionDate: Date): Date {
  const deadline = new Date(sessionDate)
  deadline.setDate(deadline.getDate() - 1) // 전날
  deadline.setHours(23, 59, 59, 999) // 23:59:59
  return deadline
}

/**
 * 마감일 경과 여부 확인
 * @param sessionDate 모임 날짜
 * @param currentTime 현재 시간 (기본: 현재)
 * @returns 마감 경과 여부
 */
export function isReviewDeadlinePassed(
  sessionDate: Date,
  currentTime: Date = new Date()
): boolean {
  const deadline = getReviewDeadline(sessionDate)
  return currentTime > deadline
}

/**
 * 마감까지 남은 시간 계산
 * @param sessionDate 모임 날짜
 * @param currentTime 현재 시간 (기본: 현재)
 * @returns 남은 시간 (밀리초), 음수면 마감됨
 */
export function getTimeUntilDeadline(
  sessionDate: Date,
  currentTime: Date = new Date()
): number {
  const deadline = getReviewDeadline(sessionDate)
  return deadline.getTime() - currentTime.getTime()
}

/**
 * 마감까지 남은 시간 포맷
 * @param sessionDate 모임 날짜
 * @returns 포맷된 문자열
 */
export function formatTimeUntilDeadline(sessionDate: Date): string {
  const remaining = getTimeUntilDeadline(sessionDate)

  if (remaining <= 0) {
    return '마감됨'
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}일 ${hours}시간 남음`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`
  } else {
    return `${minutes}분 남음`
  }
}

/**
 * 마감 긴급도 레벨
 */
export type UrgencyLevel = 'safe' | 'warning' | 'urgent' | 'expired'

export function getDeadlineUrgency(sessionDate: Date): UrgencyLevel {
  const remaining = getTimeUntilDeadline(sessionDate)

  if (remaining <= 0) {
    return 'expired'
  }

  const hoursRemaining = remaining / (1000 * 60 * 60)

  if (hoursRemaining <= 6) {
    return 'urgent'
  } else if (hoursRemaining <= 24) {
    return 'warning'
  } else {
    return 'safe'
  }
}

/**
 * 긴급도별 색상 클래스
 */
export function getUrgencyColorClass(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'safe':
      return 'text-green-600 bg-green-50'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50'
    case 'urgent':
      return 'text-red-600 bg-red-50 animate-pulse'
    case 'expired':
      return 'text-gray-500 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * 독후감 작성 가이드라인
 */
export const REVIEW_GUIDELINES = {
  minLength: 100, // 최소 글자 수
  maxLength: 10000, // 최대 글자 수
  titleMinLength: 2,
  titleMaxLength: 100,
}

/**
 * 독후감 유효성 검사
 */
export function validateReview(title: string, content: string): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  // Title validation
  if (!title.trim()) {
    errors.title = '제목을 입력해주세요'
  } else if (title.length < REVIEW_GUIDELINES.titleMinLength) {
    errors.title = `제목은 최소 ${REVIEW_GUIDELINES.titleMinLength}자 이상이어야 합니다`
  } else if (title.length > REVIEW_GUIDELINES.titleMaxLength) {
    errors.title = `제목은 ${REVIEW_GUIDELINES.titleMaxLength}자를 초과할 수 없습니다`
  }

  // Content validation
  if (!content.trim()) {
    errors.content = '내용을 입력해주세요'
  } else if (content.length < REVIEW_GUIDELINES.minLength) {
    errors.content = `독후감은 최소 ${REVIEW_GUIDELINES.minLength}자 이상이어야 합니다`
  } else if (content.length > REVIEW_GUIDELINES.maxLength) {
    errors.content = `독후감은 ${REVIEW_GUIDELINES.maxLength}자를 초과할 수 없습니다`
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 독후감 제출 현황 통계
 */
export interface ReviewStats {
  submitted: number
  total: number
  rate: number
  onTime: number
  late: number
}

export function calculateReviewStats(
  reviews: { submittedAt: Date; sessionDate: Date }[],
  totalSessions: number
): ReviewStats {
  const submitted = reviews.length
  const rate = totalSessions > 0 ? Math.round((submitted / totalSessions) * 100) : 0

  let onTime = 0
  let late = 0

  reviews.forEach((review) => {
    const deadline = getReviewDeadline(review.sessionDate)
    if (review.submittedAt <= deadline) {
      onTime++
    } else {
      late++
    }
  })

  return {
    submitted,
    total: totalSessions,
    rate,
    onTime,
    late,
  }
}

/**
 * 포인트 계산 (독후감 기본 200점)
 */
export const REVIEW_POINTS = 200

export function calculateReviewPoints(isOnTime: boolean): number {
  // 기본 200점, 추가 보너스 없음
  return REVIEW_POINTS
}

/**
 * 글자 수 포맷
 */
export function formatCharCount(current: number, max: number): string {
  return `${current.toLocaleString()} / ${max.toLocaleString()}자`
}

/**
 * localStorage 키 생성
 */
export function getAutoSaveKey(programId: string, sessionId: string): string {
  return `review_draft_${programId}_${sessionId}`
}

/**
 * 임시저장 데이터 타입
 */
export interface ReviewDraft {
  title: string
  content: string
  isPublic: boolean
  savedAt: string
}

/**
 * 임시저장
 */
export function saveReviewDraft(
  programId: string,
  sessionId: string,
  data: Omit<ReviewDraft, 'savedAt'>
): void {
  const key = getAutoSaveKey(programId, sessionId)
  const draft: ReviewDraft = {
    ...data,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(key, JSON.stringify(draft))
}

/**
 * 임시저장 불러오기
 */
export function loadReviewDraft(
  programId: string,
  sessionId: string
): ReviewDraft | null {
  const key = getAutoSaveKey(programId, sessionId)
  const saved = localStorage.getItem(key)

  if (!saved) return null

  try {
    return JSON.parse(saved) as ReviewDraft
  } catch {
    return null
  }
}

/**
 * 임시저장 삭제
 */
export function clearReviewDraft(programId: string, sessionId: string): void {
  const key = getAutoSaveKey(programId, sessionId)
  localStorage.removeItem(key)
}
