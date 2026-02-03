# Critical Code Review - Phase 31-40

**검토 일시:** 2026-02-03
**검토 범위:** Phase 31-40 (독서목표, 평점, AI추천, 챌린지, 타임라인, 통계, 스탬프, 소셜, 분석, i18n, 접근성, 성능 최적화)
**검토자:** Claude Opus 4.5

## 요약
- **🔴 Critical: 5건**
- **🟡 Warning: 7건**
- **🔵 Info: 4건**

---

## 🔴 Critical Issues

### [C1] timeline-queries.ts: BookReport.authorId에 User.id를 직접 사용 (잘못된 데이터 조회)
- **파일:** `src/lib/club/timeline-queries.ts:61`
- **설명:** `BookReport.authorId`는 스키마상 `Member.id`를 참조한다 (`author Member @relation(fields: [authorId], references: [id])`). 그런데 timeline-queries.ts에서는 `authorId: userId`로 `User.id`를 직접 넣고 있다. 같은 파일의 goal-queries.ts나 challenge-queries.ts에서는 올바르게 `member.findFirst({ where: { userId } })`로 먼저 member를 조회한 후 `member.id`를 사용하고 있어 불일치가 명확하다.
- **영향:** 타임라인 페이지에서 독후감(report) 항목이 전혀 표시되지 않는다. User.id와 Member.id가 우연히 같지 않는 한 빈 결과가 반환된다.
- **수정 방법:**
```typescript
// timeline-queries.ts의 report 섹션에서
// 먼저 member 조회 필요
const member = await prisma.member.findFirst({
  where: { userId },
  select: { id: true },
})

// 그 후 authorId에 member.id 사용
if (member && (type === 'all' || type === 'report')) {
  const reports = await prisma.bookReport.findMany({
    where: {
      authorId: member.id,  // userId 대신 member.id
      ...(cursorDate && { createdAt: { lt: cursorDate } }),
    },
    // ...
  })
}
```

### [C2] stats-queries.ts: BookReport.authorId에 User.id를 직접 사용 (동일 버그)
- **파일:** `src/lib/club/stats-queries.ts:42, 107`
- **설명:** C1과 동일한 버그. `getStatsOverview`와 `getMonthlyReading`에서 `authorId: userId`로 직접 User.id를 사용. 스키마상 `BookReport.authorId`는 `Member.id`를 참조한다.
- **영향:** 나의 통계 페이지에서 총 독서량(totalBooks)과 월별 독서량 차트가 항상 0으로 표시된다.
- **수정 방법:**
```typescript
// stats-queries.ts 각 함수에서 member 조회 추가
const member = await prisma.member.findFirst({
  where: { userId },
  select: { id: true },
})

// totalBooks 쿼리에서
prisma.bookReport.count({
  where: {
    authorId: member?.id ?? 'NOMATCH',
    // ...
  },
})
```

### [C3] profile-queries.ts: BookReport.authorId에 User.id를 직접 사용 (동일 버그)
- **파일:** `src/lib/club/profile-queries.ts:24, 77, 109`
- **설명:** C1/C2와 동일. `getMyProfile`, `getUserProfile`, `getRecentActivity` 모두 `authorId: userId`로 직접 조회한다.
- **영향:** 프로필 페이지에서 독후감 수(reportCount)가 항상 0으로 표시되고, 최근 활동에 독후감 항목이 누락된다.
- **수정 방법:** C1과 동일 패턴으로 member 조회 후 member.id 사용.

### [C4] challenge-queries.ts: Badge code에 사용자 입력값 직접 사용 (DB unique 제약 충돌 위험)
- **파일:** `src/lib/club/challenge-queries.ts:167`
- **설명:** `awardChallengeBadge` 함수에서 `code = CHALLENGE_${challengeTitle}`로 뱃지 코드를 생성한다. `challengeTitle`은 관리자가 입력하는 자유 텍스트이며, 이 값이 Badge 테이블의 unique `code` 필드 값이 된다. 만약 챌린지 제목에 특수문자나 매우 긴 문자열이 들어오면 의도하지 않은 코드가 생성될 수 있다. 또한 goal-queries.ts의 `awardGoalBadge`(라인 113)에서도 `code = ${category}_${badgeName}`으로 동일한 문제가 있는데, `badgeName`에 한글과 연도가 포함되어 `GOAL_YEARLY_2026년 독서 목표 달성` 같은 코드가 만들어진다.
- **영향:** Badge code가 비정상적으로 길거나 특수문자를 포함할 수 있어 DB 충돌 또는 예상치 못한 upsert 동작이 발생할 수 있다. 동일 이름의 다른 챌린지가 생성되면 배지가 중복 매핑된다.
- **수정 방법:**
```typescript
// 안전한 코드 생성
const safeCode = `CHALLENGE_${challengeId}` // challengeTitle 대신 challengeId 사용

// 또는 slugify 처리
const code = `CHALLENGE_${challengeTitle.replace(/[^a-zA-Z0-9가-힣]/g, '_').slice(0, 50)}`
```

### [C5] stamp-queries.ts: 다른 import 패턴 사용 (Named vs Default import 불일치)
- **파일:** `src/lib/club/stamp-queries.ts:1`
- **설명:** `import { prisma } from '@/lib/db'`로 named import를 사용하는데, db.ts는 `export default prisma`와 `export const prisma` 모두 내보내고 있어 현재는 동작하지만, 다른 모든 Phase 31-40 파일은 `import prisma from '@/lib/db'`(default import)를 사용한다. 이 불일치는 향후 db.ts에서 named export를 제거하면 빌드 에러를 발생시킨다.
- **영향:** 현재는 동작하나, 코드 일관성이 깨져 있어 향후 db.ts 리팩토링 시 빌드 실패 위험이 있다.
- **수정 방법:**
```typescript
// stamp-queries.ts:1
import prisma from '@/lib/db'  // default import로 통일
```

---

## 🟡 Warning Issues

### [W1] analytics-queries.ts: _getDailyGrowth에서 대량 레코드 메모리 로딩
- **파일:** `src/lib/club/analytics-queries.ts:66-97`
- **설명:** `_getDailyGrowth`는 기간 내 모든 User와 BookReport를 메모리에 로드한 후 JS에서 날짜별 집계를 수행한다. period가 '1y'인 경우 최대 365일치 모든 신규 사용자와 모든 독후감을 가져온다.
- **영향:** 사용자와 독후감이 많아지면 (예: 수천~수만 건) 메모리 사용량이 급증하고 응답 시간이 느려진다.
- **수정 방법:** Prisma의 `groupBy` 또는 raw SQL `DATE(createdAt)` 기반 집계를 사용하여 DB 레벨에서 날짜별 카운트를 수행해야 한다.
```typescript
const dailyUsers = await prisma.user.groupBy({
  by: ['createdAt'], // 이 필드를 date로 변환해야 함
  where: { createdAt: { gte: start } },
  _count: true,
})
// 또는 prisma.$queryRaw로 SQL 집계
```

### [W2] social-queries.ts: getActivityFeed에서 N+1에 가까운 다중 쿼리
- **파일:** `src/lib/club/social-queries.ts:85-161`
- **설명:** `getActivityFeed`는 다음을 순차적/병렬로 수행한다: (1) 팔로잉 목록 조회, (2) 팔로잉 유저의 member ID 조회, (3) 유저 정보 조회, (4) 독후감 조회, (5) 명문장 조회. 총 5개의 DB 쿼리를 실행하며, 팔로잉 수가 많으면 `IN` 절의 크기가 커진다.
- **영향:** 팔로잉 수가 많은 사용자의 피드 로딩이 느려질 수 있다. 현재 규모에서는 큰 문제가 아니지만 스케일 시 병목이 된다.
- **수정 방법:** 단기적으로는 팔로잉 수에 대한 `take` 제한을 추가하고, 장기적으로는 denormalized 피드 테이블을 고려.

### [W3] recommendation-service.ts: AI 추천 생성 시 Rate Limiting 없음
- **파일:** `src/lib/club/recommendation-service.ts:24-135`
- **설명:** `generateRecommendations` 함수가 호출될 때마다 Gemini API를 호출하고 DB에 새 레코드를 5개 생성한다. 사용자가 "추천 받기" 버튼을 반복 클릭하면 API 비용이 빠르게 증가하고, DB에 중복 추천이 대량 쌓인다.
- **영향:** Gemini API 비용 폭증 위험. 악의적 사용자가 반복 호출 시 API quota 소진 가능.
- **수정 방법:**
```typescript
// 마지막 추천 시간 확인
const lastRec = await prisma.bookRecommendation.findFirst({
  where: { userId },
  orderBy: { createdAt: 'desc' },
})

if (lastRec && Date.now() - lastRec.createdAt.getTime() < 60 * 60 * 1000) {
  return { error: '1시간에 1회만 추천받을 수 있습니다.' }
}
```

### [W4] timeline-queries.ts: cursor 기반 페이지네이션의 정렬 불일치 (type='all' 모드)
- **파일:** `src/lib/club/timeline-queries.ts:14-126`
- **설명:** `type='all'`인 경우 attendance, report, quote 세 종류의 데이터를 각각 `limit + 1`개씩 가져온 후 메모리에서 합치고 정렬한다. 문제는 각 쿼리가 `limit + 1`개만 가져오므로, 세 종류 합쳐서 최대 `3 * (limit + 1)`개 중 가장 최신 `limit`개만 반환된다. cursor가 적용되면 각 데이터 소스의 경계가 달라져, 특정 타입의 항목이 누락될 수 있다.
- **영향:** 타임라인의 두 번째 페이지 이후에서 일부 항목이 누락되거나 순서가 뒤바뀔 수 있다.
- **수정 방법:** 각 소스에서 cursor를 동일하게 적용하고, 더 많은 항목을 가져온 후 정확한 limit을 적용하거나, 단일 쿼리로 통합된 타임라인 모델을 사용.

### [W5] challenge-queries.ts: updateChallengeProgress의 for 루프 내 순차 DB 호출
- **파일:** `src/lib/club/challenge-queries.ts:99-156`
- **설명:** `updateChallengeProgress`에서 사용자의 모든 활성 챌린지를 순회하며, 각 챌린지마다 1~2개의 DB 쿼리(count 또는 findMany + findMany)와 1개의 update를 실행한다. 5개 챌린지에 참가 중이면 최소 10~15개의 DB 호출이 순차적으로 발생한다.
- **영향:** 독후감 작성 시 이 함수가 호출되면 응답 시간이 챌린지 수에 비례하여 증가한다.
- **수정 방법:** `Promise.all`로 병렬 처리하거나, 빈도가 높은 경우 백그라운드 큐로 분리.

### [W6] FollowButton.tsx: 에러 무시 (catch 블록이 비어있음)
- **파일:** `src/components/club/social/FollowButton.tsx:31-33`
- **설명:** `handleToggle`의 catch 블록이 `// silently fail`로 에러를 완전히 무시한다. 네트워크 오류나 서버 에러 시 사용자에게 아무런 피드백이 없다.
- **영향:** 사용자가 팔로우/언팔로우 버튼을 눌렀으나 실제로 동작하지 않았을 때, UI 상태만 토글되고 에러를 인지할 수 없다. 다만 현재 `res.ok`를 확인하므로 서버 오류 시 상태가 변경되지는 않는다. 그러나 네트워크 에러(fetch 자체 실패) 시에는 UI가 이전 상태로 복구되지 않아 상태 불일치가 발생한다.
- **수정 방법:**
```typescript
} catch {
  // 네트워크 오류 시 상태 복구 및 사용자 알림
  setIsFollowingState(isFollowingState) // 원래 상태로 복구 (낙관적 업데이트 안 쓰므로 불필요하나)
  // 또는 에러 상태 추가
}
```
참고: 현재는 `catch` 전에 상태를 변경하지 않으므로(res.ok 이후에만 변경), 실제 상태 불일치가 발생하진 않는다. 하지만 사용자에게 에러 피드백이 없는 것은 UX 문제이다.

### [W7] i18n/client.ts: useTranslation에서 locale 변경이 반영되지 않음
- **파일:** `src/i18n/client.ts:37-38`
- **설명:** `useMemo(() => getClientLocale(), [])` 에서 의존성 배열이 비어있어 컴포넌트가 마운트될 때 한 번만 locale을 읽는다. LanguageSwitch에서 쿠키를 변경한 후 `window.location.reload()`를 호출하므로 현재는 동작하지만, 만약 클라이언트 사이드 라우팅 중에 locale이 변경되면 반영되지 않는다.
- **영향:** 현재 구현에서는 `window.location.reload()`가 있어 문제없으나, 향후 SPA 네비게이션으로 전환 시 locale 변경이 반영되지 않을 수 있다.
- **수정 방법:** React Context나 외부 상태를 사용하여 locale 변경을 감지하도록 개선. 또는 현재 패턴(reload)이 의도적이라면 코드 주석으로 명시.

---

## 🔵 Info Issues

### [I1] goal-queries.ts: awardGoalBadge에서 findUnique + create 대신 upsert 미사용
- **파일:** `src/lib/club/goal-queries.ts:128-136`
- **설명:** `existing` 여부 확인 후 `create`하는 패턴 대신 `upsert`를 사용하면 race condition을 방지하고 코드를 단순화할 수 있다. challenge-queries.ts:182-190에서도 동일 패턴이 있다.
- **영향:** 동시에 같은 목표가 달성되면 이론적으로 중복 UserBadge가 생성될 수 있다 (compound unique 제약이 있으므로 에러 발생).
- **수정 방법:**
```typescript
await prisma.userBadge.upsert({
  where: { userId_badgeId: { userId, badgeId: badge.id } },
  update: {},
  create: { userId, badgeId: badge.id },
})
```

### [I2] analytics-queries.ts: 관리자 분석 페이지에서 이중 권한 체크
- **파일:** `src/app/club/(admin)/admin/analytics/page.tsx:25` 및 `src/app/club/(admin)/layout.tsx:18`
- **설명:** admin layout에서 이미 `ADMIN, SUPER_ADMIN, FACILITATOR` 권한을 확인하지만, analytics 페이지에서는 다시 `ADMIN, SUPER_ADMIN`만 허용한다. layout은 FACILITATOR도 허용하지만 analytics 각 페이지에서는 FACILITATOR를 차단한다. 이 차이가 의도적인지 불명확하다.
- **영향:** FACILITATOR가 analytics 대시보드에 접근하면 /club로 리디렉트된다. 의도적이라면 문제없으나, FACILITATOR도 볼 수 있어야 한다면 제한이 너무 강하다.
- **수정 방법:** 의도를 명확히 하고, 필요 시 FACILITATOR에게 읽기 전용 접근을 허용하거나, layout에서 analytics 관련 사이드바 메뉴도 ADMIN/SUPER_ADMIN만 보이도록 일치시키기.

### [I3] profile/[userId]/page.tsx: 팔로워/팔로잉 링크가 본인 페이지로 고정
- **파일:** `src/app/club/profile/[userId]/page.tsx:61-71`
- **설명:** 다른 사용자 프로필에서 "팔로워"/"팔로잉" 링크가 `/club/social/followers`, `/club/social/following`으로 고정되어 있다. 이 링크는 현재 로그인한 사용자의 팔로워/팔로잉을 보여주므로, 해당 프로필 주인의 팔로워/팔로잉이 아닌 자기 자신의 목록을 보게 된다.
- **영향:** 다른 사용자 프로필에서 팔로워 수를 클릭하면 자기 자신의 팔로워 목록이 표시되어 사용자 혼란 발생.
- **수정 방법:** 링크에 userId를 파라미터로 전달하거나, 다른 사용자 프로필에서는 팔로워/팔로잉 링크를 비활성화.

### [I4] LanguageSwitch.tsx: 드롭다운 외부 클릭 시 접근성 개선 필요
- **파일:** `src/components/LanguageSwitch.tsx:33`
- **설명:** 드롭다운 닫기를 위한 오버레이(`<div className="fixed inset-0 z-10" onClick={...} />`)에 `aria-hidden="true"`이나 `role="presentation"` 속성이 없다. 스크린 리더가 이 빈 div를 인식할 수 있다.
- **영향:** 접근성에 미미한 영향. 스크린 리더 사용자에게 불필요한 요소가 인식될 수 있다.
- **수정 방법:** 오버레이 div에 `aria-hidden="true"` 추가.

---

## 검토 제외 사항 (의도적 패턴)

아래 항목들은 이미 알려진 패턴이므로 이 리뷰에서 플래그하지 않았다:
- `next.config.js`의 wildcard image domain (`hostname: '**'`) - 기존 알려진 사항
- `unstable_cache` 사용 - Next.js 공식 캐시 API이며 안정적으로 동작
- 각 페이지별 auth 체크 패턴 - 일관성 있게 적용됨
- i18n 번역 파일의 한국어/영어 키 매칭 - 정상적으로 일치

## 권장 수정 우선순위

1. **즉시 수정** (C1~C3): BookReport.authorId 버그 - 3개 파일에서 동일 패턴. 타임라인, 통계, 프로필 페이지가 모두 잘못된 데이터를 표시하고 있다.
2. **빠른 수정** (C4): Badge code 생성 패턴 개선
3. **빠른 수정** (C5): stamp-queries.ts import 통일
4. **단기 수정** (W3): AI 추천 rate limiting 추가
5. **중기 수정** (W1, W2, W5): 성능 관련 쿼리 최적화
6. **관찰** (W4, W6, W7, I1~I4): UX 개선 및 코드 품질 향상
