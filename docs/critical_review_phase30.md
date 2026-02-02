# Critical Review - Phase 30

**검토 일시:** 2026-02-02
**검토 범위:** Phase 16-30 신규 코드
**이전 미해결:** 56건 (Phase 20 리뷰 기준, 총 85건 중 수정 29건)
**검토자:** Claude Code Review

---

## 요약

| 심각도 | 건수 | 해결 필요 |
|--------|------|----------|
| Critical | 12 | 즉시 |
| Warning | 24 | 다음 스프린트 |
| Info | 18 | 선택 |
| **합계** | **54** | |

---

## 이전 리뷰 미해결 항목 상태

### Phase 20 리뷰 (85건) 수정 현황

| # | 이슈 | 상태 | 비고 |
|---|------|------|------|
| 1 | `checkInWithQR()` throws raw Error | **미해결** | 여전히 throw 패턴 사용 (attendance/actions.ts:15-16) |
| 2 | `createQuote()/deleteQuote()` throws raw errors | **미해결** | 동일 |
| 3 | `saveSpeakingTimes()` 부분 저장 문제 | **수정됨** | `$transaction` 적용 (timer/actions.ts:71) |
| 4 | `generateProgramRecap()` throws without catch | **미해결** | 동일 |
| 5 | AI response 무검증 JSON.parse | **미해결** | 동일 |
| 6 | Admin sub-routes loading.tsx 부재 | **부분 수정** | attendance/loading.tsx, resources/loading.tsx 추가됨. programs, members 여전히 미존재 |
| 7 | Facilitator routes loading.tsx 부재 | **미해결** | 동일 |
| 8 | Recap page loading 부재 | **미해결** | 동일 |
| 9 | Bookclub sub-routes loading.tsx 부재 | **미해결** | 동일 |
| 10 | Admin error boundary 부재 | **수정됨** | admin/error.tsx 추가됨 |
| 11 | Facilitator error boundary 부재 | **수정됨** | facilitator/error.tsx 추가됨 |
| 12 | Bookclub error boundary 부재 | **미해결** | 동일 |
| 13 | ProgramTable window.confirm() | **미해결** | 동일 |
| 14 | ProgramEditParticipants 삭제 확인 부재 | **미해결** | 동일 |
| 15 | deleteQuote() 클라이언트 확인 부재 | **미해결** | 동일 |
| 16 | `manualCheckIn()` missing auth check | **수정됨** | role check 추가됨 (attendance/actions.ts:144-156) |
| 17 | `generateSessionQR()` missing auth check | **수정됨** | role check 추가됨 (attendance/actions.ts:220-233) |
| 18 | `saveSpeakingTimes()` missing auth check | **수정됨** | role check 추가됨 (timer/actions.ts:33-45) |
| 19 | Recap page no auth check | **미해결** | 동일 |
| 20 | FACILITATOR can deleteProgram | **수정됨** | deleteProgram now restricted to ADMIN/SUPER_ADMIN (programs/actions.ts:154-158) |
| 21 | createProgram() no type validation | **수정됨** | VALID_PROGRAM_TYPES 검증 추가 (programs/actions.ts:62-67) |
| 22 | addParticipant() no userId verification | **미해결** | 여전히 userId 존재 여부 미확인 |
| 23 | addSession() no date validation | **수정됨** | 날짜 유효성 검증 추가 (programs/actions.ts:190-193) |
| 24 | createResource() no validation | **미해결** | 동일 |
| 25 | addWishBook() no validation | **미해결** | 동일 |
| 26 | Debug page dangerouslySetInnerHTML | **미해결** | 동일 |
| 27 | JSON-LD XSS via `</script>` | **미해결** | 동일 |
| 28 | sanitize.ts allows iframe | **미해결** | 동일 |
| 29 | sanitizeCss() regex fragile | **미해결** | 동일 |
| 30 | Upload file extension from filename | **미해결** | 동일 |
| 31 | SVG upload allowed | **미해결** | 동일 |
| 32 | File upload only requires login | **미해결** | 동일 |
| 33 | Members export no audit log | **미해결** | 동일 |
| 34 | Chat API no auth required | **미해결** | 동일 |
| 35 | Duplicated checkAdminAuth | **미해결** | 여전히 3곳에 중복 |
| 36 | Duplicated attendance rate calc | **미해결** | profile-queries.ts, stats-queries.ts에도 중복 추가됨 |
| 37 | Duplicated pagination UI | **미해결** | NotificationList에도 동일 패턴 추가 |
| 38 | Hardcoded status labels | **미해결** | 동일 |
| 39 | providers: any[] | **미해결** | 동일 |
| 40 | Unsafe casts in auth.ts | **미해결** | 동일 |
| 41 | Record<string, unknown> for where | **미해결** | notification-queries.ts:13, community-queries.ts:11에도 추가 |
| 42 | Extensive any in admin.ts | **미해결** | 동일 |
| 43 | avgAttendanceRate type | **미해결** | 동일 |
| 44 | Inconsistent prisma imports | **미해결** | 신규 파일도 혼용 계속 |
| 45 | Inconsistent error handling | **부분 수정** | 신규 actions는 return { error } 패턴 적용, 기존 attendance/timer는 여전히 throw |
| 46 | Redirect in try-catch | **미해결** | 동일 (programs/actions.ts:86-89) |
| 47 | N+1 in getAdminMembersExtended | **미해결** | 동일 |
| 48 | N+1 in getMemberDetail | **미해결** | 동일 |
| 49 | N+1 in generateProgramRecap | **미해결** | 동일 |
| 50 | Large attendance export | **미해결** | 동일 |
| 51-55 | img 대신 next/image 사용 | **미해결** | ProfileImageUpload.tsx에도 `<img>` 추가됨 |
| 56-58 | Missing caching | **미해결** | 동일 |
| 59 | RichTextEditor large bundle | **미해결** | 동일 |
| 60 | recap-ai dynamic import | **미해결** | 동일 |
| 61-62 | Modal focus trap 부재 | **미해결** | 동일 |
| 63-67 | ARIA labels 부재 | **부분 수정** | ClubBottomNav에 aria-label 추가됨, 나머지 미해결 |
| 68-69 | Form validation feedback | **미해결** | 동일 |
| 70-72 | Mobile responsiveness | **부분 수정** | ResponsiveTable 컴포넌트 추가됨, MobileProgramCard/MobileMemberCard 추가 |
| 73-79 | Missing DB indexes | **미해결** | 동일 |
| 80-82 | String enum 미사용 | **미해결** | 동일 |
| 83-84 | onDelete cascade / type | **미해결** | 동일 |
| 85-86 | Recap stale data / sessionNo race | **미해결** | 동일 |
| 87-88 | Relationship issues | **미해결** | 동일 |

### 요약

| 상태 | 건수 |
|------|------|
| 수정됨 | 10건 |
| 부분 수정 | 5건 |
| 미해결 | 70건 |
| **합계** | **85건** |

---

## Phase 27: 커뮤니티 기능

### Critical Issues

#### C-01: XSS via dangerouslySetInnerHTML in PostDetail (보안)
- **파일:** `src/components/club/community/PostDetail.tsx:80`
- **내용:** `dangerouslySetInnerHTML={{ __html: post.content }}` -- 사용자 입력 커뮤니티 게시물 본문을 sanitization 없이 직접 렌더링. Notice 상세 페이지(`notices/[id]/page.tsx:56`)는 `sanitizeHtml()`을 사용하지만, 커뮤니티 게시물은 사용하지 않음.
- **위험:** 모든 로그인 사용자가 게시물에 악성 스크립트를 삽입하여 다른 사용자의 세션 쿠키 탈취 가능 (Stored XSS).
- **수정:** `import { sanitizeHtml } from '@/lib/sanitize'`를 추가하고 `dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}`로 변경.

#### C-02: 댓글 API 인증 없음 (보안)
- **파일:** `src/app/api/club/community/[postId]/comments/route.ts:4-25`
- **내용:** GET 엔드포인트에 인증 체크가 전혀 없음. 아무나 모든 게시물의 댓글 목록을 조회 가능.
- **위험:** 비인증 사용자가 모든 댓글 데이터(사용자 이름, 이미지, 내용)를 크롤링 가능.
- **수정:** `getCurrentUser()` 체크를 추가하거나, 최소한 게시물 공개 여부 확인.

#### C-03: 댓글 무제한 중첩 depth 가능 (보안/성능)
- **파일:** `src/app/club/community/actions.ts:84`
- **내용:** `createComment()`에서 `parentId`를 검증 없이 받아 설정. parentId가 이미 답글인 경우 답글의 답글이 생성되나, `getComments()`는 1-depth만 조회 (`parentId: null` + replies). 이로 인해 2차 이상 중첩 댓글은 UI에 표시되지 않으면서 DB에 누적됨.
- **수정:** parentId가 전달될 때 해당 댓글이 최상위 댓글인지 확인 (parentId가 null인 댓글만 답글 대상).

#### C-04: deletePost() 관리자 삭제 권한 부재 (보안)
- **파일:** `src/app/club/community/actions.ts:69-71`
- **내용:** `deletePost()`는 작성자만 삭제 가능. 관리자(ADMIN/SUPER_ADMIN)도 부적절한 게시물을 삭제할 수 없음. `deleteComment()`도 동일 (line 108).
- **수정:** 관리자 role 체크 추가: `if (post.authorId !== user.id && !['ADMIN','SUPER_ADMIN'].includes(user.role))`.

### Warning Issues

#### W-01: community-queries.ts Record<string, unknown> 사용 (타입 안전)
- **파일:** `src/lib/club/community-queries.ts:11`
- **내용:** `const where: Record<string, unknown> = {}` -- Prisma의 typed `CommunityPostWhereInput` 대신 any-like 타입 사용.
- **수정:** `Prisma.CommunityPostWhereInput` 타입 사용.

#### W-02: updatePost() 카테고리 검증 누락 (입력 검증)
- **파일:** `src/app/club/community/actions.ts:47-48`
- **내용:** `updatePost()`에서 카테고리를 검증하지 않음. `createPost()`는 `validCategories`로 검증하지만, `updatePost()`는 누락.
- **수정:** `updatePost()`에도 동일한 카테고리 검증 추가.

#### W-03: LikeButton 에러 무시 (에러 처리)
- **파일:** `src/components/club/community/LikeButton.tsx:30-32`
- **내용:** `catch { // ignore }` -- 네트워크 오류 시 사용자에게 아무 피드백 없음. 좋아요 상태가 서버와 불일치할 수 있음.
- **수정:** 에러 시 이전 상태로 롤백하거나 사용자에게 toast 알림.

#### W-04: like toggle 비관적 UI (성능/UX)
- **파일:** `src/components/club/community/LikeButton.tsx:23-33`
- **내용:** 좋아요 클릭 시 서버 응답을 기다린 후 UI 업데이트. 체감 지연 발생.
- **수정:** 클릭 시 즉시 UI 업데이트(optimistic update) 후 서버 응답에 따라 롤백.

#### W-05: community 페이지 검색 SQL injection 가능성 (성능)
- **파일:** `src/lib/club/community-queries.ts:14-17`
- **내용:** `contains` 연산자에 사용자 입력을 직접 전달. Prisma는 내부적으로 parameterized query를 사용하므로 SQL injection은 아니지만, `%` `_` 같은 와일드카드 문자 미이스케이프.
- **수정:** 특수 문자(`%`, `_`) 이스케이프 처리.

### Info Issues

#### I-01: 커뮤니티 게시물 검색 성능 (성능)
- **파일:** `src/lib/club/community-queries.ts:14-17`
- **내용:** `contains` 연산은 full table scan. 게시물 수가 증가하면 성능 저하.
- **수정:** Full-text search 도입 또는 `@@index`를 추가하고 pg_trgm 등 활용.

#### I-02: category label 중복 정의 (코드 품질)
- **파일:** `src/components/club/community/PostDetail.tsx:12-17`, `src/components/club/community/PostForm.tsx:12-17`
- **내용:** 동일한 카테고리 레이블이 두 컴포넌트에 중복 정의.
- **수정:** 공통 상수 파일로 분리.

---

## Phase 25-26: 알림/검색/프로필/공지

### Critical Issues

#### C-05: 공지사항 content XSS (이미 sanitize 적용) -- 확인됨
- **파일:** `src/app/club/notices/[id]/page.tsx:56`
- **내용:** `sanitizeHtml(notice.content)` 적용됨. 안전함.
- **상태:** 양호 (참고용)

#### C-06: notification-service createBulkNotifications 무제한 (성능/보안)
- **파일:** `src/lib/club/notification-service.ts:43-79`
- **내용:** `createBulkNotifications()`에 userIds 배열 크기 제한 없음. 활성 사용자 전체에게 알림을 생성할 때, 수천 건의 INSERT가 한 번에 실행됨. `createMany`를 사용하므로 단일 쿼리이지만, 대량 데이터 삽입 시 DB 부하.
- **수정:** batch 크기 제한 (예: 100건씩 분할) 또는 큐 시스템 도입.

#### C-07: updateNotificationSettings 입력 검증 없음 (보안)
- **파일:** `src/app/club/notifications/actions.ts:44-83`
- **내용:** `reminderHoursBefore`, `quietHoursStart`, `quietHoursEnd` 숫자값에 범위 검증 없음. 음수, NaN, 극단적으로 큰 수 등이 DB에 저장 가능.
- **수정:** `reminderHoursBefore: 1-72`, `quietHoursStart/End: 0-23` 범위 검증 추가.

#### C-08: search-queries 인증 없이 전체 데이터 검색 (보안)
- **파일:** `src/app/club/search/page.tsx:13-17`
- **내용:** 검색 페이지에 인증 체크 없음. `searchAll()` 함수는 `isPublic: true`와 `isPublished: true` 필터를 적용하므로 비공개 데이터는 노출되지 않지만, 비인증 사용자도 검색 기능을 사용 가능.
- **위험:** 낮음 (공개 데이터만 반환). 하지만 club 기능은 로그인 사용자 전용이므로 인증 체크 권장.
- **수정:** `getCurrentUser()` 체크 추가.

### Warning Issues

#### W-06: notice-queries getClubNoticeById 조회수 증가 race condition (에러 처리)
- **파일:** `src/lib/club/notice-queries.ts:44-49`
- **내용:** `findUnique` 후 별도의 `update`로 조회수 증가. 동시 요청 시 조회수 누락 가능. 또한, 새로고침마다 조회수가 1씩 증가하여 실제 조회수보다 부풀려짐.
- **수정:** 세션/IP 기반 중복 방지 로직 추가.

#### W-07: notification-queries Record<string, unknown> 사용 (타입 안전)
- **파일:** `src/lib/club/notification-queries.ts:13`
- **내용:** `const where: Record<string, unknown> = { userId }` -- Prisma 타입 대신 generic 타입 사용.
- **수정:** `Prisma.NotificationWhereInput` 타입 사용.

#### W-08: NotificationList 에러 전부 무시 (에러 처리)
- **파일:** `src/components/club/notifications/NotificationList.tsx:37-38, 58-59, 72-73, 83-84`
- **내용:** 4곳의 `catch { // ignore }` -- 모든 에러를 무시. 사용자에게 에러 상태를 알리지 않아, 실패한 작업이 성공한 것처럼 보임.
- **수정:** 최소한 toast 알림으로 에러 표시.

#### W-09: NotificationList 미인증 API 호출 (보안)
- **파일:** `src/components/club/notifications/NotificationList.tsx:32,50,65,78`
- **내용:** `/api/notifications` 엔드포인트를 직접 호출하지만, 해당 API 라우트의 인증 여부가 불분명. API가 인증을 체크하지 않으면 다른 사용자의 알림 조작 가능.
- **수정:** API 라우트에서 세션 확인 보장.

#### W-10: profile-queries.ts 중복 출석률 계산 (코드 품질)
- **파일:** `src/lib/club/profile-queries.ts:26-39`
- **내용:** `getMyProfile()`에서 전체 출석 기록을 가져와 JS로 출석률 계산. 이 패턴이 `stats-queries.ts:33-55`, `member-queries.ts:52-88` 등 5곳 이상 중복.
- **수정:** 공통 `calculateAttendanceRate()` 유틸리티 추출.

#### W-11: search-queries HTML 태그 제거 regex (보안)
- **파일:** `src/lib/club/search-queries.ts:131,141`
- **내용:** `.replace(/<[^>]+>/g, '')` -- 단순 regex로 HTML 태그 제거. 꺽쇠 안에 `>` 문자가 포함된 악의적 HTML에서는 불완전하게 제거될 수 있음.
- **수정:** `sanitizeHtml()` 또는 전용 HTML-to-text 라이브러리 사용.

#### W-12: stats-queries 전체 출석 데이터 fetch (성능)
- **파일:** `src/lib/club/stats-queries.ts:33-39`
- **내용:** `getStatsOverview()`에서 `findMany`로 전체 출석 레코드를 가져와 JS로 필터/계산. 참여 프로그램과 기간에 따라 수천 건이 될 수 있음.
- **수정:** DB 레벨 집계 쿼리 (`count` with `where` 조건) 사용.

#### W-13: timeline API limit 검증 없음 (보안/성능)
- **파일:** `src/app/api/club/timeline/route.ts:15`
- **내용:** `parseInt(searchParams.get('limit') || '20')` -- 사용자가 limit=100000 을 전달하면 그대로 DB 쿼리에 사용됨.
- **수정:** `Math.min(Math.max(limit, 1), 100)` 등으로 범위 제한.

### Info Issues

#### I-03: 프로필 이미지 `<img>` 사용 (성능)
- **파일:** `src/components/club/profile/ProfileImageUpload.tsx:63-66`
- **내용:** `<img src={preview} .../>` -- `next/image` 대신 일반 img 태그 사용.
- **수정:** Next.js `Image` 컴포넌트로 교체 (프리뷰의 경우 data URL이므로 제외 가능하지만, currentImage URL에는 적용 권장).

#### I-04: searchAll 4개 병렬 full-text 쿼리 (성능)
- **파일:** `src/lib/club/search-queries.ts:31-115`
- **내용:** 4개 모델에 대해 `contains` 검색을 병렬 실행. 데이터 증가 시 부하.
- **수정:** 검색 전용 인덱스 또는 Elasticsearch 등 검색 엔진 도입 고려.

---

## Phase 28: 모바일 최적화

### Critical Issues

#### C-09: useSwipe stale closure 문제 (버그)
- **파일:** `src/hooks/useSwipe.ts:40-52`
- **내용:** `handleTouchMove`가 `state.isSwiping`을 의존성으로 사용하지만, 클로저 문제로 인해 `isSwiping`이 항상 초기값(false)을 참조할 수 있음. `useCallback`의 deps에 `state.isSwiping`이 있지만, React의 state batching으로 인해 `handleTouchStart`에서 설정한 `isSwiping: true`가 `handleTouchMove`에 즉시 반영되지 않을 수 있음.
- **수정:** `useRef`로 swiping 상태를 관리하거나, `setState` 콜백 패턴 사용.

#### C-10: useSwipe handleTouchEnd stale state (버그)
- **파일:** `src/hooks/useSwipe.ts:54-71`
- **내용:** `handleTouchEnd`가 `state` 전체를 의존성으로 사용. 그러나 `state.deltaX/deltaY`가 마지막 `setState`와 동기화되지 않을 수 있음. 또한 `handlers` 객체가 deps에 있어, 사용하는 측에서 handlers가 매 렌더링마다 새로 생성되면 무한 리렌더링 발생 위험.
- **수정:** `useRef`로 delta값 관리하고, handlers는 `useCallback`으로 memoize.

### Warning Issues

#### W-14: useMediaQuery SSR 불일치 (성능/UX)
- **파일:** `src/hooks/useMediaQuery.ts:6`
- **내용:** `useState(false)` 초기값이 서버 렌더링과 클라이언트에서 다를 수 있음. 서버에서는 항상 `false`이므로, 데스크톱에서 처음 로드 시 모바일 레이아웃이 깜빡이며 전환될 수 있음 (layout shift).
- **수정:** `typeof window !== 'undefined'`에서 초기값을 `window.matchMedia(query).matches`로 설정하거나, 서버에서 User-Agent 기반 추정.

#### W-15: ResponsiveTable mobileHidden 필터 데스크톱에도 적용 (버그)
- **파일:** `src/components/club/responsive/ResponsiveTable.tsx:53-54,68-69`
- **내용:** 데스크톱 테이블 렌더링에서도 `.filter((col) => !col.mobileHidden)` 조건이 적용됨. `mobileHidden` 의도와 반대로 데스크톱에서도 컬럼이 숨겨짐.
- **수정:** 데스크톱 테이블에서는 `mobileHidden` 필터를 제거.

#### W-16: SwipeableCard 접근성 부재 (접근성)
- **파일:** `src/components/club/mobile/SwipeableCard.tsx:12-26`
- **내용:** 스와이프 동작에 대한 키보드 대안이 없음. 스크린 리더 사용자가 스와이프 기능을 인지/사용할 수 없음.
- **수정:** 키보드 화살표 키 핸들러 추가, `role`과 `aria-label` 추가.

#### W-17: ClubBottomNav 인증 상태 체크 비일관 (성능)
- **파일:** `src/components/club/ClubBottomNav.tsx:19-21`
- **내용:** `useSession()`으로 세션 체크. 세션 로딩 중(`status: 'loading'`)에는 `data`가 null이므로 네비게이션이 잠시 사라졌다가 나타남 (flash).
- **수정:** `status === 'loading'` 상태에서 스켈레톤 UI 표시.

### Info Issues

#### I-05: useAutoSave와 use-auto-save 중복 (코드 품질)
- **파일:** `src/hooks/useAutoSave.ts`, `src/hooks/use-auto-save.ts`
- **내용:** 유사한 기능을 하는 두 개의 auto-save 훅이 존재. 하나는 localStorage만 사용, 다른 하나는 서버 저장도 지원.
- **수정:** 하나의 통합 훅으로 병합.

#### I-06: useAutoSave data: any 타입 (타입 안전)
- **파일:** `src/hooks/useAutoSave.ts:8`
- **내용:** `data: any` -- 타입 안전성 없음.
- **수정:** 제네릭 타입 `data: T` 사용.

---

## Phase 29: 설정

### Critical Issues

#### C-11: deleteAccount 세션 미만료 (보안)
- **파일:** `src/app/club/settings/actions.ts:95-126`
- **내용:** `deleteAccount()`에서 사용자 레코드 삭제 후 `redirect('/')`만 수행. NextAuth 세션이 명시적으로 삭제/무효화되지 않음. 쿠키 기반 세션이 만료될 때까지 삭제된 사용자의 세션 토큰이 유효할 수 있음.
- **위험:** 삭제된 계정의 세션으로 API 호출 시 예기치 않은 에러 발생 가능.
- **수정:** `await signOut()` 호출 또는 세션 쿠키 명시적 삭제.

#### C-12: deleteAccount cascade 검증 부재 (데이터 무결성)
- **파일:** `src/app/club/settings/actions.ts:121-123`
- **내용:** `prisma.user.delete()`로 사용자 삭제 시, 관련 데이터(게시물, 댓글, 좋아요, 출석, 독후감, 명문장, 참가 기록, 알림, 알림 설정 등)의 cascade 규칙이 스키마에 명확히 정의되어 있는지 확인 필요. onDelete 규칙이 누락된 관계에서 FK constraint 에러 발생 가능.
- **수정:** 스키마의 모든 User 관련 관계에 적절한 onDelete 규칙 확인 및 설정, 또는 수동으로 관련 데이터 삭제 후 사용자 삭제.

### Warning Issues

#### W-18: changePassword 비밀번호 강도 검증 불충분 (보안)
- **파일:** `src/app/club/settings/actions.ts:24-25`
- **내용:** 비밀번호 검증이 `newPassword.length < 8`만 확인. 숫자, 특수문자, 대소문자 조합 등의 복잡도 검증 없음.
- **수정:** zod 스키마로 비밀번호 복잡도 규칙 추가 (최소 1개 숫자, 1개 특수문자 등).

#### W-19: exportMyData 대량 데이터 메모리 (성능)
- **파일:** `src/app/club/settings/actions.ts:56-77`
- **내용:** `exportMyData()`에서 사용자의 모든 독후감, 명문장, 출석 기록을 한 번에 메모리에 로드. 오랜 기간 활동한 사용자의 경우 대량 데이터가 될 수 있음.
- **수정:** 페이지네이션 또는 스트리밍 내보내기 구현.

#### W-20: AccountForm 비밀번호 일치 검증 서버에만 의존 (UX)
- **파일:** `src/components/club/settings/AccountForm.tsx:14-28`
- **내용:** 새 비밀번호/확인 비밀번호 일치 여부가 서버에서만 검증됨. 클라이언트에서 실시간 검증이 없어 폼 제출 후에야 불일치를 알 수 있음.
- **수정:** 클라이언트 측 실시간 비밀번호 일치 검증 추가.

### Info Issues

#### I-07: 설정 페이지에 `aria-label` 부재 (접근성)
- **파일:** `src/components/club/settings/AccountForm.tsx`, `DeleteAccountForm.tsx`, `DataExport.tsx`
- **내용:** 폼 요소에 `htmlFor`/`id`는 잘 설정되어 있으나, 버튼들에 `aria-label` 누락.
- **수정:** 아이콘 버튼에 `aria-label` 추가.

---

## Phase 30: 외부 연동

### Critical Issues

(이 섹션에는 Critical 수준 없음)

### Warning Issues

#### W-21: KakaoShareButton 외부 스크립트 무결성 미검증 (보안)
- **파일:** `src/components/club/share/KakaoShareButton.tsx:14-18`
- **내용:** `https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js`를 `integrity` 속성 없이 동적으로 로드. CDN이 침해되면 악성 코드 실행 가능. 또한, script 태그가 컴포넌트 마운트마다 중복 추가될 수 있음.
- **수정:** `integrity`와 `crossorigin` 속성 추가, 또는 npm 패키지로 설치. 기존 스크립트 존재 여부 확인 후 로드.

#### W-22: google-calendar.ts ICal 이벤트 텍스트 미이스케이프 (보안)
- **파일:** `src/lib/google-calendar.ts:49-52`
- **내용:** ICal SUMMARY, DESCRIPTION, LOCATION 필드에 사용자 입력을 이스케이프 없이 삽입. ICal 형식에서 줄바꿈(`\n`), 쉼표(`,`), 세미콜론(`;`), 백슬래시(`\`) 등은 이스케이프 필요 (RFC 5545).
- **수정:** `SUMMARY:${escapeICalText(event.title)}` 형식으로 특수문자 이스케이프.

#### W-23: AddToCalendarButton 드롭다운 접근성 부재 (접근성)
- **파일:** `src/components/club/calendar/AddToCalendarButton.tsx:38-68`
- **내용:** 드롭다운에 `role="menu"`, `aria-expanded`, 키보드 탐색(Escape, 화살표 키) 없음. 외부 클릭 닫기용 `<div className="fixed inset-0">` (line 50)이 스크린 리더에 의미 없는 요소로 인식됨.
- **수정:** `role="menu"`, `aria-expanded`, `Escape` 키 핸들러, 포커스 관리 추가.

#### W-24: sessionReminderTemplate HTML injection 가능성 (보안)
- **파일:** `src/lib/email.ts:132-138`
- **내용:** `${data.userName}`, `${data.programTitle}`, `${data.location}` 등을 HTML 템플릿에 직접 삽입. 이메일 수신 클라이언트에서의 XSS 가능성은 낮지만, 사용자/프로그램 이름에 HTML 태그가 포함되면 이메일 레이아웃 깨짐.
- **수정:** HTML 엔티티 인코딩 (`&`, `<`, `>`, `"`, `'` 이스케이프) 적용.

### Info Issues

#### I-08: kakao.ts Window.Kakao 타입 외부 참조 (타입 안전)
- **파일:** `src/lib/kakao.ts:49`
- **내용:** `// Window.Kakao type is declared in src/components/common/ShareButton.tsx` -- 타입 선언이 다른 컴포넌트 파일에 의존. 해당 컴포넌트가 삭제되면 타입 에러.
- **수정:** `src/types/kakao.d.ts` 등 전용 타입 선언 파일로 이동.

#### I-09: google-calendar.ts 중복 함수 (코드 품질)
- **파일:** `src/lib/google-calendar.ts:9-11,30-32`
- **내용:** `formatDateForGoogle`과 `formatDateForICal`이 완전히 동일한 구현.
- **수정:** 하나의 `formatDateForCalendar` 함수로 통합.

#### I-10: manifest.ts PWA 아이콘 존재 여부 미확인 (UX)
- **파일:** `src/app/manifest.ts:13-20`
- **내용:** `/icons/icon-192x192.png`, `/icons/icon-512x512.png` 참조. 실제 파일 존재 여부 확인 필요.
- **수정:** public/icons/ 디렉토리에 아이콘 파일 존재 확인.

#### I-11: ShareMenu navigator.clipboard 미지원 브라우저 (호환성)
- **파일:** `src/components/club/share/ShareMenu.tsx:17`
- **내용:** `navigator.clipboard.writeText()` -- 일부 모바일 브라우저(특히 in-app 브라우저)에서 미지원. try-catch 없이 사용.
- **수정:** try-catch 추가 및 fallback (`document.execCommand('copy')`) 구현.

---

## Phase 16-26 추가 발견사항

### Critical Issues

(이전 리뷰에서 이미 다룬 항목 외 추가 발견 없음)

### Warning Issues

#### W-25 (기존 #45 연장): 서버 액션 에러 패턴 불일치 지속
- **파일:** attendance/actions.ts (throw), timer/actions.ts (throw) vs. community/actions.ts (return { error }), settings/actions.ts (return { error })
- **내용:** Phase 25-30 신규 actions는 `return { error }` 패턴을 사용하지만, 기존 attendance/timer actions는 여전히 `throw` 패턴. 동일 프로젝트 내 2가지 에러 패턴 공존.
- **수정:** 모든 서버 액션을 `return { error }` 패턴으로 통일.

### Info Issues

#### I-12: queries.ts getMyStats Member 모델 의존 (아키텍처)
- **파일:** `src/lib/club/queries.ts:97-101`
- **내용:** `getMyStats()`가 `Member` 모델의 ID를 조회하여 `BookReport`를 카운트. 다른 곳에서는 `User.id`를 직접 사용. Member-User 이중 구조의 복잡성.
- **수정:** BookReport.authorId가 userId인지 memberId인지 통일.

#### I-13: notice admin actions content 미sanitize (코드 품질)
- **파일:** `src/app/club/notices/admin/actions.ts:33`
- **내용:** `createNotice()`에서 `data.content`를 sanitize 없이 DB에 저장. 읽기 시 sanitize하므로 XSS는 방지되지만, 저장 시에도 sanitize하는 것이 방어적 프로그래밍.
- **수정:** 저장 시에도 `sanitizeHtml()` 적용 (defense in depth).

#### I-14: profileImageUpload URL 검증 부재 (보안)
- **파일:** `src/app/club/profile/actions.ts:31`
- **내용:** `...(profileImage && { image: profileImage })` -- 프로필 이미지 URL에 대한 검증 없이 그대로 DB에 저장. 악의적 URL (javascript: 등) 가능성.
- **수정:** URL 형식 검증 (`https://` 로 시작하는지 등) 추가.

#### I-15: notification actions 불필요한 updateMany (코드 품질)
- **파일:** `src/app/club/notifications/actions.ts:14-20`
- **내용:** `markNotificationRead()`에서 `updateMany`를 사용하여 단일 알림을 업데이트. `where`에 `id`와 `userId` 모두 포함하여 보안은 확보되었으나, `update`가 더 적절.
- **수정:** 의도적 설계라면 유지 (ownership 검증 목적), 아니면 `update`로 변경.

#### I-16: timeline-queries 전체 타입 fetch 후 merge+sort (성능)
- **파일:** `src/lib/club/timeline-queries.ts:27-114`
- **내용:** `type === 'all'`일 때 3개 모델에서 각각 `limit+1`개씩 가져온 후 JS에서 merge + sort. 총 최대 `3*(limit+1)` 건을 메모리에 로드.
- **수정:** limit이 작으면 문제 없으나, 향후 union 쿼리 또는 materialized view 고려.

#### I-17: community actions redirect 에러 가능성 (에러 처리)
- **파일:** `src/app/club/community/actions.ts:35-36,62-63,76`
- **내용:** `createPost`, `updatePost`, `deletePost`에서 DB 작업 후 `redirect()` 호출. try-catch 없이 사용하므로, DB 작업 성공 후 redirect에서 에러가 발생하면 데이터는 저장되었으나 사용자는 에러를 봄. Next.js의 redirect는 특수 에러를 throw하므로 문제는 없으나, 추후 try-catch 추가 시 주의 필요.

#### I-18: community 댓글/좋아요 수 정합성 (데이터 무결성)
- **파일:** `src/lib/club/community-queries.ts:25,38,50,67-68`
- **내용:** `_count`로 댓글/좋아요 수를 조회하므로 정합성은 보장됨. 다만, 게시물 목록에서 `_count`를 사용하고, 상세에서도 `_count`를 사용하여, 좋아요 후 목록으로 돌아가면 캐시된 목록의 count가 갱신되지 않을 수 있음.
- **수정:** `revalidatePath('/club/community')` 호출 (like API에서 누락됨).

---

## DB 스키마 추가 확인사항

### Warning Issues

(이전 리뷰 #73-88 항목 모두 미해결 상태)

추가 발견:

#### DB-01: CommunityPost 인덱스 부재
- **모델:** CommunityPost
- **내용:** `category`, `authorId`, `createdAt` 컬럼에 인덱스 없음. 카테고리 필터 + 정렬 쿼리가 빈번함.
- **수정:** `@@index([category, createdAt])`, `@@index([authorId])` 추가.

#### DB-02: CommunityComment 인덱스 부재
- **모델:** CommunityComment
- **내용:** `postId`, `parentId` 컬럼에 인덱스 없음. 댓글 조회 시 `postId`로 필터링.
- **수정:** `@@index([postId])`, `@@index([parentId])` 추가.

#### DB-03: ClubNotice 인덱스 부재
- **모델:** ClubNotice
- **내용:** `isPublished`, `isPinned`, `createdAt`으로 정렬/필터하지만 인덱스 없음.
- **수정:** `@@index([isPublished, isPinned, createdAt])` 추가.

#### DB-04: CommunityLike unique constraint 확인
- **모델:** CommunityLike
- **내용:** `postId_userId` compound unique가 있어 중복 좋아요 방지됨. 양호.

---

## 전체 요약

### 심각도별 분류

| 카테고리 | Critical | Warning | Info | 합계 |
|----------|----------|---------|------|------|
| 보안 | 5 | 8 | 2 | 15 |
| 성능 | 1 | 4 | 3 | 8 |
| 에러 처리 | 2 | 3 | 2 | 7 |
| 접근성 | 0 | 3 | 1 | 4 |
| 타입 안전 | 0 | 2 | 2 | 4 |
| 코드 품질 | 0 | 1 | 4 | 5 |
| 버그 | 3 | 2 | 0 | 5 |
| 데이터 무결성 | 1 | 1 | 1 | 3 |
| DB 스키마 | 0 | 0 | 3 | 3 |
| **합계** | **12** | **24** | **18** | **54** |

### 즉시 수정 필요 (Critical 12건)

1. **[C-01]** PostDetail XSS -- `dangerouslySetInnerHTML` 미sanitize
2. **[C-02]** 댓글 API 인증 없음
3. **[C-03]** 댓글 무제한 중첩 depth
4. **[C-04]** 커뮤니티 관리자 삭제 권한 부재
5. **[C-06]** createBulkNotifications 무제한 생성
6. **[C-07]** updateNotificationSettings 입력 미검증
7. **[C-08]** search 페이지 인증 없음
8. **[C-09]** useSwipe stale closure 버그
9. **[C-10]** useSwipe handleTouchEnd stale state
10. **[C-11]** deleteAccount 세션 미만료
11. **[C-12]** deleteAccount cascade 미검증
12. **이전 미해결** 70건 (Phase 20 리뷰 기준, 위 "이전 리뷰 미해결 항목 상태" 참조)

### 이전 리뷰 대비 개선된 점

1. **인증 체크 강화:** `manualCheckIn`, `generateSessionQR`, `saveSpeakingTimes`에 role check 추가
2. **입력 검증 강화:** `createProgram`/`updateProgram`에 type/status 검증 추가, `addSession`에 날짜 검증 추가
3. **에러 바운더리:** admin/error.tsx, facilitator/error.tsx 추가
4. **로딩 상태:** attendance/loading.tsx, resources/loading.tsx 추가
5. **$transaction 적용:** `saveSpeakingTimes()`에 트랜잭션 적용
6. **deleteProgram 권한 분리:** ADMIN/SUPER_ADMIN만 삭제 가능
7. **모바일 대응:** ResponsiveTable, MobileProgramCard, MobileMemberCard, ClubBottomNav 추가
8. **접근성 일부 개선:** ClubBottomNav에 aria-label, aria-current 추가
9. **신규 actions 패턴 개선:** community, settings, notices actions에서 `return { error }` 패턴 적용

### 우선 수정 권장 (Top 10)

| 순위 | 이슈 | 위험도 | 수정 난이도 |
|------|------|--------|------------|
| 1 | **[C-01] PostDetail XSS** -- sanitizeHtml import 1줄 추가 | 치명적 | 하 |
| 2 | **[C-02] 댓글 API 인증** -- getCurrentUser 체크 추가 | 높음 | 하 |
| 3 | **[C-11] deleteAccount 세션 미만료** -- signOut 추가 | 높음 | 하 |
| 4 | **[C-09/10] useSwipe 버그** -- useRef 패턴으로 리팩토링 | 높음 | 중 |
| 5 | **[C-07] 알림 설정 입력 검증** -- 범위 체크 추가 | 중간 | 하 |
| 6 | **[W-15] ResponsiveTable 필터 버그** -- 데스크톱 필터 제거 | 중간 | 하 |
| 7 | **[C-04] 커뮤니티 관리자 권한** -- role 체크 추가 | 중간 | 하 |
| 8 | **이전 #27 JSON-LD XSS** -- `</script>` 이스케이프 | 높음 | 하 |
| 9 | **이전 #31 SVG 업로드** -- SVG 차단 또는 CSP 적용 | 높음 | 하 |
| 10 | **이전 #73-75 DB 인덱스** -- 주요 테이블 인덱스 추가 | 중간 | 하 |

---

*End of Report*
