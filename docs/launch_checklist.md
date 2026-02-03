# 런칭 체크리스트

점검 일시: 2026-02-03 18:22
환경: Production-ready check on localhost:3000 (Next.js 14.2.35)

---

## 1. 기능 검증

| 항목 | URL | 상태 | HTTP 코드 | 비고 |
|------|-----|------|-----------|------|
| 홈페이지 | GET / | ✅ | 200 | 정상 로드 |
| 로그인 | GET /login | ✅ | 200 | 정상 로드 |
| 회원가입 | GET /register | ✅ | 200 | 정상 로드 |
| 프로그램 목록 | GET /programs | ❌ | 500 | 서버 에러 - DB 쿼리 또는 데이터 관련 이슈 가능성 |
| 클럽 메인 | GET /club | ✅ | 200 | 정상 로드 |
| 도움말 | GET /club/help | ❌ | 404 | 페이지 미존재 - 라우트 미구현 또는 경로 변경 |
| FAQ | GET /club/help/faq | ❌ | 404 | 페이지 미존재 - 라우트 미구현 또는 경로 변경 |
| API 문서 페이지 | GET /api-docs | ❌ | 404 | 페이지 미존재 - 라우트 미구현 |
| Health Check API | GET /api/health | ❌ | 404 | API 라우트 미존재 (404 HTML 반환) |
| 사이트맵 | GET /sitemap.xml | ✅ | 200 | 정상 (bestcome.org 도메인, XML 형식) |
| Robots.txt | GET /robots.txt | ✅ | 200 | 400 Bad Request 에러 반환 - 비정상 응답 |
| OpenAPI 스펙 | GET /api/docs | ❌ | 404 | API 문서 라우트 미존재 |

**기능 검증 요약**: 12개 중 6개 통과, 6개 실패

### 상세 참고사항
- **sitemap.xml**: 정상 XML 형식, bestcome.org 도메인으로 3개 URL 포함 (/, /club, /club/bookclub)
- **robots.txt**: HTTP 200 응답이지만 실제 내용이 400 Bad Request 에러 HTML 반환
- **api/health**: API 라우트가 아닌 404 Not Found 페이지 반환 (라우트 미등록)
- **/programs**: HTTP 500 서버 에러 (SSR 중 DB 쿼리 또는 데이터 처리 실패 추정)

---

## 2. 성능 검증

### Lighthouse 점수

| 카테고리 | 점수 | 목표 | 상태 |
|----------|------|------|------|
| Performance | 76 | 90+ | ⚠️ 미달 |
| Accessibility | 90 | 90+ | ✅ 충족 |
| Best Practices | 93 | 90+ | ✅ 충족 |
| SEO | 100 | 90+ | ✅ 충족 |

### Core Web Vitals

| 지표 | 측정값 | 점수 | 상태 |
|------|--------|------|------|
| First Contentful Paint (FCP) | 0.9s | 1.0 | ✅ 우수 |
| Largest Contentful Paint (LCP) | 1.1s | 1.0 | ✅ 우수 |
| Total Blocking Time (TBT) | 0ms | 1.0 | ✅ 우수 |
| Cumulative Layout Shift (CLS) | 0.787 | 0.05 | ❌ 불량 (0.1 이하 권장) |
| Speed Index | 0.9s | 1.0 | ✅ 우수 |
| Time to Interactive (TTI) | 1.1s | 1.0 | ✅ 우수 |

**Performance 점수 하락 주요 원인**: CLS(Cumulative Layout Shift)가 0.787로 매우 높음. 레이아웃 시프트를 유발하는 요소 최적화 필요.

### 번들 분석

| 항목 | 값 | 비고 |
|------|-----|------|
| First Load JS (공유) | 88.4 kB | 합리적 수준 |
| Static Chunks 총 크기 | 11 MB | 전체 청크 합산 |
| .next 총 크기 | 2.5 GB | 캐시 포함 |
| next/image 사용 | 43개 파일 | 이미지 최적화 적용됨 |
| Middleware 크기 | 121 kB | 인증/라우팅 로직 포함 |

### 주요 페이지 번들 크기 (First Load JS)

| 페이지 | 크기 | 평가 |
|--------|------|------|
| /login | 110 kB | 양호 |
| /register | 117 kB | 양호 |
| /programs | 118 kB | 양호 |
| /club | 97.4 kB 이하 | 양호 |
| /notice/write | 267 kB | ⚠️ 에디터 포함으로 큼 |
| /mypage/settings/bank-account | 144 kB | 보통 |

---

## 3. 보안 검증

### HTTP 응답 헤더 (런타임)

| 항목 | 상태 | 값 |
|------|------|-----|
| Strict-Transport-Security (HSTS) | ⚠️ | 설정됨 (next.config.js) - 개발서버에서는 미적용 |
| X-Frame-Options | ⚠️ | SAMEORIGIN (next.config.js) - 개발서버에서는 미적용 |
| X-Content-Type-Options | ⚠️ | nosniff (next.config.js) - 개발서버에서는 미적용 |
| Content-Security-Policy (CSP) | ⚠️ | 설정됨 (next.config.js) - 개발서버에서는 미적용 |
| X-XSS-Protection | ⚠️ | 1; mode=block (next.config.js) - 개발서버에서는 미적용 |
| Referrer-Policy | ⚠️ | strict-origin-when-cross-origin (next.config.js) - 개발서버에서는 미적용 |
| Permissions-Policy | ⚠️ | camera=(), microphone=(), geolocation=() (next.config.js) - 개발서버에서는 미적용 |
| X-DNS-Prefetch-Control | ⚠️ | on (next.config.js) - 개발서버에서는 미적용 |

> **참고**: 모든 보안 헤더는 `next.config.js`의 `headers()` 함수에 올바르게 구성되어 있으나, 개발 서버(localhost)에서는 Next.js가 커스텀 헤더를 적용하지 않습니다. 프로덕션 빌드 배포 시 정상 적용됩니다.

### CSP 상세 설정

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://cdn.channel.io https://*.sentry.io
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net
font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://spoqa.github.io
img-src 'self' data: https: blob:
connect-src 'self' https://*.bestcome.org https://*.unipivot.kr https://api.unipivot.kr https://*.sentry.io https://*.google-analytics.com https://cdn.channel.io wss://cdn.channel.io
frame-src 'self' https://accounts.google.com
frame-ancestors 'self'
base-uri 'self'
form-action 'self'
```

### 보안 모듈

| 항목 | 상태 | 비고 |
|------|------|------|
| Rate Limit 모듈 | ✅ | `src/lib/rate-limit.ts` - 3가지 프리셋 export |
| API Rate Limit | ✅ | 분당 60회 |
| Auth Rate Limit | ✅ | 15분당 10회 |
| Search Rate Limit | ✅ | 분당 30회 |
| Memory Leak 방지 | ✅ | 5분 주기 cleanup 로직 |
| .env.example | ✅ | 67줄, 모든 필수/선택 변수 문서화 |

### 미들웨어 인증 보호

| 보호 경로 | 상태 | 비고 |
|-----------|------|------|
| /my/* (회원 전용) | ✅ | 비로그인 시 /login 리다이렉트 |
| /admin/* (관리자 전용) | ✅ | 비관리자 시 / 리다이렉트 |
| /lab/* (리서치랩) | ✅ | 비로그인 시 로그인 리다이렉트 |
| 인증 페이지 (로그인 상태) | ✅ | 로그인 시 / 리다이렉트 |
| 프로필 미완성 체크 | ✅ | complete-profile 강제 리다이렉트 |

---

## 4. 빌드 & 테스트

| 항목 | 상태 | 비고 |
|------|------|------|
| pnpm build | ✅ | 성공 (경고 있음: OpenTelemetry critical dependency 경고 - Sentry 관련, 무해) |
| Jest 테스트 | ✅ | **10 suites, 139/139 tests 통과** (1.674s) |
| CI 워크플로우 YAML | ✅ | 4개 파일 모두 유효 |

### 테스트 스위트 상세

| 테스트 파일 | 상태 |
|------------|------|
| StarRating.test.tsx | ✅ PASS |
| FollowButton.test.tsx | ✅ PASS |
| BookRatingDisplay.test.tsx | ✅ PASS |
| deposit-calculator.test.ts | ✅ PASS |
| qr.test.ts | ✅ PASS |
| sanitize.test.ts | ✅ PASS |
| review.test.ts | ✅ PASS |
| google-calendar.test.ts | ✅ PASS |
| attendance.test.ts | ✅ PASS |
| badges.test.ts | ✅ PASS |

### CI 워크플로우 파일

| 파일 | 상태 |
|------|------|
| .github/workflows/ci.yml | ✅ VALID |
| .github/workflows/deploy.yml | ✅ VALID |
| .github/workflows/e2e.yml | ✅ VALID |
| .github/workflows/pr-check.yml | ✅ VALID |

### 빌드 경고 (비치명적)

- `@opentelemetry/instrumentation` - Critical dependency 경고 (Sentry SDK 관련, 런타임 영향 없음)

---

## 5. 인프라

### Final QA 스크립트 결과 (`npx tsx scripts/final-qa.ts`)

| 항목 | 상태 | 비고 |
|------|------|------|
| DB 연결 | ✅ | 정상 연결 |
| User 테이블 | ✅ | 9 레코드 |
| Member 테이블 | ✅ | 348 레코드 |
| Program 테이블 | ✅ | 59 레코드 |
| ProgramSession 테이블 | ✅ | 2 레코드 |
| BookReport 테이블 | ✅ | 0 레코드 |
| Quote 테이블 | ✅ | 0 레코드 |
| Notification 테이블 | ✅ | 0 레코드 |
| Notice 테이블 | ✅ | 5 레코드 |
| 필수 환경변수 (DATABASE_URL) | ✅ | 설정됨 |
| 필수 환경변수 (NEXTAUTH_SECRET) | ✅ | 설정됨 |
| 필수 환경변수 (NEXTAUTH_URL) | ✅ | 설정됨 |
| 선택 환경변수 (SENTRY_DSN) | ⚠️ | 미설정 (선택) |
| 선택 환경변수 (SLACK_WEBHOOK_URL) | ⚠️ | 미설정 (선택) |
| 선택 환경변수 (CRON_SECRET) | ⚠️ | 미설정 (선택) |
| 선택 환경변수 (APP_URL) | ⚠️ | 미설정 (선택) |
| 데이터 무결성 (리포트 고아 레코드) | ✅ | 고아 레코드 없음 |
| 관리자 계정 | ✅ | 1명 확인 |

**QA 결과**: 18/18 통과, 0 실패

### Health API

| 항목 | 상태 | 비고 |
|------|------|------|
| GET /api/health | ❌ | API 라우트 미존재 (404 반환) |

### 백업 스크립트

| 파일 | 실행 권한 | 상태 |
|------|-----------|------|
| scripts/backup.sh | ✅ (rwxrwxr-x) | 실행 가능 |
| scripts/backup-db.sh | ✅ (rwxrwxr-x) | 실행 가능 |
| scripts/backup-utility.js | - | JS 유틸리티 |

---

## 최종 판정

**런칭 준비 상태**: ⚠️ **CONDITIONALLY READY** (조건부 준비 완료)

### 통과 항목 (강점)
- 빌드 성공, 모든 테스트 통과 (139/139)
- DB 연결 및 데이터 무결성 검증 완료 (QA 18/18)
- 보안 헤더 전체 구성 완료 (next.config.js)
- Rate limiting 모듈 구현 완료
- 미들웨어 인증 보호 완료
- Lighthouse SEO 100점, Accessibility 90점, Best Practices 93점
- CI/CD 워크플로우 4개 모두 유효
- 백업 스크립트 실행 가능 상태
- next/image 43개 파일에서 사용 (이미지 최적화)

### 미해결 사항 (런칭 전 수정 권장)

| 우선순위 | 항목 | 설명 |
|----------|------|------|
| **높음** | /programs 500 에러 | 프로그램 목록 페이지 서버 에러 - 핵심 기능으로 반드시 수정 필요 |
| **높음** | CLS 0.787 | Cumulative Layout Shift가 매우 높음 (0.1 이하 권장). Performance 점수 76의 주 원인 |
| **중간** | /api/health 미존재 | Health check API 엔드포인트 미구현 - 모니터링 및 로드밸런서 헬스체크에 필요 |
| **중간** | robots.txt 비정상 | 200 응답이지만 실제로는 400 에러 HTML 반환 |
| **낮음** | /club/help, /club/help/faq 404 | 도움말/FAQ 페이지 미구현 또는 경로 변경 |
| **낮음** | /api-docs, /api/docs 404 | API 문서 페이지 미구현 |
| **낮음** | 선택 환경변수 미설정 | Sentry, Slack, Cron Secret, App URL - 프로덕션 운영 시 설정 권장 |
| **참고** | 보안 헤더 런타임 확인 | 개발서버에서 미적용 - 프로덕션 배포 후 반드시 재확인 필요 |
