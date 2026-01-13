// 회원 등급 시스템 상수 및 유틸리티

// 회원 역할 (role)
export const ROLES = {
  USER: 'USER',           // 일반회원
  MEMBER: 'MEMBER',       // 정회원
  STAFF: 'STAFF',         // 운영진
  ADMIN: 'ADMIN',         // 관리자
  SUPER_ADMIN: 'SUPER_ADMIN', // 최고관리자
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// 회원 등급 (grade) - 숫자로 관리
export const GRADES = {
  GUEST: 0,        // 비회원 (로그인 안됨)
  USER: 1,         // 일반회원
  MEMBER: 2,       // 정회원
  STAFF: 3,        // 운영진
  ADMIN: 4,        // 관리자
  SUPER_ADMIN: 5,  // 최고관리자
} as const

export type Grade = typeof GRADES[keyof typeof GRADES]

// 역할별 등급 매핑
export const ROLE_TO_GRADE: Record<Role, Grade> = {
  USER: GRADES.USER,
  MEMBER: GRADES.MEMBER,
  STAFF: GRADES.STAFF,
  ADMIN: GRADES.ADMIN,
  SUPER_ADMIN: GRADES.SUPER_ADMIN,
}

// 등급별 역할 매핑
export const GRADE_TO_ROLE: Record<Grade, Role> = {
  [GRADES.GUEST]: ROLES.USER, // 비회원은 USER로 취급
  [GRADES.USER]: ROLES.USER,
  [GRADES.MEMBER]: ROLES.MEMBER,
  [GRADES.STAFF]: ROLES.STAFF,
  [GRADES.ADMIN]: ROLES.ADMIN,
  [GRADES.SUPER_ADMIN]: ROLES.SUPER_ADMIN,
}

// 등급 정보
export const GRADE_INFO = {
  [GRADES.GUEST]: {
    name: '비회원',
    label: '비회원',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    description: '로그인이 필요합니다',
  },
  [GRADES.USER]: {
    name: '일반회원',
    label: '일반',
    color: 'slate',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    description: '프로그램 신청, 댓글, 좋아요 가능',
  },
  [GRADES.MEMBER]: {
    name: '정회원',
    label: '정회원',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    description: '독후감 작성, 커뮤니티 글쓰기 가능',
  },
  [GRADES.STAFF]: {
    name: '운영진',
    label: '운영진',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    description: '일부 콘텐츠 관리, 참석체크 가능',
  },
  [GRADES.ADMIN]: {
    name: '관리자',
    label: '관리자',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    description: '프로그램/공지 등록, 회원 관리 가능',
  },
  [GRADES.SUPER_ADMIN]: {
    name: '최고관리자',
    label: '최고관리자',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    description: '모든 권한 (설정, 백업 등)',
  },
} as const

// 권한 체크 함수들

/**
 * 주어진 등급이 필요 등급 이상인지 확인
 */
export function hasGrade(userGrade: number, requiredGrade: Grade): boolean {
  return userGrade >= requiredGrade
}

/**
 * 관리자인지 확인 (ADMIN 이상)
 */
export function isAdmin(role?: string | null, grade?: number | null): boolean {
  if (grade !== null && grade !== undefined) {
    return grade >= GRADES.ADMIN
  }
  if (role) {
    return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
  }
  return false
}

/**
 * 운영진인지 확인 (STAFF 이상)
 */
export function isStaff(role?: string | null, grade?: number | null): boolean {
  if (grade !== null && grade !== undefined) {
    return grade >= GRADES.STAFF
  }
  if (role) {
    return role === ROLES.STAFF || role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
  }
  return false
}

/**
 * 정회원인지 확인 (MEMBER 이상)
 */
export function isMember(role?: string | null, grade?: number | null): boolean {
  if (grade !== null && grade !== undefined) {
    return grade >= GRADES.MEMBER
  }
  if (role) {
    return role !== ROLES.USER
  }
  return false
}

/**
 * 글쓰기 권한 확인 (콘텐츠 종류에 따라 다름)
 */
export function canWrite(
  contentType: 'program' | 'notice' | 'blog' | 'report' | 'comment' | 'community',
  role?: string | null,
  grade?: number | null
): boolean {
  const userGrade = grade ?? (role ? ROLE_TO_GRADE[role as Role] ?? GRADES.USER : GRADES.GUEST)

  switch (contentType) {
    case 'program':
    case 'notice':
    case 'blog':
      // 관리자만 작성 가능
      return userGrade >= GRADES.ADMIN

    case 'report':
    case 'community':
      // 정회원 이상 작성 가능
      return userGrade >= GRADES.MEMBER

    case 'comment':
      // 일반회원 이상 작성 가능
      return userGrade >= GRADES.USER

    default:
      return false
  }
}

/**
 * 역할에서 등급 가져오기
 */
export function getGradeFromRole(role: string): Grade {
  return ROLE_TO_GRADE[role as Role] ?? GRADES.USER
}

/**
 * 등급에서 역할 가져오기
 */
export function getRoleFromGrade(grade: number): Role {
  return GRADE_TO_ROLE[grade as Grade] ?? ROLES.USER
}

/**
 * 등급 정보 가져오기
 */
export function getGradeInfo(grade: number) {
  return GRADE_INFO[grade as Grade] ?? GRADE_INFO[GRADES.USER]
}

/**
 * 등급 변경 가능 여부 확인
 * - 자기보다 낮은 등급의 사용자만 등급 변경 가능
 * - SUPER_ADMIN만 ADMIN을 변경 가능
 */
export function canChangeGrade(
  changerGrade: number,
  targetCurrentGrade: number,
  targetNewGrade: number
): boolean {
  // SUPER_ADMIN만 다른 ADMIN의 등급 변경 가능
  if (targetCurrentGrade >= GRADES.ADMIN && changerGrade < GRADES.SUPER_ADMIN) {
    return false
  }

  // 자신보다 높은 등급으로 변경 불가 (SUPER_ADMIN 제외)
  if (targetNewGrade > changerGrade && changerGrade < GRADES.SUPER_ADMIN) {
    return false
  }

  // 자신보다 높은 등급의 사용자 변경 불가
  if (targetCurrentGrade >= changerGrade && changerGrade < GRADES.SUPER_ADMIN) {
    return false
  }

  return true
}

// 등급 옵션 목록 (UI용)
export const GRADE_OPTIONS = [
  { value: GRADES.USER, label: '일반회원', role: ROLES.USER },
  { value: GRADES.MEMBER, label: '정회원', role: ROLES.MEMBER },
  { value: GRADES.STAFF, label: '운영진', role: ROLES.STAFF },
  { value: GRADES.ADMIN, label: '관리자', role: ROLES.ADMIN },
  { value: GRADES.SUPER_ADMIN, label: '최고관리자', role: ROLES.SUPER_ADMIN },
]

// 등급 승급 기준 정보
export const GRADE_REQUIREMENTS = {
  [GRADES.MEMBER]: {
    description: '프로그램 1회 이상 참여 완료',
    autoUpgrade: true, // 자동 승급 가능 여부
  },
  [GRADES.STAFF]: {
    description: '관리자 승인 필요 (봉사자, 인턴 등)',
    autoUpgrade: false,
  },
  [GRADES.ADMIN]: {
    description: '최고관리자 승인 필요',
    autoUpgrade: false,
  },
  [GRADES.SUPER_ADMIN]: {
    description: '시스템 설정으로만 변경 가능',
    autoUpgrade: false,
  },
}
