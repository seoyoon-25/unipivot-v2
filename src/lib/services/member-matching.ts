import { prisma } from '@/lib/db';

// 신청자 정보 인터페이스
interface ApplicantInfo {
  name: string;
  email?: string;
  phone?: string;
  birthYear?: number;
  hometown?: string;
}

// 매칭 결과 인터페이스
interface MatchResult {
  matched: boolean;
  member?: {
    id: string;
    memberCode: string;
    name: string;
    status: string;
    grade: string;
    email?: string | null;
    phone?: string | null;
    stats?: {
      attendanceRate: number;
      totalPrograms: number;
      noShowCount: number;
    } | null;
  };
  matchType?: 'email' | 'phone' | 'name_birth' | 'name_hometown';
  alertLevel: 'NONE' | 'WATCH' | 'WARNING' | 'BLOCKED';
  alertMessage?: string;
}

// 등급 정보
export const MEMBER_GRADES = {
  STAFF: { label: '운영진', emoji: '🌟', priority: 1 },
  VVIP: { label: 'VVIP', emoji: '💎', priority: 2 },
  VIP: { label: 'VIP', emoji: '⭐', priority: 3 },
  MEMBER: { label: '일반', emoji: '👤', priority: 4 },
  NEW: { label: '신규', emoji: '🆕', priority: 5 },
} as const;

// 상태 정보
export const MEMBER_STATUS = {
  ACTIVE: { label: '활동', emoji: '✅', color: 'green' },
  WATCH: { label: '관찰', emoji: '🟡', color: 'yellow' },
  WARNING: { label: '경고', emoji: '🟠', color: 'orange' },
  BLOCKED: { label: '차단', emoji: '🔴', color: 'red' },
} as const;

/**
 * 신청자를 기존 회원과 매칭
 * 매칭 우선순위: 이메일 > 전화번호 > 이름+출생년도 > 이름+고향
 */
export async function matchApplicant(applicant: ApplicantInfo): Promise<MatchResult> {
  // 1순위: 이메일 일치
  if (applicant.email) {
    const member = await prisma.member.findFirst({
      where: { email: applicant.email },
      select: {
        id: true,
        memberCode: true,
        name: true,
        status: true,
        grade: true,
        email: true,
        phone: true,
        stats: {
          select: {
            attendanceRate: true,
            totalPrograms: true,
            noShowCount: true,
          },
        },
      },
    });

    if (member) {
      return {
        matched: true,
        member,
        matchType: 'email',
        alertLevel: getAlertLevel(member.status),
        alertMessage: getAlertMessage(member.status, member.name),
      };
    }
  }

  // 2순위: 전화번호 일치
  if (applicant.phone) {
    const normalizedPhone = normalizePhone(applicant.phone);
    const member = await prisma.member.findFirst({
      where: { phone: normalizedPhone },
      select: {
        id: true,
        memberCode: true,
        name: true,
        status: true,
        grade: true,
        email: true,
        phone: true,
        stats: {
          select: {
            attendanceRate: true,
            totalPrograms: true,
            noShowCount: true,
          },
        },
      },
    });

    if (member) {
      return {
        matched: true,
        member,
        matchType: 'phone',
        alertLevel: getAlertLevel(member.status),
        alertMessage: getAlertMessage(member.status, member.name),
      };
    }
  }

  // 3순위: 이름 + 출생년도 일치
  if (applicant.birthYear) {
    const member = await prisma.member.findFirst({
      where: {
        name: applicant.name,
        birthYear: applicant.birthYear,
      },
      select: {
        id: true,
        memberCode: true,
        name: true,
        status: true,
        grade: true,
        email: true,
        phone: true,
        stats: {
          select: {
            attendanceRate: true,
            totalPrograms: true,
            noShowCount: true,
          },
        },
      },
    });

    if (member) {
      return {
        matched: true,
        member,
        matchType: 'name_birth',
        alertLevel: getAlertLevel(member.status),
        alertMessage: getAlertMessage(member.status, member.name),
      };
    }
  }

  // 4순위: 이름 + 고향 유사 매칭
  if (applicant.hometown) {
    const member = await prisma.member.findFirst({
      where: {
        name: applicant.name,
        hometown: { contains: applicant.hometown },
      },
      select: {
        id: true,
        memberCode: true,
        name: true,
        status: true,
        grade: true,
        email: true,
        phone: true,
        stats: {
          select: {
            attendanceRate: true,
            totalPrograms: true,
            noShowCount: true,
          },
        },
      },
    });

    if (member) {
      return {
        matched: true,
        member,
        matchType: 'name_hometown',
        alertLevel: getAlertLevel(member.status),
        alertMessage: getAlertMessage(member.status, member.name),
      };
    }
  }

  // 매칭 없음 - 신규 신청자
  return { matched: false, alertLevel: 'NONE' };
}

/**
 * 상태에 따른 알림 레벨 반환
 */
function getAlertLevel(status: string): 'NONE' | 'WATCH' | 'WARNING' | 'BLOCKED' {
  switch (status) {
    case 'BLOCKED':
      return 'BLOCKED';
    case 'WARNING':
      return 'WARNING';
    case 'WATCH':
      return 'WATCH';
    default:
      return 'NONE';
  }
}

/**
 * 상태에 따른 알림 메시지 반환
 */
function getAlertMessage(status: string, name: string): string | undefined {
  switch (status) {
    case 'BLOCKED':
      return `🚫 ${name}님은 차단된 회원입니다. 승인이 권장되지 않습니다.`;
    case 'WARNING':
      return `🚨 ${name}님은 경고 회원입니다. 승인에 신중을 기해주세요.`;
    case 'WATCH':
      return `⚠️ ${name}님은 관찰 대상 회원입니다. 확인 후 승인해주세요.`;
    default:
      return undefined;
  }
}

/**
 * 전화번호 정규화 (숫자만 추출)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * 회원 고유번호 생성
 * 형식: YY-YYMM-NN (출생년도2자리-가입년월-순번)
 * 예: 92-1806-01 (1992년생, 2018년 6월 가입, 첫 번째)
 */
export async function generateMemberCode(
  birthYear: number | null,
  joinDate: Date
): Promise<string> {
  // 출생년도 코드 (없으면 00)
  const birthCode = birthYear ? String(birthYear).slice(-2) : '00';

  // 가입년월 (YYMM)
  const year = String(joinDate.getFullYear()).slice(-2);
  const month = String(joinDate.getMonth() + 1).padStart(2, '0');
  const yearMonth = year + month;

  // 같은 조건의 기존 회원 수 조회하여 순번 결정
  const prefix = `${birthCode}-${yearMonth}-`;
  const existingCount = await prisma.member.count({
    where: {
      memberCode: { startsWith: prefix },
    },
  });

  // 순번 (01, 02, ...)
  const sequence = String(existingCount + 1).padStart(2, '0');

  return `${birthCode}-${yearMonth}-${sequence}`;
}

/**
 * 기존 고유번호 형식 변환
 * 홍길동1992 + 가입일 2018-06-26 → 92-1806-01
 */
export function convertLegacyMemberCode(
  oldCode: string,
  joinDate: Date,
  sequence: number
): string {
  // 출생년도 추출 (뒤 4자리 숫자)
  const birthYearMatch = oldCode.match(/\d{4}$/);
  const birthYear = birthYearMatch ? birthYearMatch[0].slice(-2) : '00';

  // 가입년월
  const year = String(joinDate.getFullYear()).slice(-2);
  const month = String(joinDate.getMonth() + 1).padStart(2, '0');
  const yearMonth = year + month;

  // 순번
  const seq = String(sequence).padStart(2, '0');

  return `${birthYear}-${yearMonth}-${seq}`;
}

/**
 * 여러 신청자 일괄 매칭
 */
export async function matchApplicants(
  applicants: ApplicantInfo[]
): Promise<Map<string, MatchResult>> {
  const results = new Map<string, MatchResult>();

  for (const applicant of applicants) {
    const key = `${applicant.name}-${applicant.email || ''}-${applicant.phone || ''}`;
    const result = await matchApplicant(applicant);
    results.set(key, result);
  }

  return results;
}

/**
 * 프로그램 신청자 중 블랙리스트 회원 확인
 */
export async function checkBlacklistInApplications(programId: string) {
  // 해당 프로그램의 모든 신청자 조회
  const applications = await prisma.programApplication.findMany({
    where: { programId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          birthYear: true,
        },
      },
    },
  });

  const alerts: {
    applicationId: string;
    applicantName: string;
    matchResult: MatchResult;
  }[] = [];

  for (const app of applications) {
    if (!app.user) continue;

    const applicantInfo: ApplicantInfo = {
      name: app.user.name || '',
      email: app.user.email,
      phone: app.user.phone || undefined,
      birthYear: app.user.birthYear || undefined,
      hometown: app.hometown || undefined,
    };

    const matchResult = await matchApplicant(applicantInfo);

    if (matchResult.alertLevel !== 'NONE') {
      alerts.push({
        applicationId: app.id,
        applicantName: app.user.name || '이름 없음',
        matchResult,
      });
    }
  }

  return {
    totalApplications: applications.length,
    blockedCount: alerts.filter((a) => a.matchResult.alertLevel === 'BLOCKED').length,
    warningCount: alerts.filter((a) => a.matchResult.alertLevel === 'WARNING').length,
    watchCount: alerts.filter((a) => a.matchResult.alertLevel === 'WATCH').length,
    alerts,
  };
}
