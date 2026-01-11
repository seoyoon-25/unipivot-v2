# UniPivot v2.0

청년 남북교류 커뮤니티 플랫폼

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)

## 소개

UniPivot은 남북 청년 교류와 통일 문화 확산을 위한 커뮤니티 플랫폼입니다. 독서모임, 세미나, 현장탐방 등 다양한 프로그램을 통해 청년들이 한반도의 평화와 통일에 대해 함께 배우고 소통할 수 있는 공간을 제공합니다.

## 주요 기능

### 프로그램 관리
- **독서모임 (남Book북한걸음)**: 통일/북한 관련 도서를 함께 읽고 토론
- **세미나**: 전문가 초청 강연 및 토론회
- **K-Move**: DMZ, 통일전망대 등 역사적 장소 현장 탐방
- **워크숍**: 청년 통일 역량 강화 프로그램

### 회원 기능
- 프로그램 신청 및 참가 이력 관리
- 독서 기록 작성 및 공유
- 포인트 적립 및 사용
- 후원 참여

### 관리자 기능
- 회원 관리 (목록, 상세, 승인)
- 프로그램 관리 (생성, 수정, 신청 승인/거절)
- 후원 관리
- 공지사항 관리
- 활동 로그 및 통계

## 기술 스택

| 분류 | 기술 |
|-----|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | SQLite (개발) / PostgreSQL (프로덕션) |
| ORM | Prisma |
| Authentication | NextAuth.js |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Process Manager | PM2 |
| Web Server | Nginx |

## 시작하기

### 요구사항

- Node.js 18.x 이상
- npm 9.x 이상

### 설치

```bash
# 저장소 클론
git clone https://github.com/unipivot/unihome-v2.git
cd unihome-v2

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 데이터베이스 설정
npx prisma generate
npx prisma db push

# 샘플 데이터 생성 (선택)
npx tsx scripts/seed-sample-data.ts
npx tsx scripts/seed-books.ts
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
unihome-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 페이지 (로그인, 회원가입)
│   │   ├── (member)/          # 회원 전용 페이지 (마이페이지)
│   │   ├── (public)/          # 공개 페이지
│   │   ├── admin/             # 관리자 페이지
│   │   └── api/               # API 라우트
│   ├── components/
│   │   ├── public/            # 공개 페이지 컴포넌트
│   │   └── ui/                # 공통 UI 컴포넌트
│   └── lib/
│       ├── actions/           # Server Actions
│       ├── auth.ts            # NextAuth 설정
│       └── db.ts              # Prisma 클라이언트
├── prisma/
│   └── schema.prisma          # 데이터베이스 스키마
├── deploy/                    # 배포 스크립트
├── scripts/                   # 유틸리티 스크립트
└── public/                    # 정적 파일
```

## 환경 변수

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## 테스트 계정

| 구분 | 이메일 | 비밀번호 |
|-----|--------|----------|
| 관리자 | admin@unipivot.org | admin123! |
| 회원 | chulsu@example.com | password123 |

## 배포

자세한 배포 방법은 [DEPLOY.md](./DEPLOY.md)를 참조하세요.

### 빠른 배포

```bash
# 배포 스크립트 실행
./deploy/deploy.sh

# PM2로 실행
pm2 start ecosystem.config.js --env production
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |

### 유틸리티 스크립트

```bash
# 샘플 데이터 생성
npx tsx scripts/seed-sample-data.ts

# 도서 데이터 생성
npx tsx scripts/seed-books.ts

# 통합 테스트
npx tsx scripts/test-integration.ts

# 보안 점검
./deploy/security-check.sh

# 백업
./deploy/backup.sh
```

## 데이터베이스 스키마

### 주요 모델

- **User**: 사용자 (회원/관리자)
- **Program**: 프로그램 (독서모임, 세미나, K-Move 등)
- **Registration**: 프로그램 신청
- **Book**: 도서
- **BookReport**: 독서 기록
- **Donation**: 후원
- **PointHistory**: 포인트 내역
- **Notice**: 공지사항
- **ActivityLog**: 활동 로그

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/[...nextauth]` - NextAuth 인증

### Server Actions
주요 기능은 Server Actions으로 구현되어 있습니다:
- `src/lib/actions/public.ts` - 공개/회원 기능
- `src/lib/actions/admin.ts` - 관리자 기능

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 기여

버그 리포트, 기능 제안, PR을 환영합니다.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 연락처

- Email: admin@unipivot.org
- Website: https://unipivot.org
- GitHub: https://github.com/unipivot/unihome-v2

---

Made with ❤️ by UniPivot Team
