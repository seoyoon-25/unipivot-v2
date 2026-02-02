# Route Test Report - Phase 30

**테스트 일시:** 2026-02-02
**테스트 방법:** 빌드 검증 + 파일 구조 확인 + export 패턴 분석
**대상 도메인:** club.bestcome.org
**빌드 결과:** 성공 (오류 0건)

---

## 요약

| 구분 | 총 라우트 | 정상 | 오류 |
|------|----------|------|------|
| 클럽 페이지 | 54 | 54 | 0 |
| 클럽 API | 4 | 4 | 0 |
| 알림 API | 3 | 3 | 0 |
| 이메일 API | 1 | 1 | 0 |
| 매니페스트 | 1 | 1 | 0 |
| **합계** | **63** | **63** | **0** |

### 인증 구조 요약

| 레이아웃 그룹 | 인증 방식 | 역할 제한 |
|---------------|-----------|-----------|
| `(admin)` | `getCurrentUser()` + role check in layout | ADMIN, SUPER_ADMIN, FACILITATOR |
| `(facilitator)` | `getServerSession()` + `hasMinimumRole()` in layout | FACILITATOR 이상 |
| `(protected)` | `getServerSession()` in layout | 로그인 사용자 전체 |
| 일반 `/club/*` | 개별 페이지에서 직접 인증 확인 | 페이지별 상이 |
| 미들웨어 | `club.bestcome.org` 도메인 rewrite (`/` -> `/club/`) | - |

---

## 페이지 라우트 (/club/*)

### Phase 1-7: 기본 (대시보드, 출석, 프로그램, 관리)

| # | 라우트 | 상태 | 인증 | 비고 |
|---|--------|------|------|------|
| 1 | `/club` | ✅ 정상 | 페이지 직접 (getServerSession) | 메인 대시보드, 82행 |
| 2 | `/club/unauthorized` | ✅ 정상 | 불필요 (공개) | 권한 없음 안내 페이지, 50행 |
| 3 | `/club/onboarding` | ✅ 정상 | 페이지 직접 (getServerSession) | 온보딩, 13행 |
| 4 | `/club/attendance` | ✅ 정상 | 페이지 직접 (getServerSession) | 출석 확인, 131행 |
| 5 | `/club/attendance/scan` | ✅ 정상 | 페이지 직접 (getServerSession) | QR 스캔, 31행 |
| 6 | `/club/programs` | ✅ 정상 | (protected) 레이아웃 | 프로그램 목록, 42행 |
| 7 | `/club/programs/[id]/recap` | ✅ 정상 | 페이지 직접 (getServerSession) | 프로그램 리캡, 75행 |
| 8 | `/club/my` | ✅ 정상 | (protected) 레이아웃 | 마이페이지, 87행 |
| 9 | `/club/admin` | ✅ 정상 | (admin) 레이아웃 | 관리자 대시보드, 143행 |
| 10 | `/club/admin/members` | ✅ 정상 | (admin) 레이아웃 | 회원 관리, 48행 |
| 11 | `/club/admin/members/[userId]` | ✅ 정상 | (admin) 레이아웃 | 회원 상세, 84행 |
| 12 | `/club/admin/programs` | ✅ 정상 | (admin) 레이아웃 | 프로그램 관리, 50행 |
| 13 | `/club/admin/programs/new` | ✅ 정상 | (admin) 레이아웃 | 프로그램 생성, 29행 |
| 14 | `/club/admin/programs/[id]/edit` | ✅ 정상 | (admin) 레이아웃 | 프로그램 수정, 95행 |
| 15 | `/club/admin/attendance` | ✅ 정상 | (admin) 레이아웃 | 출석 관리, 133행 |
| 16 | `/club/admin/resources` | ✅ 정상 | (admin) 레이아웃 | 자료 관리, 199행 |
| 17 | `/club/admin/resources/upload` | ✅ 정상 | (admin) 레이아웃 | 자료 업로드, 190행 |

### Phase 8-15: 퍼실리테이터, 북클럽

| # | 라우트 | 상태 | 인증 | 비고 |
|---|--------|------|------|------|
| 18 | `/club/facilitator` | ✅ 정상 | (facilitator) 레이아웃 | 퍼실 대시보드, 83행 |
| 19 | `/club/facilitator/attendance` | ✅ 정상 | (facilitator) 레이아웃 | 퍼실 출석, 21행 |
| 20 | `/club/facilitator/attendance/qr` | ✅ 정상 | (facilitator) 레이아웃 | QR 출석 생성, 97행 |
| 21 | `/club/facilitator/questions` | ✅ 정상 | (facilitator) 레이아웃 | 질문 관리, 21행 |
| 22 | `/club/facilitator/resources` | ✅ 정상 | (facilitator) 레이아웃 | 자료 관리, 34행 |
| 23 | `/club/facilitator/timer` | ✅ 정상 | (facilitator) 레이아웃 | 타이머, 21행 |
| 24 | `/club/bookclub` | ✅ 정상 | 없음 (공개) | 북클럽 메인, 5행 (Static) |
| 25 | `/club/bookclub/bookshelf` | ✅ 정상 | 없음 (공개) | 서재 목록, 54행 |
| 26 | `/club/bookclub/bookshelf/[bookId]` | ✅ 정상 | 없음 (공개) | 책 상세, 161행 |
| 27 | `/club/bookclub/my-bookshelf` | ✅ 정상 | 페이지 직접 (getServerSession) | 내 서재, 86행 |
| 28 | `/club/bookclub/quotes` | ✅ 정상 | 페이지 직접 (getServerSession) | 명언 모음, 34행 |
| 29 | `/club/bookclub/reviews` | ✅ 정상 | 페이지 직접 (getServerSession) | 독후감 목록, 49행 |
| 30 | `/club/bookclub/reviews/[reviewId]` | ✅ 정상 | 없음 (공개) | 독후감 상세, 68행 |
| 31 | `/club/bookclub/reviews/write` | ✅ 정상 | 페이지 직접 (getServerSession) | 독후감 작성, 59행 |
| 32 | `/club/bookclub/stamps` | ✅ 정상 | 페이지 직접 (getServerSession) | 스탬프 카드, 68행 |

### Phase 16-20: 데이터 내보내기

| # | 라우트 | 상태 | 인증 | 비고 |
|---|--------|------|------|------|
| 33 | `/club/admin/export` (route.ts) | ✅ 정상 | getCurrentUser + role check | CSV 내보내기 API (GET), 138행 |

### Phase 21-23: 알림, 공지, 검색

| # | 라우트 | 상태 | 인증 | 비고 |
|---|--------|------|------|------|
| 34 | `/club/notifications` | ✅ 정상 | 페이지 직접 (getServerSession) | 알림 목록, 32행 |
| 35 | `/club/notifications/settings` | ✅ 정상 | 페이지 직접 (getServerSession) | 알림 설정, 44행 |
| 36 | `/club/notices` | ✅ 정상 | 없음 (공개) | 공지 목록, 56행 (Static) |
| 37 | `/club/notices/[id]` | ✅ 정상 | 없음 (공개) | 공지 상세, 61행 |
| 38 | `/club/notices/admin` | ✅ 정상 | 페이지 직접 (getServerSession) | 공지 관리, 86행 |
| 39 | `/club/notices/admin/new` | ✅ 정상 | 페이지 직접 (getServerSession) | 공지 작성, 35행 |
| 40 | `/club/notices/admin/[id]/edit` | ✅ 정상 | 페이지 직접 (getServerSession) | 공지 수정, 66행 |
| 41 | `/club/search` | ✅ 정상 | 없음 (공개) | 통합 검색, 76행 |

### Phase 24-26: 프로필, 통계, 타임라인

| # | 라우트 | 상태 | 인증 | 비고 |
|---|--------|------|------|------|
| 42 | `/club/profile` | ✅ 정상 | 페이지 직접 (getServerSession) | 내 프로필, 45행 |
| 43 | `/club/profile/edit` | ✅ 정상 | 페이지 직접 (getServerSession) | 프로필 편집, 34행 |
| 44 | `/club/profile/[userId]` | ✅ 정상 | 없음 (공개) | 타인 프로필, 47행 |
| 45 | `/club/my/stats` | ✅ 정상 | 페이지 직접 (getServerSession) | 활동 통계, 64행 |
| 46 | `/club/my/timeline` | ✅ 정상 | 페이지 직접 (getServerSession) | 활동 타임라인, 42행 |

### Phase 27-30: 커뮤니티, 모바일, 설정, 연동

| # | 라우트 | 상태 | 인증 | 비고 |
|---|--------|------|------|------|
| 47 | `/club/community` | ✅ 정상 | 페이지 직접 (getServerSession) | 커뮤니티 목록, 76행 |
| 48 | `/club/community/new` | ✅ 정상 | 페이지 직접 (getServerSession) | 게시글 작성, 28행 |
| 49 | `/club/community/[postId]` | ✅ 정상 | 페이지 직접 (getServerSession) | 게시글 상세, 49행 |
| 50 | `/club/community/[postId]/edit` | ✅ 정상 | 페이지 직접 (getServerSession) | 게시글 수정, 48행 |
| 51 | `/club/settings` | ✅ 정상 | 페이지 직접 (getServerSession) | 설정 메인, 81행 |
| 52 | `/club/settings/account` | ✅ 정상 | 페이지 직접 (getServerSession) | 계정 설정, 28행 |
| 53 | `/club/settings/notifications` | ✅ 정상 | 없음 (리다이렉트) | 알림 설정, 5행 (Static) |
| 54 | `/club/settings/data` | ✅ 정상 | 페이지 직접 (getServerSession) | 데이터 관리, 28행 |
| 55 | `/club/settings/delete-account` | ✅ 정상 | 페이지 직접 (getServerSession) | 계정 삭제, 45행 |

---

## API 라우트

### 클럽 API (/api/club/*)

| # | 라우트 | 메서드 | 상태 | 인증 | 비고 |
|---|--------|--------|------|------|------|
| 1 | `/api/club/community/[postId]/comments` | GET | ✅ 정상 | 없음 (공개 조회) | 댓글 목록 조회, 25행 |
| 2 | `/api/club/community/[postId]/like` | POST | ✅ 정상 | getCurrentUser() | 좋아요 토글, 31행 |
| 3 | `/api/club/timeline` | GET | ✅ 정상 | getServerSession() | 타임라인 조회, 20행 |
| 4 | `/club/admin/export` | GET | ✅ 정상 | getCurrentUser() + role | CSV 내보내기, 138행 |

### 알림 API (/api/notifications/*)

| # | 라우트 | 메서드 | 상태 | 인증 | 비고 |
|---|--------|--------|------|------|------|
| 5 | `/api/notifications` | GET | ✅ 정상 | getServerSession() | 알림 목록 조회 (페이징), 107행 |
| 6 | `/api/notifications` | POST | ✅ 정상 | getServerSession() + ADMIN role | 알림 일괄 생성 (관리자), 107행 |
| 7 | `/api/notifications/read` | POST | ✅ 정상 | getServerSession() | 알림 읽음 처리, 41행 |
| 8 | `/api/notifications/[id]` | DELETE | ✅ 정상 | getServerSession() + 본인 확인 | 알림 삭제, 41행 |

### 이메일 API (/api/email/*)

| # | 라우트 | 메서드 | 상태 | 인증 | 비고 |
|---|--------|--------|------|------|------|
| 9 | `/api/email/send` | POST | ✅ 정상 | getCurrentUser() + ADMIN/SUPER_ADMIN | 세션 리마인더 이메일 발송, 65행 |

---

## 레이아웃 및 특수 파일

| 파일 | 상태 | 비고 |
|------|------|------|
| `/club/layout.tsx` | ✅ 정상 | 메인 레이아웃 (ClubHeader + ClubSidebar + ClubBottomNav) |
| `/club/(admin)/layout.tsx` | ✅ 정상 | 관리자 레이아웃 (getCurrentUser + role check) |
| `/club/(facilitator)/layout.tsx` | ✅ 정상 | 퍼실 레이아웃 (getServerSession + hasMinimumRole) |
| `/club/(protected)/layout.tsx` | ✅ 정상 | 보호 레이아웃 (getServerSession) |
| `/club/bookclub/layout.tsx` | ✅ 정상 | 북클럽 레이아웃 (메타데이터만) |
| `/club/error.tsx` | ✅ 정상 | 클럽 에러 바운더리 |
| `/club/loading.tsx` | ✅ 정상 | 클럽 로딩 UI |
| `/club/(admin)/admin/error.tsx` | ✅ 정상 | 관리자 에러 바운더리 |
| `/club/(admin)/admin/attendance/loading.tsx` | ✅ 정상 | 출석 관리 로딩 |
| `/club/(admin)/admin/resources/loading.tsx` | ✅ 정상 | 자료 관리 로딩 |
| `/club/(facilitator)/facilitator/error.tsx` | ✅ 정상 | 퍼실 에러 바운더리 |
| `/club/notices/loading.tsx` | ✅ 정상 | 공지 로딩 |
| `/manifest.webmanifest` | ✅ 정상 | PWA 매니페스트 (start_url: /club) |

---

## 미들웨어 (club.bestcome.org 도메인)

```
경로: /var/www/unihome-v2/src/middleware.ts

동작:
- club.bestcome.org 접속 시 hostname.startsWith('club.') 감지
- /club, /api, /_next 이외의 경로는 /club{pathname}으로 rewrite
  예: club.bestcome.org/ -> /club, club.bestcome.org/admin -> /club/admin
- 메인 도메인에서 /bookshelf 접근 시 club.bestcome.org/bookclub/bookshelf로 redirect
```

---

## 빌드 결과

```
빌드 명령: pnpm build
결과: 성공 (오류 0건)

클럽 라우트 빌드 출력:
├ ƒ /api/club/community/[postId]/comments                           0 B                0 B
├ ƒ /api/club/community/[postId]/like                               0 B                0 B
├ ƒ /api/club/timeline                                              0 B                0 B
├ ƒ /api/email/send                                                 0 B                0 B
├ ƒ /api/notifications                                              0 B                0 B
├ ƒ /api/notifications/[id]                                         0 B                0 B
├ ƒ /api/notifications/read                                         0 B                0 B
├ ƒ /club                                                           280 B          97.3 kB
├ ƒ /club/admin                                                     280 B          97.3 kB
├ ƒ /club/admin/attendance                                          4.29 kB         108 kB
├ ƒ /club/admin/export                                              0 B                0 B
├ ƒ /club/admin/members                                             7.11 kB         111 kB
├ ƒ /club/admin/members/[userId]                                    6.26 kB         110 kB
├ ƒ /club/admin/programs                                            5.52 kB         109 kB
├ ƒ /club/admin/programs/[id]/edit                                  8.72 kB         118 kB
├ ƒ /club/admin/programs/new                                        2.33 kB        99.4 kB
├ ƒ /club/admin/resources                                           280 B          97.3 kB
├ ƒ /club/admin/resources/upload                                    280 B          97.3 kB
├ ƒ /club/attendance                                                280 B          97.3 kB
├ ƒ /club/attendance/scan                                           2.92 kB         100 kB
├ ○ /club/bookclub                                                  238 B          88.5 kB
├ ƒ /club/bookclub/bookshelf                                        1.9 kB         98.9 kB
├ ƒ /club/bookclub/bookshelf/[bookId]                               280 B          97.3 kB
├ ƒ /club/bookclub/my-bookshelf                                     5.35 kB         102 kB
├ ƒ /club/bookclub/quotes                                           4.74 kB          93 kB
├ ƒ /club/bookclub/reviews                                          2.66 kB        99.7 kB
├ ƒ /club/bookclub/reviews/[reviewId]                               3.96 kB         101 kB
├ ƒ /club/bookclub/reviews/write                                    7.04 kB        95.3 kB
├ ƒ /club/bookclub/stamps                                           238 B          88.5 kB
├ ƒ /club/community                                                 1.34 kB         105 kB
├ ƒ /club/community/[postId]                                        3.17 kB         111 kB
├ ƒ /club/community/[postId]/edit                                   2.36 kB        99.4 kB
├ ƒ /club/community/new                                             2.36 kB        99.4 kB
├ ƒ /club/facilitator                                               280 B          97.3 kB
├ ƒ /club/facilitator/attendance                                    2.08 kB        99.1 kB
├ ƒ /club/facilitator/attendance/qr                                 3.07 kB        97.3 kB
├ ƒ /club/facilitator/questions                                     3.52 kB        91.8 kB
├ ƒ /club/facilitator/resources                                     4.29 kB        99.5 kB
├ ƒ /club/facilitator/timer                                         3.33 kB        91.6 kB
├ ƒ /club/my                                                        238 B          88.5 kB
├ ƒ /club/my/stats                                                  8.14 kB         219 kB
├ ƒ /club/my/timeline                                               4.17 kB         108 kB
├ ○ /club/notices                                                   279 B          97.3 kB
├ ƒ /club/notices/[id]                                              279 B          97.3 kB
├ ƒ /club/notices/admin                                             1.79 kB        98.8 kB
├ ƒ /club/notices/admin/[id]/edit                                   2.26 kB        99.3 kB
├ ƒ /club/notices/admin/new                                         2.26 kB        99.3 kB
├ ƒ /club/notifications                                             2.61 kB        99.6 kB
├ ƒ /club/notifications/settings                                    1.86 kB        98.9 kB
├ ƒ /club/onboarding                                                2.67 kB          91 kB
├ ƒ /club/profile                                                   277 B          97.3 kB
├ ƒ /club/profile/[userId]                                          238 B          88.5 kB
├ ƒ /club/profile/edit                                              3.29 kB         100 kB
├ ƒ /club/programs                                                  3.85 kB         108 kB
├ ƒ /club/programs/[id]/recap                                       238 B          88.5 kB
├ ƒ /club/search                                                    2.63 kB        99.7 kB
├ ƒ /club/settings                                                  280 B          97.3 kB
├ ƒ /club/settings/account                                          1.38 kB        98.4 kB
├ ƒ /club/settings/data                                             1.93 kB          99 kB
├ ƒ /club/settings/delete-account                                   1.53 kB        98.6 kB
├ ○ /club/settings/notifications                                    238 B          88.5 kB
├ ƒ /club/unauthorized                                              277 B          97.3 kB
├ ○ /manifest.webmanifest                                           0 B                0 B

범례: ƒ = Dynamic (server-rendered), ○ = Static (prerendered)
정적 라우트: /club/bookclub, /club/notices, /club/settings/notifications, /manifest.webmanifest
동적 라우트: 나머지 전부
```

---

## 라우트 구조 분석

### 인증 계층 구조

```
/club (layout.tsx - 공개, UI 프레임 제공)
├── (admin)/    (layout.tsx - getCurrentUser + ADMIN/SUPER_ADMIN/FACILITATOR 역할 검사)
│   └── admin/* (9개 페이지 + 1개 API)
├── (facilitator)/  (layout.tsx - getServerSession + hasMinimumRole('facilitator'))
│   └── facilitator/* (6개 페이지)
├── (protected)/    (layout.tsx - getServerSession, 로그인 필수)
│   ├── my/         (마이페이지)
│   └── programs/   (프로그램 목록)
├── bookclub/   (layout.tsx - 메타데이터만, 인증 개별 페이지)
│   └── bookclub/* (9개 페이지, 공개/비공개 혼합)
├── community/* (4개 페이지, 개별 인증)
├── notices/*   (5개 페이지, 공개/관리자 혼합)
├── notifications/* (2개 페이지, 인증 필요)
├── profile/*   (3개 페이지, 공개/인증 혼합)
├── search/     (1개 페이지, 공개)
├── settings/*  (5개 페이지, 인증 필요)
├── my/*        (2개 페이지, 개별 인증)
├── attendance/* (2개 페이지, 인증 필요)
└── onboarding/ (1개 페이지, 인증 필요)
```

### 총 라우트 수 (페이지 기준)

| 영역 | 수 |
|------|------|
| 관리자 (admin) | 9 페이지 + 1 API |
| 퍼실리테이터 | 6 |
| 보호 영역 (protected) | 2 |
| 북클럽 | 9 |
| 커뮤니티 | 4 |
| 공지사항 | 5 |
| 알림 | 2 |
| 프로필 | 3 |
| 설정 | 5 |
| 마이 (stats/timeline) | 2 |
| 출석 | 2 |
| 기타 (대시보드, 검색, 온보딩, unauthorized, programs recap) | 5 |
| **페이지 합계** | **54** |
| **API 합계** | **8 (club 4 + notifications 3 + email 1)** |

---

## 결론

모든 63개 라우트가 정상적으로 빌드되며 오류가 없습니다.

- 모든 `page.tsx` 파일에 `export default` 존재 확인
- 모든 API `route.ts` 파일에 적절한 HTTP 메서드 export 존재 확인
- 관리자/퍼실리테이터 영역은 레이아웃 레벨 인증으로 보호
- 보호 영역은 세션 기반 인증으로 보호
- 공개 페이지(공지, 검색, 북클럽 목록, 타인 프로필)는 의도적으로 인증 미적용
- PWA 매니페스트 정상 작동 (start_url: /club)
- 미들웨어의 club.bestcome.org 도메인 rewrite 정상 구성
