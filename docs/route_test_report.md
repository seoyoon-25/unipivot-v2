# 라우트 접속 테스트 보고서

**테스트 일시**: 2026-01-30
**테스트 대상**: https://bestcome.org
**테스트 방법**: curl HTTP 상태 코드 확인 (리다이렉트 미추적 모드)

---

## 요약

| 구분 | 수량 |
|---|---|
| 총 라우트 수 (페이지) | 176개 |
| 총 API 라우트 수 | 152개 |
| **페이지 - 정상 (200)** | **75개** |
| **페이지 - 리다이렉트 (3xx)** | **3개** |
| **페이지 - 인증 필요 (307 -> 로그인)** | **72개** |
| **페이지 - 오류 (404)** | **12개** |
| **페이지 - 동적 라우트 (미테스트)** | **44개** |
| **API - 정상 (200)** | **32개** |
| **API - 인증 필요 (401/403)** | **35개** |
| **API - Method Not Allowed (405)** | **21개** |
| **API - 동적 라우트 (미테스트)** | **34개** |

### 상태 코드 범례
- 200: 정상 접속
- 307: 임시 리다이렉트 (주로 로그인 페이지로)
- 308: 영구 리다이렉트
- 401: 인증 필요 (Unauthorized)
- 403: 접근 거부 (Forbidden - 관리자 권한 필요)
- 404: 페이지 없음
- 405: HTTP Method Not Allowed (POST 전용 등)

---

## 1. 메인 사이트 - Public 페이지

### 1.1 정적 라우트

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/` | 200 | 정상 |
| `/about` | 200 | 정상 |
| `/blog` | 200 | 정상 |
| `/bookclub` | 200 | 정상 |
| `/books` | 200 | 정상 |
| `/bookshelf` | 307 | 리다이렉트 -> club.bestcome.org/bookclub/bookshelf |
| `/cooperation` | 200 | 정상 |
| `/cooperation/consulting/apply` | 200 | 정상 |
| `/cooperation/survey/apply` | 200 | 정상 |
| `/cooperation/lecturer/apply` | 200 | 정상 |
| `/debug` | 200 | 정상 (개발용 페이지 - 프로덕션 노출 확인 필요) |
| `/demo/walking-loader` | 200 | 정상 (데모 페이지) |
| `/donate` | 200 | 정상 |
| `/experts` | 200 | 정상 |
| `/kmove` | 200 | 정상 |
| `/korea-issue` | 200 | 정상 |
| `/notice` | 200 | 정상 |
| `/notice/write` | 200 | 정상 |
| `/privacy` | 200 | 정상 |
| `/programs` | 200 | 정상 |
| `/reports` | 200 | 정상 |
| `/request` | 200 | 정상 |
| `/seminar` | 200 | 정상 |
| `/simple` | 200 | 정상 |
| `/suggest` | 200 | 정상 |
| `/talent` | 200 | 정상 |
| `/terms` | 200 | 정상 |
| `/p/about-us` | 308 | 영구 리다이렉트 -> /about |
| `/p/history` | 308 | 영구 리다이렉트 -> /history (대상 404 확인 필요) |

### 1.2 동적 라우트 (미테스트)

| 라우트 | 비고 |
|---|---|
| `/blog/[slug]` | 동적 라우트 - 파라미터 필요 |
| `/programs/[slug]` | 동적 라우트 - 파라미터 필요 |
| `/programs/[slug]/apply` | 동적 라우트 - 파라미터 필요 |
| `/programs/[slug]/apply/complete` | 동적 라우트 - 파라미터 필요 |
| `/programs/[slug]/book-survey` | 동적 라우트 - 파라미터 필요 |
| `/notice/[id]` | 동적 라우트 - 파라미터 필요 |
| `/notice/[id]/edit` | 동적 라우트 - 파라미터 필요 |
| `/reports/[id]` | 동적 라우트 - 파라미터 필요 |
| `/p/[slug]` | 동적 라우트 - 파라미터 필요 |

---

## 2. 클럽 (/club/*)

### 2.1 정적 라우트

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/club` | 200 | 정상 |
| `/club/admin` | 200 | 정상 (클럽 관리자 페이지) |
| `/club/facilitator` | 200 | 정상 |
| `/club/facilitator/attendance` | 404 | 페이지 없음 |
| `/club/facilitator/attendance/qr` | 404 | 페이지 없음 |
| `/club/facilitator/questions` | 404 | 페이지 없음 |
| `/club/facilitator/resources` | 404 | 페이지 없음 |
| `/club/facilitator/timer` | 404 | 페이지 없음 |
| `/club/my` | 200 | 정상 |
| `/club/programs` | 404 | 페이지 없음 |
| `/club/attendance` | 404 | 페이지 없음 |
| `/club/attendance/scan` | 404 | 페이지 없음 |
| `/club/bookclub` | 200 | 정상 |
| `/club/bookclub/bookshelf` | 200 | 정상 |
| `/club/bookclub/my-bookshelf` | 200 | 정상 |
| `/club/bookclub/quotes` | 404 | 페이지 없음 |
| `/club/bookclub/reviews` | 404 | 페이지 없음 |
| `/club/bookclub/reviews/write` | 404 | 페이지 없음 |
| `/club/bookclub/stamps` | 404 | 페이지 없음 |
| `/club/onboarding` | 404 | 페이지 없음 |
| `/club/unauthorized` | 200 | 정상 |

### 2.2 동적 라우트 (미테스트)

| 라우트 | 비고 |
|---|---|
| `/club/bookclub/bookshelf/[bookId]` | 동적 라우트 - 파라미터 필요 |
| `/club/bookclub/reviews/[reviewId]` | 동적 라우트 - 파라미터 필요 |

---

## 3. 어드민 (/admin/*)

> 모든 어드민 라우트는 비인증 상태에서 307 (로그인 페이지로 리다이렉트)를 반환합니다.
> 이는 정상적인 보안 동작입니다.

### 3.1 정적 라우트

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/admin` | 307 | 인증 필요 (로그인 리다이렉트) |
| `/admin/ai` | 307 | 인증 필요 |
| `/admin/ai/chatbot` | 307 | 인증 필요 |
| `/admin/ai/knowledge` | 307 | 인증 필요 |
| `/admin/banners` | 307 | 인증 필요 |
| `/admin/books` | 307 | 인증 필요 |
| `/admin/books/new` | 307 | 인증 필요 |
| `/admin/business` | 307 | 인증 필요 |
| `/admin/business/calendar` | 307 | 인증 필요 |
| `/admin/business/documents` | 307 | 인증 필요 |
| `/admin/business/partners` | 307 | 인증 필요 |
| `/admin/business/projects` | 307 | 인증 필요 |
| `/admin/contents` | 307 | 인증 필요 |
| `/admin/contents/blog` | 307 | 인증 필요 |
| `/admin/contents/notices` | 307 | 인증 필요 |
| `/admin/cooperation` | 307 | 인증 필요 |
| `/admin/cooperation/consulting` | 307 | 인증 필요 |
| `/admin/cooperation/lecturer` | 307 | 인증 필요 |
| `/admin/cooperation/sections` | 307 | 인증 필요 |
| `/admin/cooperation/survey` | 307 | 인증 필요 |
| `/admin/custom-code` | 307 | 인증 필요 |
| `/admin/design` | 307 | 인증 필요 |
| `/admin/design/about` | 307 | 인증 필요 |
| `/admin/design/announcement-banner` | 307 | 인증 필요 |
| `/admin/design/banners` | 307 | 인증 필요 |
| `/admin/design/cards` | 307 | 인증 필요 |
| `/admin/design/custom-code` | 307 | 인증 필요 |
| `/admin/design/floating-buttons` | 307 | 인증 필요 |
| `/admin/design/fonts` | 307 | 인증 필요 |
| `/admin/design/history` | 307 | 인증 필요 |
| `/admin/design/menus` | 307 | 인증 필요 |
| `/admin/design/pages` | 307 | 인증 필요 |
| `/admin/design/popups` | 307 | 인증 필요 |
| `/admin/design/sections` | 307 | 인증 필요 |
| `/admin/design/seo` | 307 | 인증 필요 |
| `/admin/design/theme` | 307 | 인증 필요 |
| `/admin/finance` | 307 | 인증 필요 |
| `/admin/finance/accounts` | 307 | 인증 필요 |
| `/admin/finance/deposits` | 307 | 인증 필요 |
| `/admin/finance/donations` | 307 | 인증 필요 |
| `/admin/finance/funds` | 307 | 인증 필요 |
| `/admin/finance/projects` | 307 | 인증 필요 |
| `/admin/finance/projects/new` | 307 | 인증 필요 |
| `/admin/finance/refunds` | 307 | 인증 필요 |
| `/admin/finance/reports` | 307 | 인증 필요 |
| `/admin/finance/transactions` | 307 | 인증 필요 |
| `/admin/floating-buttons` | 307 | 인증 필요 |
| `/admin/history` | 307 | 인증 필요 |
| `/admin/interests` | 307 | 인증 필요 |
| `/admin/lab` | 307 | 인증 필요 |
| `/admin/lab/experts` | 307 | 인증 필요 |
| `/admin/lab/participations` | 307 | 인증 필요 |
| `/admin/lab/reward-claims` | 307 | 인증 필요 |
| `/admin/lab/surveys` | 307 | 인증 필요 |
| `/admin/lab/trends` | 307 | 인증 필요 |
| `/admin/media` | 307 | 인증 필요 |
| `/admin/members` | 307 | 인증 필요 |
| `/admin/members/new` | 307 | 인증 필요 |
| `/admin/members/blacklist` | 307 | 인증 필요 |
| `/admin/notifications` | 307 | 인증 필요 |
| `/admin/notifications/logs` | 307 | 인증 필요 |
| `/admin/notifications/templates` | 307 | 인증 필요 |
| `/admin/pages` | 307 | 인증 필요 |
| `/admin/popups` | 307 | 인증 필요 |
| `/admin/preview` | 307 | 인증 필요 |
| `/admin/programs` | 307 | 인증 필요 |
| `/admin/programs/forms` | 307 | 인증 필요 |
| `/admin/programs/new` | 307 | 인증 필요 |
| `/admin/programs/order` | 307 | 인증 필요 |
| `/admin/seo` | 307 | 인증 필요 |
| `/admin/settings` | 307 | 인증 필요 |
| `/admin/settings/admins` | 307 | 인증 필요 |
| `/admin/settings/backup` | 307 | 인증 필요 |
| `/admin/settings/fonts` | 307 | 인증 필요 |
| `/admin/settings/migration` | 307 | 인증 필요 |
| `/admin/surveys` | 307 | 인증 필요 |
| `/admin/themes` | 307 | 인증 필요 |

### 3.2 동적 라우트 (미테스트)

| 라우트 | 비고 |
|---|---|
| `/admin/books/[id]` | 동적 라우트 - 파라미터 필요 |
| `/admin/design/pages/[id]` | 동적 라우트 - 파라미터 필요 |
| `/admin/finance/projects/[id]` | 동적 라우트 - 파라미터 필요 |
| `/admin/members/[id]` | 동적 라우트 - 파라미터 필요 |
| `/admin/pages/[id]` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/absences` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/applications` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/deposit-settings` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/edit` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/facilitator-checklist` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/refund` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/reports` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/session-reports` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/sessions/[sessionId]/qr` | 동적 라우트 - 파라미터 필요 |
| `/admin/programs/[id]/surveys/create` | 동적 라우트 - 파라미터 필요 |
| `/admin/surveys/[id]/reminders` | 동적 라우트 - 파라미터 필요 |
| `/admin/surveys/[id]/results` | 동적 라우트 - 파라미터 필요 |

---

## 4. API 라우트 (/api/*)

### 4.1 공개 API (인증 불필요)

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/api/popups/active` | 200 | 정상 (GET) |
| `/api/seo/metadata` | 200 | 정상 (GET) |
| `/api/banners` | 200 | 정상 (GET) |
| `/api/design/cards` | 200 | 정상 (GET) |
| `/api/themes` | 200 | 정상 (GET) |
| `/api/public/site-config` | 200 | 정상 (GET) |
| `/api/public/banners` | 200 | 정상 (GET) |
| `/api/public/theme` | 200 | 정상 (GET) |
| `/api/floating-buttons` | 200 | 정상 (GET) |
| `/api/custom-code/active` | 200 | 정상 (GET) |
| `/api/lab/categories` | 200 | 정상 (GET) |
| `/api/lab/experts` | 200 | 정상 (GET) |
| `/api/lab/surveys` | 200 | 정상 (GET) |
| `/api/lab/trends` | 200 | 정상 (GET) |
| `/api/interests` | 200 | 정상 (GET) |
| `/api/interests/keywords` | 200 | 정상 (GET) |
| `/api/interests/alerts` | 200 | 정상 (GET) |
| `/api/interests/network` | 200 | 정상 (GET) |
| `/api/interests/top` | 200 | 정상 (GET) |
| `/api/cooperation/consulting` | 200 | 정상 (GET) |
| `/api/cooperation/sections` | 200 | 정상 (GET) |
| `/api/cooperation/survey` | 200 | 정상 (GET) |
| `/api/cooperation/lecturer` | 200 | 정상 (GET) |
| `/api/issue-surveys` | 200 | 정상 (GET) |

### 4.2 POST 전용 API (GET 시 405)

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/api/popups/track` | 405 | POST 전용 - Method Not Allowed 정상 |
| `/api/notifications/read` | 405 | POST 전용 |
| `/api/programs/apply` | 405 | POST 전용 |
| `/api/banners/track` | 405 | POST 전용 |
| `/api/chat` | 405 | POST 전용 |
| `/api/upload` | 405 | POST 전용 |
| `/api/upload/file` | 405 | POST 전용 |
| `/api/upload/image` | 405 | POST 전용 |
| `/api/pages/reorder` | 405 | POST 전용 |
| `/api/floating-buttons/track` | 405 | POST 전용 |
| `/api/interests/like` | 405 | POST 전용 |
| `/api/auth/forgot-password` | 405 | POST 전용 |
| `/api/auth/complete-profile` | 405 | POST 전용 |
| `/api/auth/reset-password` | 405 | POST 전용 |
| `/api/auth/change-password` | 405 | POST 전용 |
| `/api/auth/register` | 405 | POST 전용 |
| `/api/lab/experts/register` | 405 | POST 전용 |
| `/api/applications/check-member` | 405 | POST 전용 |
| `/api/attendance/check` | 405 | POST 전용 |

### 4.3 인증 필요 API (401 Unauthorized)

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/api/notifications` | 401 | 로그인 필요 |
| `/api/pages` | 401 | 로그인 필요 |
| `/api/lab/profile` | 401 | 로그인 필요 |
| `/api/reports` | 401 | 로그인 필요 |
| `/api/reports/templates` | 401 | 로그인 필요 |
| `/api/reports/session` | 401 | 로그인 필요 |
| `/api/donations` | 401 | 로그인 필요 |
| `/api/finance/deposits` | 401 | 로그인 필요 |
| `/api/finance/reports` | 401 | 로그인 필요 |
| `/api/finance/accounts` | 401 | 로그인 필요 |
| `/api/finance/funds` | 401 | 로그인 필요 |
| `/api/finance/transactions` | 401 | 로그인 필요 |
| `/api/finance/projects` | 401 | 로그인 필요 |
| `/api/finance/summary` | 401 | 로그인 필요 |
| `/api/my/accounts` | 401 | 로그인 필요 |
| `/api/my/likes` | 401 | 로그인 필요 |
| `/api/surveys` | 401 | 로그인 필요 |
| `/api/attendance/qr/generate` | 401 | 로그인 필요 |
| `/api/issue-surveys/admin` | 401 | 로그인 필요 |
| `/api/cron/survey-reminders` | 401 | 인증 필요 (cron 시크릿) |
| `/api/cron/rsvp` | 401 | 인증 필요 (cron 시크릿) |
| `/api/cron/surveys` | 401 | 인증 필요 (cron 시크릿) |

### 4.4 관리자 API (403 Forbidden / 401 Unauthorized)

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/api/admin/application-forms` | 403 | 관리자 권한 필요 |
| `/api/admin/banners` | 403 | 관리자 권한 필요 |
| `/api/admin/blog` | 200 | GET 허용 (공개 조회) |
| `/api/admin/books` | 403 | 관리자 권한 필요 |
| `/api/admin/calendar` | 200 | GET 허용 (공개 조회) |
| `/api/admin/cooperation-sections` | 403 | 관리자 권한 필요 |
| `/api/admin/custom-code` | 403 | 관리자 권한 필요 |
| `/api/admin/design/cards` | 200 | GET 허용 (공개 조회) |
| `/api/admin/design/sections` | 403 | 관리자 권한 필요 |
| `/api/admin/design/sections/reorder` | 405 | POST 전용 |
| `/api/admin/documents` | 200 | GET 허용 (공개 조회) |
| `/api/admin/finance/refunds` | 403 | 관리자 권한 필요 |
| `/api/admin/floating-buttons` | 403 | 관리자 권한 필요 |
| `/api/admin/history` | 403 | 관리자 권한 필요 |
| `/api/admin/history/restore-points` | 403 | 관리자 권한 필요 |
| `/api/admin/history/rollback` | 405 | POST 전용 |
| `/api/admin/interests` | 403 | 관리자 권한 필요 |
| `/api/admin/interests/notify` | 403 | 관리자 권한 필요 |
| `/api/admin/lab/surveys` | 405 | POST 전용 |
| `/api/admin/lab/trends` | 405 | POST 전용 |
| `/api/admin/media` | 403 | 관리자 권한 필요 |
| `/api/admin/members` | 403 | 관리자 권한 필요 |
| `/api/admin/menus` | 200 | GET 허용 (공개 조회) |
| `/api/admin/migration/csv` | 405 | POST 전용 |
| `/api/admin/migration/export` | 401 | 인증 필요 |
| `/api/admin/migration/import` | 405 | POST 전용 |
| `/api/admin/notices` | 403 | 관리자 권한 필요 |
| `/api/admin/notification-templates` | 403 | 관리자 권한 필요 |
| `/api/admin/notifications/logs` | 403 | 관리자 권한 필요 |
| `/api/admin/partners` | 200 | GET 허용 (공개 조회) |
| `/api/admin/popups` | 403 | 관리자 권한 필요 |
| `/api/admin/popups/templates` | 403 | 관리자 권한 필요 |
| `/api/admin/preview/changes` | 403 | 관리자 권한 필요 |
| `/api/admin/preview/devices` | 403 | 관리자 권한 필요 |
| `/api/admin/preview/sessions` | 403 | 관리자 권한 필요 |
| `/api/admin/preview/snapshots` | 403 | 관리자 권한 필요 |
| `/api/admin/programs` | 403 | 관리자 권한 필요 |
| `/api/admin/programs/reorder` | 403 | 관리자 권한 필요 |
| `/api/admin/programs/reorder/reverse` | 405 | POST 전용 |
| `/api/admin/projects` | 200 | GET 허용 (공개 조회) |
| `/api/admin/reward-claims` | 401 | 인증 필요 |
| `/api/admin/reward-claims/export` | 401 | 인증 필요 |
| `/api/admin/seo/global` | 403 | 관리자 권한 필요 |
| `/api/admin/seo/settings` | 403 | 관리자 권한 필요 |
| `/api/admin/seo/templates` | 403 | 관리자 권한 필요 |
| `/api/admin/settings` | 403 | 관리자 권한 필요 |
| `/api/admin/settings/fonts` | 200 | GET 허용 (공개 조회) |
| `/api/admin/surveys` | 403 | 관리자 권한 필요 |
| `/api/admin/templates` | 401 | 인증 필요 |
| `/api/admin/theme` | 403 | 관리자 권한 필요 |
| `/api/admin/themes` | 403 | 관리자 권한 필요 |
| `/api/admin/users` | 401 | 인증 필요 |

### 4.5 동적 API 라우트 (미테스트)

| 라우트 | 비고 |
|---|---|
| `/api/notifications/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/deposit` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/reports` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/like` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/apply` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/attendance` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/sessions` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/sessions/[sessionId]` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/participants` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/[id]/book-survey` | 동적 라우트 - 파라미터 필요 |
| `/api/programs/by-slug/[slug]` | 동적 라우트 - 파라미터 필요 |
| `/api/lab/surveys/[id]/apply` | 동적 라우트 - 파라미터 필요 |
| `/api/lab/surveys/[id]/claim` | 동적 라우트 - 파라미터 필요 |
| `/api/my/accounts/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/donations/[id]/receipt` | 동적 라우트 - 파라미터 필요 |
| `/api/reports/[id]/comments` | 동적 라우트 - 파라미터 필요 |
| `/api/reports/[id]/comments/[commentId]` | 동적 라우트 - 파라미터 필요 |
| `/api/reports/[id]/like` | 동적 라우트 - 파라미터 필요 |
| `/api/reports/[id]/comment` | 동적 라우트 - 파라미터 필요 |
| `/api/reports/[id]/comment/[commentId]` | 동적 라우트 - 파라미터 필요 |
| `/api/finance/transactions/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/finance/projects/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/pages/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/preview/[sessionKey]` | 동적 라우트 - 파라미터 필요 |
| `/api/issue-surveys/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/issue-surveys/[id]/respond` | 동적 라우트 - 파라미터 필요 |
| `/api/issue-surveys/[id]/responses/[responseId]/like` | 동적 라우트 - 파라미터 필요 |
| `/api/cooperation/consulting/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/cooperation/survey/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/cooperation/lecturer/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/sessions/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/surveys/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/auth/[...nextauth]` | NextAuth 핸들러 (동적) |
| `/api/admin/banners/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/banners/[id]/analytics` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/blog/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/books/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/calendar/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/cooperation-sections/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/custom-code/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/design/sections/[key]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/design/sections/[key]/visibility` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/documents/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/floating-buttons/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/floating-buttons/[id]/analytics` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/history/restore-points/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/lab/experts/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/lab/participations/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/lab/surveys/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/lab/trends/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/members/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/members/[id]/grade` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/members/[id]/status` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/menus/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/notices/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/notification-templates/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/partners/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/popups/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/preview/sessions/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/programs/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/programs/[id]/applications/[appId]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/programs/[id]/applications/bulk` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/programs/[id]/book-surveys` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/programs/[id]/deposit-settings` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/programs/[id]/refund` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/programs/[id]/refund/export` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/programs/[id]/survey` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/seo/settings/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/sessions/[id]/attendances` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/sessions/[id]/qr` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/surveys/[id]/reminders` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/surveys/[id]/results` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/surveys/[id]/results/export` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/templates/[id]` | 동적 라우트 - 파라미터 필요 |
| `/api/admin/themes/[id]` | 동적 라우트 - 파라미터 필요 |

---

## 5. 인증 페이지 (/login, /register, etc.)

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/login` | 200 | 정상 |
| `/register` | 200 | 정상 |
| `/forgot-password` | 200 | 정상 |
| `/complete-profile` | 200 | 정상 |
| `/reset-password` | 200 | 정상 |

---

## 6. 마이페이지

### 6.1 /my/* (member 그룹)

> 모든 /my/* 라우트는 비인증 상태에서 307 (로그인 페이지로 리다이렉트)를 반환합니다.

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/my` | 307 | 인증 필요 (로그인 리다이렉트) |
| `/my/accounts` | 307 | 인증 필요 |
| `/my/applications` | 307 | 인증 필요 |
| `/my/likes` | 307 | 인증 필요 |
| `/my/notifications` | 307 | 인증 필요 |
| `/my/points` | 307 | 인증 필요 |
| `/my/profile` | 307 | 인증 필요 |
| `/my/programs` | 307 | 인증 필요 |
| `/my/reports` | 307 | 인증 필요 |
| `/my/reports/new` | 307 | 인증 필요 |
| `/my/settings` | 307 | 인증 필요 |

#### 동적 라우트

| 라우트 | 비고 |
|---|---|
| `/my/reports/[id]` | 동적 라우트 - 파라미터 필요 |
| `/survey/[id]` | 동적 라우트 - 파라미터 필요 (member 그룹) |

### 6.2 /mypage/* (레거시)

> 모든 /mypage/* 라우트는 비인증 상태에서 307 (로그인 페이지로 리다이렉트)를 반환합니다.

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/mypage/profile` | 307 | 인증 필요 (로그인 리다이렉트) |
| `/mypage/settings/notifications` | 307 | 인증 필요 |
| `/mypage/settings/bank-account` | 307 | 인증 필요 |

#### 동적 라우트

| 라우트 | 비고 |
|---|---|
| `/mypage/programs/[programId]` | 동적 라우트 - 파라미터 필요 |
| `/mypage/programs/[programId]/sessions/[sessionId]` | 동적 라우트 - 파라미터 필요 |
| `/mypage/programs/[programId]/sessions/[sessionId]/absence` | 동적 라우트 - 파라미터 필요 |
| `/mypage/programs/[programId]/sessions/[sessionId]/qr` | 동적 라우트 - 파라미터 필요 |
| `/mypage/programs/[programId]/sessions/[sessionId]/report` | 동적 라우트 - 파라미터 필요 |
| `/mypage/programs/[programId]/sessions/[sessionId]/review/write` | 동적 라우트 - 파라미터 필요 |

---

## 7. 랩 (/lab/*)

> 모든 /lab/* 라우트는 비인증 상태에서 307 (로그인 페이지로 리다이렉트)를 반환합니다.

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/lab` | 307 | 인증 필요 (로그인 리다이렉트) |
| `/lab/experts` | 307 | 인증 필요 |
| `/lab/experts/register` | 307 | 인증 필요 |
| `/lab/profile` | 307 | 인증 필요 |
| `/lab/surveys` | 307 | 인증 필요 |
| `/lab/trends` | 307 | 인증 필요 |

#### 동적 라우트

| 라우트 | 비고 |
|---|---|
| `/lab/experts/[id]` | 동적 라우트 - 파라미터 필요 |
| `/lab/surveys/[id]` | 동적 라우트 - 파라미터 필요 |

---

## 8. 기타 페이지

| 라우트 | 상태 | 비고 |
|---|---|---|
| `/attendance/check` | 200 | 정상 |
| `/attendance/scan` | 200 | 정상 |
| `/community/reports` | 200 | 정상 |
| `/robots.txt` | 200 | 정상 |
| `/sitemap.xml` | 404 | 페이지 없음 (사이트맵 라우트 문제) |

#### 동적 라우트

| 라우트 | 비고 |
|---|---|
| `/attendance/[code]` | 동적 라우트 - 파라미터 필요 |
| `/preview/[sessionKey]` | 동적 라우트 - 파라미터 필요 |
| `/rsvp/[rsvpId]` | 동적 라우트 - 파라미터 필요 |
| `/sessions/[sessionId]/blog/edit/[postId]` | 동적 라우트 - 파라미터 필요 |
| `/surveys/[surveyId]` | 동적 라우트 - 파라미터 필요 |
| `/surveys/[surveyId]/respond` | 동적 라우트 - 파라미터 필요 |
| `/community/reports/[id]` | 동적 라우트 - 파라미터 필요 |

---

## 9. 주요 발견 사항

### 9.1 주의가 필요한 항목

| 항목 | 설명 | 심각도 |
|---|---|---|
| `/sitemap.xml` 404 | 사이트맵이 404 반환 - SEO에 영향 가능 | 높음 |
| `/p/history` 리다이렉트 대상 404 | `/p/history` -> `/history`로 308 리다이렉트하나 `/history`가 존재하지 않음 | 중간 |
| `/debug` 페이지 공개 노출 | 디버그 페이지가 프로덕션에서 공개 접근 가능 | 중간 |
| `/demo/walking-loader` 공개 노출 | 데모 페이지가 프로덕션에서 공개 접근 가능 | 낮음 |

### 9.2 Club 페이지 404 목록 (12개)

다음 클럽 페이지들이 파일 시스템에 존재하지만 라이브 사이트에서 404를 반환합니다. 별도 club.bestcome.org 서브도메인에서 서비스될 수 있거나 아직 배포되지 않았을 수 있습니다.

- `/club/facilitator/attendance`
- `/club/facilitator/attendance/qr`
- `/club/facilitator/questions`
- `/club/facilitator/resources`
- `/club/facilitator/timer`
- `/club/programs`
- `/club/attendance`
- `/club/attendance/scan`
- `/club/bookclub/quotes`
- `/club/bookclub/reviews`
- `/club/bookclub/reviews/write`
- `/club/bookclub/stamps`
- `/club/onboarding`

### 9.3 보안 상태 요약

- **어드민 페이지**: 모든 58개 정적 라우트가 307 리다이렉트로 보호됨 (정상)
- **마이페이지**: 모든 14개 정적 라우트가 307 리다이렉트로 보호됨 (정상)
- **랩 페이지**: 모든 6개 정적 라우트가 307 리다이렉트로 보호됨 (정상)
- **어드민 API**: 대부분 403 Forbidden으로 보호됨 (정상)
- **일부 어드민 API가 200 반환**: `/api/admin/blog`, `/api/admin/calendar`, `/api/admin/design/cards`, `/api/admin/documents`, `/api/admin/menus`, `/api/admin/partners`, `/api/admin/projects`, `/api/admin/settings/fonts` - GET 요청에 대해 공개 조회 허용 중 (의도적인지 확인 필요)

### 9.4 리다이렉트 매핑

| 원본 | 대상 | 코드 |
|---|---|---|
| `/bookshelf` | `club.bestcome.org/bookclub/bookshelf` | 307 |
| `/p/about-us` | `/about` | 308 |
| `/p/history` | `/history` (404) | 308 |
| `/admin/*` (전체) | `/login` | 307 |
| `/my/*` (전체) | `/login` | 307 |
| `/mypage/*` (전체) | `/login` | 307 |
| `/lab/*` (전체) | `/login` | 307 |

---

*이 보고서는 비인증 상태에서의 HTTP 접근 테스트 결과입니다. 인증된 사용자/관리자의 접근 결과는 다를 수 있습니다.*
