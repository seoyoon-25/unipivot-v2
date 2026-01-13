# UniPivot v2.0 작업 로그 - 2026-01-11

## 1. 사이트 도메인 변경
- **이전**: `https://bestcome.org/unipivot` (basePath 사용)
- **이후**: `https://bestcome.org` (루트 도메인)

### 변경 파일
- `next.config.js`: `basePath: '/unipivot'` 제거, `output: 'standalone'` 제거
- `.env`: NEXTAUTH_URL, NEXT_PUBLIC_SITE_URL 업데이트
- `.env.production`: NEXTAUTH_URL, NEXT_PUBLIC_APP_URL 업데이트
- `ecosystem.config.js`: NEXTAUTH_URL, NEXTAUTH_SECRET 추가
- `/etc/nginx/sites-available/bestcome`: 루트 `/` → localhost:3001 프록시

---

## 2. PostgreSQL 마이그레이션
- **이전**: SQLite (`prisma/data/unipivot.db`)
- **이후**: PostgreSQL (`postgresql://unipivot:unipivot2024@localhost:5432/unipivot`)

### 마이그레이션된 데이터
| 테이블 | 레코드 수 |
|--------|----------|
| Users | 8 |
| Programs | 5 |
| Books | 5 |
| Registrations | 18 |
| BookReports | 5 |
| Donations | 7 |
| PointHistory | 20 |
| Notices | 5 |
| ActivityLogs | 17 |

### 변경 파일
- `prisma/schema.prisma`: provider를 `postgresql`로 변경
- `scripts/migrate-data.mjs`: 마이그레이션 스크립트 생성

---

## 3. OAuth 설정 (카카오 로그인)
- Kakao Client ID: `03ec8944c28d72314dbf5eb219ef5d2e`
- Kakao Client Secret: 설정 완료
- Google Client ID: `1065102648836-m8pjdgk1o2ij137fd20tgpsog4uj1a9r.apps.googleusercontent.com`
- Google Client Secret: 미설정 (도메인 변경 후 재설정 필요)

### 카카오 개발자 설정 필요
- Redirect URI: `https://bestcome.org/api/auth/callback/kakao`
- 허용 IP: `116.34.76.78`

---

## 4. UI/UX 오류 수정

### 수정된 오류
1. **metadataBase 미설정**
   - `src/app/layout.tsx`: `metadataBase: new URL('https://bestcome.org')` 추가

2. **og:url 이전 도메인 참조**
   - `src/app/layout.tsx`: `url: 'https://unipivot.org'` → `url: 'https://bestcome.org'`

3. **NEXTAUTH_SECRET 미설정**
   - 새 시크릿 생성: `KASx4b+dafakuXKMenf3IdpT6c0vXCd0KPxtsM5/YFw=`

4. **standalone 모드 충돌**
   - `next.config.js`: `output: 'standalone'` 제거

---

## 5. 관리자 계정 정보
- **URL**: https://bestcome.org/admin
- **이메일**: unipivot@unipivot.org
- **비밀번호**: admin1234

---

## 6. 환경 설정 요약

### .env
```
DATABASE_URL="postgresql://unipivot:unipivot2024@localhost:5432/unipivot?schema=public"
NEXTAUTH_URL="https://bestcome.org"
NEXTAUTH_SECRET="KASx4b+dafakuXKMenf3IdpT6c0vXCd0KPxtsM5/YFw="
KAKAO_CLIENT_ID="03ec8944c28d72314dbf5eb219ef5d2e"
KAKAO_CLIENT_SECRET="03ec8944c28d72314dbf5eb219ef5d2e"
```

### PM2 프로세스
- 이름: `unipivot-v2`
- 포트: 3001
- 명령어: `npx next start -p 3001`

### nginx 설정
- `https://bestcome.org/` → `localhost:3001`

---

## 7. 확인된 정상 작동 페이지
- `/` (홈페이지)
- `/login` (로그인)
- `/register` (회원가입)
- `/notice` (공지사항)
- `/bookclub` (독서모임)
- `/about` (소개)
- `/donate` (후원)
- `/admin` (관리자 - 로그인 필요)

---

## 8. 추후 작업 필요 사항
1. Google OAuth Client Secret 설정
2. 도메인 변경 시 카카오/구글 OAuth Redirect URI 업데이트
3. 이메일 발송 시스템 (SMTP) 설정
4. 결제 시스템 연동 (토스페이먼츠)
