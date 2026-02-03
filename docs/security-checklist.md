# 보안 감사 체크리스트

## 인증 및 인가
- [x] 비밀번호 해싱 (bcrypt via NextAuth)
- [x] JWT 세션 토큰 보안 (NEXTAUTH_SECRET)
- [x] 세션 만료 설정
- [x] 권한 체크 미들웨어 (getCurrentUser + role check)
- [x] 관리자 페이지 접근 제어

## 입력 검증
- [x] XSS 방지 (DOMPurify sanitization)
- [x] SQL Injection 방지 (Prisma ORM parameterized queries)
- [x] CSRF 보호 (NextAuth CSRF token)
- [x] 파일 업로드 검증 (타입, 크기 제한)
- [x] Server Actions 입력 검증

## API 보안
- [x] Rate Limiting (IP 기반, 경로별 설정)
- [x] CORS 설정 (Next.js 기본)
- [x] API 인증 필수 (JWT / CRON_SECRET)
- [x] 에러 메시지 최소화 (프로덕션 상세 정보 미노출)
- [x] Cron 엔드포인트 인증 (Bearer token / Vercel header)

## 보안 헤더
- [x] HSTS (Strict-Transport-Security)
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: SAMEORIGIN
- [x] X-XSS-Protection
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Content-Security-Policy (CSP)
- [x] Permissions-Policy

## 데이터 보안
- [x] HTTPS 강제 (HSTS preload)
- [x] 환경 변수로 민감 정보 관리
- [x] .env.example에 시크릿 미포함
- [x] 데이터베이스 백업 (pg_dump, 일일 자동)

## 모니터링
- [x] Sentry 에러 추적
- [x] 전역 에러 핸들러 (global-error.tsx)
- [x] ErrorBoundary 컴포넌트
- [x] 헬스체크 API (/api/health)
- [x] Slack 알림 연동

## 인프라 보안
- [x] 환경 변수 관리 (.env, Vercel secrets)
- [x] GitHub Actions 시크릿 관리
- [x] 의존성 보안 감사 (pnpm audit)
- [x] PM2 프로세스 매니저

## 점검 주기
- 매주: 의존성 보안 업데이트 확인
- 매월: 환경 변수 및 접근 권한 검토
- 분기: 전체 보안 감사 실시
