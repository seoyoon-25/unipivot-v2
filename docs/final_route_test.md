# 최종 라우트 테스트 결과

테스트 일시: 2026-02-03 18:23
테스트 환경: localhost:3000 (bestcome.org)
테스트 방법: curl -s -o /dev/null -w "%{http_code}" (실제 HTTP 요청)

## 요약
- 전체: 213개 (페이지 163개 + API 50개 정적 라우트)
- 정상 (2xx): 51개
- 리다이렉트 (3xx): 71개 (로그인 필요 307 포함)
- 클라이언트 오류 (4xx): 40개
- 서버 오류 (5xx): 51개
- 동적 라우트 (파라미터 필요, 별도 분류): 46개

### 상태 코드 설명
| 코드 | 의미 | 비고 |
|------|------|------|
| 200 | 정상 | 페이지/API 정상 응답 |
| 307 | Temporary Redirect | 대부분 로그인 페이지로 리다이렉트 (인증 필요) |
| 308 | Permanent Redirect | URL 경로 변경됨 |
| 400 | Bad Request | 필수 파라미터 누락 (POST 전용 엔드포인트) |
| 401 | Unauthorized | 인증 토큰/키 필요 |
| 404 | Not Found | 라우트 미등록 또는 빌드 미반영 |
| 405 | Method Not Allowed | GET 미지원 (POST 전용 등) |
| 500 | Internal Server Error | DB 연결/인증 세션/서버 오류 |

---

## 공개 페이지 (Public)

| 경로 | 상태 | 비고 |
|------|------|------|
| `/` | 200 | OK - 메인 페이지 |
| `/blog` | 200 | OK - 블로그 목록 |
| `/privacy` | 500 | 서버 오류 |
| `/bookclub` | 500 | 서버 오류 |
| `/talent` | 500 | 서버 오류 |
| `/reports` | 500 | 서버 오류 |
| `/terms` | 500 | 서버 오류 |
| `/request` | 500 | 서버 오류 |
| `/korea-issue` | 500 | 서버 오류 |
| `/kmove` | 500 | 서버 오류 |
| `/donate` | 500 | 서버 오류 |
| `/books` | 500 | 서버 오류 |
| `/notice` | 500 | 서버 오류 |
| `/notice/write` | 500 | 서버 오류 |
| `/experts` | 500 | 서버 오류 |
| `/cooperation` | 500 | 서버 오류 |
| `/cooperation/consulting/apply` | 500 | 서버 오류 |
| `/cooperation/survey/apply` | 500 | 서버 오류 |
| `/cooperation/lecturer/apply` | 500 | 서버 오류 |
| `/bookshelf` | 307 | 리다이렉트 -> club.bestcome.org/bookclub/bookshelf |
| `/seminar` | 500 | 서버 오류 |
| `/suggest` | 500 | 서버 오류 |
| `/p/history` | 308 | 영구 리다이렉트 -> /history |
| `/p/about-us` | 308 | 영구 리다이렉트 -> /about |
| `/about` | 500 | 서버 오류 |
| `/programs` | 500 | 서버 오류 |

---

## 인증 페이지 (Auth)

| 경로 | 상태 | 비고 |
|------|------|------|
| `/login` | 200 | OK - 로그인 페이지 |
| `/register` | 200 | OK - 회원가입 페이지 |
| `/forgot-password` | 200 | OK - 비밀번호 찾기 |
| `/reset-password` | 200 | OK - 비밀번호 재설정 |
| `/complete-profile` | 200 | OK - 프로필 완성 |

---

## 회원 전용 페이지 (Member - /my)

> 모두 307 -> /login?callbackUrl=... 로 리다이렉트 (인증 필요)

| 경로 | 상태 | 비고 |
|------|------|------|
| `/my` | 307 | 로그인 리다이렉트 |
| `/my/notifications` | 307 | 로그인 리다이렉트 |
| `/my/programs` | 307 | 로그인 리다이렉트 |
| `/my/settings` | 307 | 로그인 리다이렉트 |
| `/my/points` | 307 | 로그인 리다이렉트 |
| `/my/reports` | 307 | 로그인 리다이렉트 |
| `/my/reports/new` | 307 | 로그인 리다이렉트 |
| `/my/accounts` | 307 | 로그인 리다이렉트 |
| `/my/profile` | 307 | 로그인 리다이렉트 |
| `/my/applications` | 307 | 로그인 리다이렉트 |
| `/my/likes` | 307 | 로그인 리다이렉트 |

---

## 마이페이지 (Mypage)

> 모두 307 -> /login?callbackUrl=... 로 리다이렉트 (인증 필요)

| 경로 | 상태 | 비고 |
|------|------|------|
| `/mypage/profile` | 307 | 로그인 리다이렉트 |
| `/mypage/settings/notifications` | 307 | 로그인 리다이렉트 |
| `/mypage/settings/bank-account` | 307 | 로그인 리다이렉트 |

---

## Lab 페이지

> 모두 307 -> /login?callbackUrl=... 로 리다이렉트 (인증 필요)

| 경로 | 상태 | 비고 |
|------|------|------|
| `/lab` | 307 | 로그인 리다이렉트 |
| `/lab/profile` | 307 | 로그인 리다이렉트 |
| `/lab/experts/register` | 307 | 로그인 리다이렉트 |
| `/lab/trends` | 307 | 로그인 리다이렉트 |
| `/lab/experts` | 307 | 로그인 리다이렉트 |
| `/lab/surveys` | 307 | 로그인 리다이렉트 |

---

## 출석 페이지 (Attendance)

| 경로 | 상태 | 비고 |
|------|------|------|
| `/attendance/check` | 200 | OK - 출석 확인 |
| `/attendance/scan` | 200 | OK - QR 스캔 |

---

## 클럽 페이지 (Club)

### 공개 접근 가능

| 경로 | 상태 | 비고 |
|------|------|------|
| `/club` | 200 | OK - 클럽 메인 |
| `/club/unauthorized` | 200 | OK - 권한 없음 안내 |
| `/club/bookclub` | 200 | OK - 북클럽 |
| `/club/bookclub/bookshelf` | 200 | OK - 책장 |
| `/club/bookclub/my-bookshelf` | 200 | OK - 내 책장 |
| `/club/bookclub/reviews` | 200 | OK - 리뷰 목록 |
| `/club/bookclub/quotes` | 200 | OK - 명언 |
| `/club/bookclub/stamps` | 200 | OK - 스탬프 |
| `/club/attendance` | 200 | OK - 출석 |
| `/club/onboarding` | 200 | OK - 온보딩 |
| `/club/programs` | 200 | OK - 프로그램 목록 |
| `/club/my` | 200 | OK - 마이 |
| `/club/admin` | 200 | OK - 관리자 (내부 인증) |

### 서버 오류 (500)

| 경로 | 상태 | 비고 |
|------|------|------|
| `/club/bookclub/reviews/write` | 500 | 서버 오류 |
| `/club/attendance/scan` | 500 | 서버 오류 |
| `/club/facilitator` | 500 | 서버 오류 (진행자 전용) |
| `/club/facilitator/attendance` | 500 | 서버 오류 |
| `/club/facilitator/attendance/qr` | 500 | 서버 오류 |
| `/club/facilitator/timer` | 500 | 서버 오류 |
| `/club/facilitator/questions` | 500 | 서버 오류 |
| `/club/facilitator/resources` | 500 | 서버 오류 |

### 404 - 라우트 미등록/빌드 미반영

| 경로 | 상태 | 비고 |
|------|------|------|
| `/club/bookclub/top-rated` | 404 | 미등록 |
| `/club/notifications` | 404 | 미등록 |
| `/club/notifications/settings` | 404 | 미등록 |
| `/club/notices` | 404 | 미등록 |
| `/club/notices/admin` | 404 | 미등록 |
| `/club/notices/admin/new` | 404 | 미등록 |
| `/club/profile/edit` | 404 | 미등록 |
| `/club/profile` | 404 | 미등록 |
| `/club/my/stats` | 404 | 미등록 |
| `/club/my/timeline` | 404 | 미등록 |
| `/club/community` | 404 | 미등록 |
| `/club/community/new` | 404 | 미등록 |
| `/club/settings` | 404 | 미등록 |
| `/club/settings/account` | 404 | 미등록 |
| `/club/settings/notifications` | 404 | 미등록 |
| `/club/settings/data` | 404 | 미등록 |
| `/club/settings/delete-account` | 404 | 미등록 |
| `/club/search` | 404 | 미등록 |
| `/club/my/goals` | 404 | 미등록 |
| `/club/my/goals/set` | 404 | 미등록 |
| `/club/my/goals/history` | 404 | 미등록 |
| `/club/recommendations` | 404 | 미등록 |
| `/club/challenges` | 404 | 미등록 |
| `/club/challenges/create` | 404 | 미등록 |
| `/club/challenges/my` | 404 | 미등록 |
| `/club/social/feed` | 404 | 미등록 |
| `/club/social/followers` | 404 | 미등록 |
| `/club/social/following` | 404 | 미등록 |
| `/club/social/discover` | 404 | 미등록 |
| `/club/help` | 404 | 미등록 |
| `/club/help/getting-started` | 404 | 미등록 |
| `/club/help/faq` | 404 | 미등록 |
| `/club/admin/programs` | 404 | 미등록 |
| `/club/admin/programs/new` | 404 | 미등록 |
| `/club/admin/attendance` | 404 | 미등록 |
| `/club/admin/resources` | 404 | 미등록 |
| `/club/admin/resources/upload` | 404 | 미등록 |
| `/club/admin/members` | 404 | 미등록 |
| `/club/admin/analytics` | 404 | 미등록 |
| `/club/admin/analytics/users` | 404 | 미등록 |
| `/club/admin/analytics/content` | 404 | 미등록 |
| `/club/admin/analytics/engagement` | 404 | 미등록 |
| `/club/admin/monitoring` | 404 | 미등록 |

---

## 관리자 페이지 (Admin)

> 모두 307 -> /login?callbackUrl=/admin 로 리다이렉트 (관리자 인증 필요)

| 경로 | 상태 | 비고 |
|------|------|------|
| `/admin` | 307 | 로그인 리다이렉트 |
| `/admin/popups` | 307 | 로그인 리다이렉트 |
| `/admin/seo` | 307 | 로그인 리다이렉트 |
| `/admin/notifications` | 307 | 로그인 리다이렉트 |
| `/admin/notifications/templates` | 307 | 로그인 리다이렉트 |
| `/admin/notifications/logs` | 307 | 로그인 리다이렉트 |
| `/admin/programs` | 307 | 로그인 리다이렉트 |
| `/admin/programs/new` | 307 | 로그인 리다이렉트 |
| `/admin/programs/forms` | 307 | 로그인 리다이렉트 |
| `/admin/programs/order` | 307 | 로그인 리다이렉트 |
| `/admin/lab` | 307 | 로그인 리다이렉트 |
| `/admin/lab/reward-claims` | 307 | 로그인 리다이렉트 |
| `/admin/lab/trends` | 307 | 로그인 리다이렉트 |
| `/admin/lab/experts` | 307 | 로그인 리다이렉트 |
| `/admin/lab/participations` | 307 | 로그인 리다이렉트 |
| `/admin/lab/surveys` | 307 | 로그인 리다이렉트 |
| `/admin/business` | 307 | 로그인 리다이렉트 |
| `/admin/business/calendar` | 307 | 로그인 리다이렉트 |
| `/admin/business/documents` | 307 | 로그인 리다이렉트 |
| `/admin/business/partners` | 307 | 로그인 리다이렉트 |
| `/admin/business/projects` | 307 | 로그인 리다이렉트 |
| `/admin/settings` | 307 | 로그인 리다이렉트 |
| `/admin/settings/migration` | 307 | 로그인 리다이렉트 |
| `/admin/settings/admins` | 307 | 로그인 리다이렉트 |
| `/admin/settings/fonts` | 307 | 로그인 리다이렉트 |
| `/admin/settings/backup` | 307 | 로그인 리다이렉트 |
| `/admin/ai` | 307 | 로그인 리다이렉트 |
| `/admin/ai/knowledge` | 307 | 로그인 리다이렉트 |
| `/admin/ai/chatbot` | 307 | 로그인 리다이렉트 |
| `/admin/banners` | 307 | 로그인 리다이렉트 |
| `/admin/history` | 307 | 로그인 리다이렉트 |
| `/admin/finance` | 307 | 로그인 리다이렉트 |
| `/admin/finance/deposits` | 307 | 로그인 리다이렉트 |
| `/admin/finance/refunds` | 307 | 로그인 리다이렉트 |
| `/admin/finance/donations` | 307 | 로그인 리다이렉트 |
| `/admin/finance/reports` | 307 | 로그인 리다이렉트 |
| `/admin/finance/accounts` | 307 | 로그인 리다이렉트 |
| `/admin/finance/funds` | 307 | 로그인 리다이렉트 |
| `/admin/finance/transactions` | 307 | 로그인 리다이렉트 |
| `/admin/finance/projects` | 307 | 로그인 리다이렉트 |
| `/admin/finance/projects/new` | 307 | 로그인 리다이렉트 |
| `/admin/themes` | 307 | 로그인 리다이렉트 |
| `/admin/design` | 307 | 로그인 리다이렉트 |
| `/admin/design/popups` | 307 | 로그인 리다이렉트 |
| `/admin/design/seo` | 307 | 로그인 리다이렉트 |
| `/admin/design/banners` | 307 | 로그인 리다이렉트 |
| `/admin/design/history` | 307 | 로그인 리다이렉트 |
| `/admin/design/about` | 307 | 로그인 리다이렉트 |
| `/admin/design/cards` | 307 | 로그인 리다이렉트 |
| `/admin/design/menus` | 307 | 로그인 리다이렉트 |
| `/admin/design/custom-code` | 307 | 로그인 리다이렉트 |
| `/admin/design/theme` | 307 | 로그인 리다이렉트 |
| `/admin/design/floating-buttons` | 307 | 로그인 리다이렉트 |
| `/admin/design/announcement-banner` | 307 | 로그인 리다이렉트 |
| `/admin/design/fonts` | 307 | 로그인 리다이렉트 |
| `/admin/design/pages` | 307 | 로그인 리다이렉트 |
| `/admin/design/sections` | 307 | 로그인 리다이렉트 |
| `/admin/books` | 307 | 로그인 리다이렉트 |
| `/admin/books/new` | 307 | 로그인 리다이렉트 |
| `/admin/media` | 307 | 로그인 리다이렉트 |
| `/admin/preview` | 307 | 로그인 리다이렉트 |
| `/admin/cooperation` | 307 | 로그인 리다이렉트 |
| `/admin/cooperation/sections` | 307 | 로그인 리다이렉트 |
| `/admin/cooperation/consulting` | 307 | 로그인 리다이렉트 |
| `/admin/cooperation/survey` | 307 | 로그인 리다이렉트 |
| `/admin/cooperation/lecturer` | 307 | 로그인 리다이렉트 |
| `/admin/custom-code` | 307 | 로그인 리다이렉트 |
| `/admin/members` | 307 | 로그인 리다이렉트 |
| `/admin/members/new` | 307 | 로그인 리다이렉트 |
| `/admin/members/blacklist` | 307 | 로그인 리다이렉트 |
| `/admin/contents` | 307 | 로그인 리다이렉트 |
| `/admin/contents/notices` | 307 | 로그인 리다이렉트 |
| `/admin/contents/blog` | 307 | 로그인 리다이렉트 |
| `/admin/surveys` | 307 | 로그인 리다이렉트 |
| `/admin/floating-buttons` | 307 | 로그인 리다이렉트 |
| `/admin/pages` | 307 | 로그인 리다이렉트 |
| `/admin/interests` | 307 | 로그인 리다이렉트 |

---

## API 라우트 - 공개 (Public)

| 경로 | 메서드 | 상태 | 비고 |
|------|--------|------|------|
| `/api/public/site-config` | GET | 200 | OK |
| `/api/public/banners` | GET | 200 | OK |
| `/api/public/theme` | GET | 200 | OK |
| `/api/popups/active` | GET | 200 | OK |
| `/api/seo/metadata` | GET | 200 | OK |
| `/api/issue-surveys` | GET | 200 | OK |
| `/api/cooperation/sections` | GET | 200 | OK |
| `/api/cooperation/consulting` | GET | 200 | OK |
| `/api/cooperation/survey` | GET | 200 | OK |
| `/api/cooperation/lecturer` | GET | 200 | OK |
| `/api/design/cards` | GET | 200 | OK |
| `/api/lab/categories` | GET | 200 | OK |
| `/api/lab/surveys` | GET | 200 | OK |

## API 라우트 - 인증 (Auth)

| 경로 | 메서드 | 상태 | 비고 |
|------|--------|------|------|
| `/api/auth/forgot-password` | GET | 405 | POST 전용 |
| `/api/auth/forgot-password` | POST | 400 | 필수 파라미터 누락 (정상 동작) |
| `/api/auth/register` | GET | 405 | POST 전용 |
| `/api/auth/register` | POST | 400 | 필수 파라미터 누락 (정상 동작) |
| `/api/auth/reset-password` | GET | 405 | POST 전용 |
| `/api/auth/reset-password` | POST | 400 | 필수 파라미터 누락 (정상 동작) |
| `/api/auth/change-password` | GET | 405 | POST 전용 |
| `/api/auth/change-password` | POST | 500 | 인증 세션 필요 |
| `/api/auth/complete-profile` | GET | 405 | POST 전용 |
| `/api/auth/complete-profile` | POST | 500 | 인증 세션 필요 |
| `/api/auth/providers` | GET | 500 | NextAuth 설정 오류 |
| `/api/auth/session` | GET | 500 | NextAuth 설정 오류 |
| `/api/auth/csrf` | GET | 500 | NextAuth 설정 오류 |

## API 라우트 - 회원 전용 (Authenticated)

| 경로 | 메서드 | 상태 | 비고 |
|------|--------|------|------|
| `/api/notifications` | GET | 500 | 인증 필요 (세션 오류) |
| `/api/my/accounts` | GET | 500 | 인증 필요 |
| `/api/my/likes` | GET | 500 | 인증 필요 |
| `/api/programs/apply` | GET | 405 | POST 전용 |
| `/api/programs/apply` | POST | 500 | 인증 필요 |
| `/api/attendance/check` | GET | 500 | 인증/파라미터 필요 |
| `/api/attendance/qr/generate` | GET | 500 | 인증 필요 |
| `/api/lab/profile` | GET | 500 | 인증 필요 |
| `/api/lab/experts/register` | GET | 405 | POST 전용 |
| `/api/lab/experts/register` | POST | 400 | 필수 파라미터 누락 (정상 동작) |
| `/api/applications/check-member` | GET | 405 | POST 전용 |
| `/api/applications/check-member` | POST | 200 | OK |
| `/api/reports` | GET | 500 | 서버 오류 |
| `/api/reports/templates` | GET | 500 | 서버 오류 |
| `/api/reports/session` | GET | 500 | 서버 오류 |
| `/api/donations` | GET | 500 | 서버 오류 |
| `/api/popups/track` | POST | 400 | 필수 파라미터 누락 (정상 동작) |
| `/api/banners/track` | POST | 500 | 서버 오류 |
| `/api/upload/image` | POST | 500 | 인증 필요 |
| `/api/pages/reorder` | GET | 405 | PUT 전용 |
| `/api/pages/reorder` | PUT | 500 | 인증 필요 |

## API 라우트 - 재정 (Finance)

| 경로 | 메서드 | 상태 | 비고 |
|------|--------|------|------|
| `/api/finance/deposits` | GET | 500 | 인증 필요 |
| `/api/finance/reports` | GET | 500 | 인증 필요 |
| `/api/finance/accounts` | GET | 500 | 인증 필요 |
| `/api/finance/funds` | GET | 500 | 인증 필요 |
| `/api/finance/transactions` | GET | 500 | 인증 필요 |
| `/api/finance/projects` | GET | 500 | 인증 필요 |
| `/api/finance/summary` | GET | 500 | 인증 필요 |
| `/api/banners` | GET | 500 | 서버 오류 |
| `/api/themes` | GET | 500 | 서버 오류 |
| `/api/pages` | GET | 500 | 서버 오류 |
| `/api/issue-surveys/admin` | GET | 500 | 관리자 인증 필요 |

## API 라우트 - 크론 (Cron)

| 경로 | 메서드 | 상태 | 비고 |
|------|--------|------|------|
| `/api/cron/survey-reminders` | GET | 401 | CRON 인증키 필요 (정상 동작) |
| `/api/cron/rsvp` | GET | 401 | CRON 인증키 필요 (정상 동작) |
| `/api/cron/surveys` | GET | 401 | CRON 인증키 필요 (정상 동작) |

## API 라우트 - 관리자 (Admin)

| 경로 | 메서드 | 상태 | 비고 |
|------|--------|------|------|
| `/api/admin/settings/fonts` | GET | 200 | OK (공개) |
| `/api/admin/calendar` | GET | 200 | OK |
| `/api/admin/partners` | GET | 200 | OK |
| `/api/admin/design/cards` | GET | 200 | OK |
| `/api/admin/menus` | GET | 200 | OK |
| `/api/admin/projects` | GET | 200 | OK |
| `/api/admin/blog` | GET | 200 | OK |
| `/api/admin/documents` | GET | 200 | OK |
| `/api/admin/popups` | GET | 500 | 인증/DB 오류 |
| `/api/admin/popups/templates` | GET | 500 | 인증/DB 오류 |
| `/api/admin/seo/global` | GET | 500 | 인증/DB 오류 |
| `/api/admin/seo/settings` | GET | 500 | 인증/DB 오류 |
| `/api/admin/seo/templates` | GET | 500 | 인증/DB 오류 |
| `/api/admin/notifications/logs` | GET | 500 | 인증 필요 |
| `/api/admin/cooperation-sections` | GET | 500 | 인증/DB 오류 |
| `/api/admin/programs` | GET | 500 | 인증 필요 |
| `/api/admin/programs/reorder` | GET | 500 | 인증 필요 |
| `/api/admin/programs/reorder/reverse` | GET | 405 | POST 전용 |
| `/api/admin/lab/trends` | GET | 405 | POST 전용 |
| `/api/admin/lab/surveys` | GET | 405 | POST/PUT 전용 |
| `/api/admin/migration/export` | GET | 500 | 인증 필요 |
| `/api/admin/migration/csv` | GET | 405 | POST 전용 |
| `/api/admin/migration/import` | GET | 405 | POST 전용 |
| `/api/admin/settings` | GET | 500 | 인증 필요 |
| `/api/admin/notification-templates` | GET | 500 | 인증 필요 |
| `/api/admin/reward-claims` | GET | 500 | 인증 필요 |
| `/api/admin/reward-claims/export` | GET | 500 | 인증 필요 |
| `/api/admin/history` | GET | 500 | 인증 필요 |
| `/api/admin/history/restore-points` | GET | 500 | 인증 필요 |
| `/api/admin/history/rollback` | POST | 500 | 인증 필요 |
| `/api/admin/application-forms` | GET | 500 | 인증 필요 |
| `/api/admin/finance/refunds` | GET | 500 | 인증 필요 |
| `/api/admin/themes` | GET | 500 | 인증 필요 |
| `/api/admin/notices` | GET | 500 | 인증 필요 |
| `/api/admin/design/sections` | GET | 500 | 인증 필요 |
| `/api/admin/books` | GET | 500 | 인증 필요 |
| `/api/admin/media` | GET | 500 | 인증 필요 |
| `/api/admin/preview/sessions` | GET | 500 | 인증 필요 |
| `/api/admin/preview/changes` | GET | 500 | 인증 필요 |
| `/api/admin/preview/snapshots` | GET | 500 | 인증 필요 |
| `/api/admin/preview/devices` | GET | 500 | 인증 필요 |
| `/api/admin/custom-code` | GET | 500 | 인증 필요 |
| `/api/admin/members` | GET | 500 | 인증 필요 |
| `/api/admin/interests` | GET | 500 | 인증 필요 |
| `/api/admin/interests/notify` | POST | 500 | 인증 필요 |
| `/api/admin/theme` | GET | 500 | 인증 필요 |
| `/api/admin/surveys` | GET | 500 | 인증 필요 |
| `/api/admin/floating-buttons` | GET | 500 | 인증 필요 |
| `/api/admin/banners` | GET | 500 | 인증 필요 |
| `/api/admin/templates` | GET | 500 | 인증 필요 |
| `/api/admin/users` | GET | 500 | 인증 필요 |
| `/api/admin/users/search` | GET | 404 | 라우트 미등록 |
| `/api/admin/design/sections/reorder` | POST | 500 | 인증 필요 |

## API 라우트 - 클럽 (Club)

| 경로 | 메서드 | 상태 | 비고 |
|------|--------|------|------|
| `/api/club/timeline` | GET | 404 | 라우트 미등록/빌드 미반영 |
| `/api/club/recommendations/generate` | POST | 404 | 라우트 미등록/빌드 미반영 |
| `/api/club/social/follow` | POST | 404 | 라우트 미등록/빌드 미반영 |

---

## 동적 라우트 (파라미터 필요)

> 아래 라우트는 동적 파라미터(`[id]`, `[slug]` 등)가 필요하여 직접 테스트 불가

### 공개 페이지
| 경로 | 파라미터 | 비고 |
|------|----------|------|
| `/programs/[slug]` | slug | 프로그램 상세 |
| `/programs/[slug]/apply` | slug | 프로그램 신청 |
| `/programs/[slug]/apply/complete` | slug | 신청 완료 |
| `/programs/[slug]/book-survey` | slug | 도서 설문 |
| `/blog/[slug]` | slug | 블로그 상세 |
| `/p/[slug]` | slug | 커스텀 페이지 |
| `/reports/[id]` | id | 리포트 상세 |
| `/notice/[id]` | id | 공지 상세 |
| `/notice/[id]/edit` | id | 공지 수정 |

### 회원 페이지
| 경로 | 파라미터 | 비고 |
|------|----------|------|
| `/my/reports/[id]` | id | 내 리포트 상세 |
| `/survey/[id]` | id | 설문 응답 |
| `/mypage/programs/[programId]` | programId | 프로그램 상세 |
| `/mypage/programs/[programId]/sessions/[sessionId]` | programId, sessionId | 세션 상세 |
| `/mypage/programs/[programId]/sessions/[sessionId]/review/write` | programId, sessionId | 리뷰 작성 |
| `/mypage/programs/[programId]/sessions/[sessionId]/absence` | programId, sessionId | 결석 신고 |
| `/mypage/programs/[programId]/sessions/[sessionId]/qr` | programId, sessionId | QR 출석 |
| `/mypage/programs/[programId]/sessions/[sessionId]/report` | programId, sessionId | 리포트 작성 |

### Lab 페이지
| 경로 | 파라미터 | 비고 |
|------|----------|------|
| `/lab/experts/[id]` | id | 전문가 상세 |
| `/lab/surveys/[id]` | id | 설문 상세 |

### 클럽 페이지
| 경로 | 파라미터 | 비고 |
|------|----------|------|
| `/club/bookclub/bookshelf/[bookId]` | bookId | 도서 상세 |
| `/club/bookclub/reviews/[reviewId]` | reviewId | 리뷰 상세 |
| `/club/challenges/[id]` | id | 챌린지 상세 |
| `/club/community/[postId]` | postId | 게시물 상세 |
| `/club/community/[postId]/edit` | postId | 게시물 수정 |
| `/club/help/guides/[slug]` | slug | 가이드 상세 |
| `/club/notices/[id]` | id | 공지 상세 |
| `/club/notices/admin/[id]/edit` | id | 공지 수정 |
| `/club/profile/[userId]` | userId | 프로필 조회 |
| `/club/programs/[id]/recap` | id | 프로그램 회고 |
| `/club/admin/members/[userId]` | userId | 회원 상세 |
| `/club/admin/programs/[id]/edit` | id | 프로그램 수정 |

### 관리자 페이지
| 경로 | 파라미터 | 비고 |
|------|----------|------|
| `/admin/programs/[id]` | id | 프로그램 관리 |
| `/admin/programs/[id]/edit` | id | 프로그램 수정 |
| `/admin/programs/[id]/applications` | id | 신청자 관리 |
| `/admin/programs/[id]/absences` | id | 결석 관리 |
| `/admin/programs/[id]/deposit-settings` | id | 보증금 설정 |
| `/admin/programs/[id]/reports` | id | 리포트 관리 |
| `/admin/programs/[id]/refund` | id | 환불 관리 |
| `/admin/programs/[id]/session-reports` | id | 세션 리포트 |
| `/admin/programs/[id]/facilitator-checklist` | id | 진행자 체크리스트 |
| `/admin/programs/[id]/surveys/create` | id | 설문 생성 |
| `/admin/programs/[id]/sessions/[sessionId]/qr` | id, sessionId | QR 관리 |
| `/admin/finance/projects/[id]` | id | 재정 프로젝트 |
| `/admin/design/pages/[id]` | id | 페이지 편집 |
| `/admin/books/[id]` | id | 도서 편집 |
| `/admin/members/[id]` | id | 회원 상세 |
| `/admin/surveys/[id]/results` | id | 설문 결과 |
| `/admin/surveys/[id]/reminders` | id | 설문 알림 |
| `/admin/pages/[id]` | id | 페이지 편집 |

### 기타 동적 페이지
| 경로 | 파라미터 | 비고 |
|------|----------|------|
| `/attendance/[code]` | code | 출석 코드 |
| `/preview/[sessionKey]` | sessionKey | 미리보기 |
| `/rsvp/[rsvpId]` | rsvpId | RSVP 응답 |
| `/sessions/[sessionId]/blog/edit/[postId]` | sessionId, postId | 블로그 수정 |

### 동적 API 라우트
| 경로 | 파라미터 | 비고 |
|------|----------|------|
| `/api/notifications/[id]` | id | 알림 단건 |
| `/api/programs/[id]/deposit` | id | 보증금 |
| `/api/programs/[id]/reports` | id | 리포트 |
| `/api/programs/[id]/like` | id | 좋아요 |
| `/api/programs/[id]/apply` | id | 신청 |
| `/api/programs/[id]/attendance` | id | 출석 |
| `/api/programs/[id]/sessions` | id | 세션 목록 |
| `/api/programs/[id]/sessions/[sessionId]` | id, sessionId | 세션 단건 |
| `/api/programs/[id]/participants` | id | 참가자 |
| `/api/programs/[id]/book-survey` | id | 도서 설문 |
| `/api/programs/by-slug/[slug]` | slug | 슬러그로 프로그램 조회 |
| `/api/lab/surveys/[id]/apply` | id | 설문 신청 |
| `/api/lab/surveys/[id]/claim` | id | 보상 청구 |
| `/api/my/accounts/[id]` | id | 계좌 단건 |
| `/api/donations/[id]/receipt` | id | 기부 영수증 |
| `/api/reports/[id]/comments` | id | 댓글 |
| `/api/reports/[id]/comments/[commentId]` | id, commentId | 댓글 단건 |
| `/api/reports/[id]/like` | id | 좋아요 |
| `/api/reports/[id]/comment` | id | 댓글(구) |
| `/api/reports/[id]/comment/[commentId]` | id, commentId | 댓글 단건(구) |
| `/api/finance/transactions/[id]` | id | 거래 단건 |
| `/api/finance/projects/[id]` | id | 프로젝트 단건 |
| `/api/pages/[id]` | id | 페이지 단건 |
| `/api/preview/[sessionKey]` | sessionKey | 미리보기 |
| `/api/issue-surveys/[id]` | id | 이슈 설문 단건 |
| `/api/issue-surveys/[id]/respond` | id | 설문 응답 |
| `/api/issue-surveys/[id]/responses/[responseId]/like` | id, responseId | 응답 좋아요 |
| `/api/cooperation/consulting/[id]` | id | 컨설팅 단건 |
| `/api/cooperation/survey/[id]` | id | 설문 단건 |
| `/api/cooperation/lecturer/[id]` | id | 강사 단건 |
| `/api/sessions/[id]` | id | 세션 단건 |
| `/api/admin/popups/[id]` | id | 팝업 단건 |
| `/api/admin/seo/settings/[id]` | id | SEO 설정 단건 |
| `/api/admin/blog/[id]` | id | 블로그 단건 |
| `/api/admin/cooperation-sections/[id]` | id | 협력 섹션 단건 |
| `/api/admin/programs/[id]` | id | 프로그램 단건 |
| `/api/admin/programs/[id]/book-surveys` | id | 도서 설문 |
| `/api/admin/programs/[id]/deposit-settings` | id | 보증금 설정 |
| `/api/admin/programs/[id]/survey` | id | 설문 |
| `/api/admin/programs/[id]/applications/[appId]` | id, appId | 신청 단건 |
| `/api/admin/programs/[id]/applications/bulk` | id | 일괄 처리 |
| `/api/admin/programs/[id]/refund` | id | 환불 |
| `/api/admin/programs/[id]/refund/export` | id | 환불 내보내기 |
| `/api/admin/lab/trends/[id]` | id | 트렌드 단건 |
| `/api/admin/lab/experts/[id]` | id | 전문가 단건 |
| `/api/admin/lab/participations/[id]` | id | 참여 단건 |
| `/api/admin/lab/surveys/[id]` | id | 설문 단건 |
| `/api/admin/templates/[id]` | id | 템플릿 단건 |
| `/api/admin/documents/[id]` | id | 문서 단건 |
| `/api/admin/notification-templates/[id]` | id | 알림 템플릿 단건 |
| `/api/admin/banners/[id]` | id | 배너 단건 |
| `/api/admin/banners/[id]/analytics` | id | 배너 분석 |
| `/api/admin/history/restore-points/[id]` | id | 복원 지점 단건 |
| `/api/admin/application-forms/[id]` | id | 신청 양식 단건 |
| `/api/admin/themes/[id]` | id | 테마 단건 |
| `/api/admin/notices/[id]` | id | 공지 단건 |
| `/api/admin/calendar/[id]` | id | 일정 단건 |
| `/api/admin/partners/[id]` | id | 파트너 단건 |
| `/api/admin/design/sections/[key]` | key | 섹션 단건 |
| `/api/admin/design/sections/[key]/visibility` | key | 섹션 가시성 |
| `/api/admin/books/[id]` | id | 도서 단건 |
| `/api/admin/preview/sessions/[id]` | id | 세션 단건 |
| `/api/admin/menus/[id]` | id | 메뉴 단건 |
| `/api/admin/custom-code/[id]` | id | 커스텀 코드 단건 |
| `/api/admin/projects/[id]` | id | 프로젝트 단건 |
| `/api/admin/members/[id]` | id | 회원 단건 |
| `/api/admin/members/[id]/grade` | id | 회원 등급 |
| `/api/admin/members/[id]/status` | id | 회원 상태 |
| `/api/admin/surveys/[id]/reminders` | id | 설문 알림 |
| `/api/admin/surveys/[id]/results` | id | 설문 결과 |
| `/api/admin/surveys/[id]/results/export` | id | 설문 결과 내보내기 |
| `/api/admin/floating-buttons/[id]` | id | 플로팅 버튼 단건 |
| `/api/admin/floating-buttons/[id]/analytics` | id | 플로팅 버튼 분석 |
| `/api/admin/sessions/[id]/attendances` | id | 출석 기록 |
| `/api/admin/sessions/[id]/qr` | id | QR 코드 |
| `/api/club/community/[postId]/like` | postId | 게시물 좋아요 |
| `/api/club/community/[postId]/comments` | postId | 게시물 댓글 |

---

## 분석 및 주요 소견

### 1. 정상 동작 (OK)
- **메인 페이지** (`/`), **블로그** (`/blog`): 정상
- **인증 페이지** 5개 전체 정상 (200)
- **출석 페이지** 2개 정상 (200)
- **클럽 기본 페이지** 13개 정상 (200)
- **공개 API** 13개 정상 (200)
- **관리자 API** 일부 7개 정상 (인증 없이 접근 가능: fonts, calendar, partners, cards, menus, projects, blog, documents)

### 2. 인증 보호 (정상 동작)
- **Admin 페이지 75개**: 307 -> /login 리다이렉트 (미들웨어 인증 보호 정상)
- **Member 페이지 11개**: 307 -> /login 리다이렉트 (인증 보호 정상)
- **Mypage 페이지 3개**: 307 -> /login 리다이렉트 (인증 보호 정상)
- **Lab 페이지 6개**: 307 -> /login 리다이렉트 (인증 보호 정상)
- **Cron API 3개**: 401 Unauthorized (인증키 보호 정상)

### 3. 주의 사항
- **공개 페이지 다수 500 오류**: `/privacy`, `/terms`, `/programs` 등 22개 페이지가 500 에러 - DB 연결 또는 서버 사이드 렌더링 오류 가능성
- **NextAuth 엔드포인트 500**: `/api/auth/providers`, `/api/auth/session`, `/api/auth/csrf` 모두 500 - NextAuth 설정 확인 필요
- **클럽 페이지 다수 404**: 43개 클럽 페이지가 404 - 빌드에 반영되지 않은 페이지 (코드는 존재하나 라우팅 미등록)
- **Admin API 인증 미비**: `/api/admin/calendar`, `/api/admin/partners` 등 7개 API가 인증 없이 200 반환 - 보안 검토 필요

### 4. 보안 관련
- Admin 페이지는 미들웨어 수준에서 잘 보호됨 (307 리다이렉트)
- 그러나 일부 Admin API는 인증 없이 접근 가능 (잠재적 보안 이슈)
- Cron 엔드포인트는 인증키로 적절히 보호됨
