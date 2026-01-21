// XP 규칙
export const XP_RULES = {
  ATTEND: 10, // 출석
  SUBMIT_REPORT: 20, // 독후감 제출
  FACILITATE: 50, // 진행
  SPEAK: 5, // 발언 (분당)
  STREAK_BONUS: 15 // 연속 출석 보너스
}

// 레벨 계산 (XP -> 레벨)
export function calculateLevel(xp: number): number {
  // 레벨당 필요 XP: 100, 200, 300, 400, ...
  let level = 1
  let requiredXp = 100
  let totalXp = 0

  while (totalXp + requiredXp <= xp) {
    totalXp += requiredXp
    level++
    requiredXp = level * 100
  }

  return level
}
