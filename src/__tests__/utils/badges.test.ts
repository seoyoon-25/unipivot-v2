import { XP_RULES, calculateLevel } from '@/lib/utils/badges'

describe('XP_RULES', () => {
  it('has expected point values', () => {
    expect(XP_RULES.ATTEND).toBe(10)
    expect(XP_RULES.SUBMIT_REPORT).toBe(20)
    expect(XP_RULES.FACILITATE).toBe(50)
    expect(XP_RULES.SPEAK).toBe(5)
    expect(XP_RULES.STREAK_BONUS).toBe(15)
  })
})

describe('calculateLevel', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('returns level 1 for XP below 100', () => {
    expect(calculateLevel(50)).toBe(1)
    expect(calculateLevel(99)).toBe(1)
  })

  it('returns level 2 at exactly 100 XP', () => {
    expect(calculateLevel(100)).toBe(2)
  })

  it('returns level 2 for XP between 100-299', () => {
    expect(calculateLevel(200)).toBe(2)
    expect(calculateLevel(299)).toBe(2)
  })

  it('returns level 3 at 300 XP (100 + 200)', () => {
    expect(calculateLevel(300)).toBe(3)
  })

  it('returns level 4 at 600 XP (100 + 200 + 300)', () => {
    expect(calculateLevel(600)).toBe(4)
  })

  it('handles large XP values', () => {
    // 100+200+300+400+500 = 1500 -> level 6
    expect(calculateLevel(1500)).toBe(6)
  })
})
