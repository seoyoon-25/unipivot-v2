# Changelog

## [2.0.0] - 2026-02-03

### Initial Release - UniClub Platform

#### Core Features
- **회원 관리**: 가입, 로그인 (Email/OAuth), 프로필 관리
- **프로그램 관리**: 생성, 참가 신청, 세션 관리
- **출석 관리**: QR 체크인, 수동 출석, 출석 통계
- **독서 기록**: 독후감 작성/조회, 구조화된 독후감 템플릿
- **명문장**: 명문장 등록/조회, 좋아요
- **커뮤니티**: 자유 게시판, 댓글, 좋아요
- **알림 시스템**: 앱 내 알림, 알림 설정
- **검색**: 통합 검색 (프로그램, 공지, 독후감, 명문장)
- **독서 목표**: 연간/월간 독서 목표, 달성 배지
- **소셜 기능**: 팔로우, 활동 피드
- **AI 기능**: 독후감 피드백 (Gemini)

#### Admin Features
- **관리자 대시보드**: 통계, 최근 활동
- **분석 대시보드**: 사용자/콘텐츠/참여도 분석
- **프로그램 관리**: CRUD, 세션 관리, 참가자 관리
- **회원 관리**: 역할 관리, 활동 조회
- **출석 관리**: 수동 체크, 통계 조회
- **공지사항 관리**: 작성, 수정, 삭제
- **모니터링**: 시스템 상태, 메트릭, Slack 알림
- **데이터 내보내기**: CSV/Excel 지원

#### Documentation & Quality
- **API 문서**: OpenAPI/Swagger UI
- **사용자 가이드**: 도움말 페이지, FAQ
- **테스트**: Jest 단위 테스트 (139건), Playwright E2E
- **SEO**: 동적 sitemap, robots.txt, JSON-LD, Open Graph

#### Infrastructure
- **에러 추적**: Sentry (클라이언트/서버/엣지)
- **CI/CD**: GitHub Actions (lint, typecheck, test, build, deploy)
- **백업**: pg_dump 기반 자동 백업 (일일)
- **보안**: CSP, HSTS, Rate Limiting, XSS 방지

#### Technical Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM + PostgreSQL
- NextAuth.js
- Tailwind CSS
- Sentry
- PM2
