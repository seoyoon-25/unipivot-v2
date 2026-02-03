import { unstable_cache } from 'next/cache'

/**
 * 캐시 태그 상수
 */
export const CacheTags = {
  analytics: 'analytics',
  clubNotices: 'club-notices',
  programs: 'programs',
  bookReports: 'book-reports',
  search: 'search',
  userStats: (userId: string) => `user-stats-${userId}`,
} as const

/**
 * 캐시 생성 헬퍼
 * unstable_cache를 래핑하여 태그와 revalidate 시간을 간편하게 설정
 */
export function createCachedQuery<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options: { tags?: string[]; revalidate?: number } = {}
): T {
  const { tags = [], revalidate = 300 } = options

  return unstable_cache(fn, keyParts, {
    tags,
    revalidate,
  }) as T
}
