# bestcome.org UI/UX 디자인 분석 보고서

> **분석일**: 2026-02-04
> **대상**: bestcome.org (유니피벗)
> **기술스택**: Next.js 14 + Tailwind CSS + Radix UI + Lucide Icons
> **분석자**: 자동화 코드 분석

---

## 목차

1. [전체 디자인 시스템](#1-전체-디자인-시스템)
2. [레이아웃 분석](#2-레이아웃-분석)
3. [페이지별 분석](#3-페이지별-분석)
4. [UX 분석](#4-ux-분석)
5. [기술적 현황](#5-기술적-현황)
6. [강점/약점 분석](#6-강점약점-분석)
7. [개선 제안 및 우선순위](#7-개선-제안-및-우선순위)

---

## 1. 전체 디자인 시스템

### 1.1 컬러 팔레트

#### 브랜드 컬러 (직접 사용)

| 역할 | 색상 코드 | 사용처 | 파일 |
|------|-----------|--------|------|
| **Primary** | `#FF6B35` | CTA 버튼, 액센트, 링크 호버 | `tailwind.config.ts:14`, `globals.css:151` |
| **Primary Dark** | `#E55A2B` | 버튼 호버, 그라데이션 끝점 | `tailwind.config.ts:15` |
| **Primary Light** | `#FFF4EE` | 배지 배경, 아이콘 컨테이너 | `tailwind.config.ts:16` |

#### CSS 변수 기반 시맨틱 컬러 (`globals.css:79-105`)

| 변수 | Light 모드 (HSL) | 해석값 | 용도 |
|------|-------------------|--------|------|
| `--background` | `0 0% 100%` | `#FFFFFF` | 페이지 배경 |
| `--foreground` | `0 0% 3.9%` | `#0A0A0A` | 기본 텍스트 |
| `--primary` | `0 0% 9%` | `#171717` | shadcn/ui 기본값 |
| `--secondary` | `0 0% 96.1%` | `#F5F5F5` | 보조 배경 |
| `--muted` | `0 0% 96.1%` | `#F5F5F5` | 비활성 배경 |
| `--muted-foreground` | `0 0% 45.1%` | `#737373` | 비활성 텍스트 |
| `--destructive` | `0 84.2% 60.2%` | `#EF4444` | 오류/삭제 |
| `--border` | `0 0% 89.8%` | `#E5E5E5` | 경계선 |
| `--ring` | `0 0% 3.9%` | `#0A0A0A` | 포커스 링 |
| `--radius` | `0.5rem` | `8px` | 기본 border-radius |

#### 차트 컬러 (`globals.css:99-103`)

| 변수 | HSL | 용도 |
|------|-----|------|
| `--chart-1` | `12 76% 61%` | 차트 시리즈 1 (오렌지) |
| `--chart-2` | `173 58% 39%` | 차트 시리즈 2 (틸) |
| `--chart-3` | `197 37% 24%` | 차트 시리즈 3 (네이비) |
| `--chart-4` | `43 74% 66%` | 차트 시리즈 4 (골드) |
| `--chart-5` | `27 87% 67%` | 차트 시리즈 5 (코랄) |

#### 실제 사용 빈도가 높은 Tailwind 컬러 클래스

```
텍스트: text-gray-900, text-gray-600, text-gray-500, text-gray-400, text-white
배경:   bg-white, bg-gray-50, bg-gray-900, bg-gray-800
경계:   border-gray-200, border-gray-100, border-gray-800
하드코딩: text-[#FF6B35], bg-[#FF6B35], hover:bg-[#E55A2B]
```

> **문제**: `--primary` CSS 변수(`0 0% 9%` = 거의 검정)와 실제 사용하는 Primary 색상(`#FF6B35`)이 **완전히 불일치**함. shadcn/ui 기본값이 오버라이드되지 않았음.

---

### 1.2 타이포그래피

#### 폰트 패밀리 (`tailwind.config.ts:57-86`, `globals.css:42-44`)

| 역할 | 폰트 | 파일 |
|------|------|------|
| **기본 (sans)** | Pretendard Variable → Pretendard → Pretendard Fallback → system fonts | `tailwind.config.ts:72-86` |
| **제목 (heading)** | 동일 (CSS 변수 `--font-heading`) | `globals.css:44` |
| **액센트** | `inherit` (미사용) | `globals.css:45` |

#### 폰트 로딩 전략 (`layout.tsx:56-76`)

- CDN: `cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9`
- `<link rel="preload" as="style">` + JS로 비차단 로드
- CLS 방지용 Fallback 폰트 3종 정의 (`globals.css:13-39`)
  - Noto Sans CJK KR (`size-adjust: 100%`)
  - Apple SD Gothic Neo (`size-adjust: 99%`)
  - Malgun Gothic (`size-adjust: 102%`)
- `FontProvider` 컴포넌트가 DB 설정으로 동적 폰트 변경 지원

#### 폰트 크기 스케일 (`globals.css:46-51`)

| 변수 | 값 | 환산 (base 16px) |
|------|-----|------------------|
| `--font-size-base` | `16px` | 16px |
| `--font-size-h4` | `1.25em` | 20px |
| `--font-size-h3` | `1.563em` | 25px |
| `--font-size-h2` | `1.953em` | 31.2px |
| `--font-size-h1` | `2.441em` | 39px |
| `--font-heading-scale` | `1.25` | Major Third |

#### 실제 페이지에서 사용되는 크기 패턴

```
히어로 제목:     text-4xl md:text-5xl lg:text-6xl font-bold
섹션 제목:       text-3xl md:text-4xl font-bold
서브 제목:       text-xl font-bold / text-lg font-semibold
본문:            text-base (16px 암시)
보조 텍스트:     text-sm text-gray-500
아주 작은 텍스트: text-xs
```

---

### 1.3 스페이싱 패턴

#### 섹션 레벨 패딩

| 패턴 | 사용처 |
|------|--------|
| `py-24` | 메인 섹션 (HeroSection, KeyPrograms, Story 등) |
| `py-20` | ResearchLab 섹션 |
| `py-16` | 보조 섹션 (UniClub, DonationBanner) |
| `py-12` | 콘텐츠 영역 (프로그램 목록) |
| `pt-32 pb-16` | 페이지 히어로 (상단 여백 포함) |

#### 컨테이너

```
max-w-7xl mx-auto px-4 lg:px-8    (표준)
max-w-6xl mx-auto px-4             (중형)
max-w-4xl mx-auto px-4             (좁은)
max-w-2xl mx-auto px-4             (매우 좁은)
```

#### 카드/컴포넌트 내부

```
카드:    p-6, p-5, p-4 (비일관)
갭:      gap-4, gap-6, gap-8, gap-12 (비일관)
마진:    mb-4, mb-6, mb-8, mb-12, mb-16
```

---

### 1.4 컴포넌트 스타일

#### 버튼

| 타입 | 클래스 | 파일 |
|------|--------|------|
| **Primary** | `px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg shadow-primary/20` | `globals.css:159-161` |
| **Secondary** | `px-6 py-3 bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl` | `globals.css:163-165` |
| **Orange** | `px-6 py-3 bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-xl font-semibold` + `box-shadow` | `globals.css:168-176` |
| **Ghost** | `px-6 py-3 border border-gray-200 hover:border-primary hover:text-primary text-gray-700 rounded-xl` | 각 컴포넌트 내 |
| **Danger** | `bg-red-500 hover:bg-red-600 text-white` | 관리자 삭제 버튼 |

> **문제**: `btn-primary`와 `btn-orange`가 사실상 같은 역할인데 별도로 존재. 대부분의 실제 코드에서는 유틸리티 클래스를 직접 사용하며, 정의된 컴포넌트 클래스를 사용하지 않음.

#### 카드

```css
/* 전역 정의 - globals.css:178-180 */
.card {
  @apply bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300;
}

/* 실제 사용 패턴 (대부분 인라인) */
bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all
bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300
bg-white rounded-2xl p-6 shadow-sm  /* 관리자 */
```

#### 입력 폼 (`globals.css:351-353`)

```css
input:focus, textarea:focus, select:focus {
  @apply outline-none ring-2 ring-primary/20 border-primary;
}
```

```
인라인 패턴: px-4 py-3 border border-gray-200 rounded-xl
             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
레이블:      block text-sm font-medium text-gray-700 mb-2
```

#### 배지/태그

| 변형 | 클래스 |
|------|--------|
| Primary | `px-3 py-1 bg-primary text-white text-xs font-medium rounded-full` |
| Light | `px-3 py-1 bg-primary-light text-primary text-xs font-semibold rounded` |
| 상태별 | `bg-blue-100 text-blue-700` / `bg-green-100 text-green-700` 등 |
| 프로그램 | `bg-blue-100 text-blue-700` (독서모임), `bg-purple-100 text-purple-700` (세미나) 등 |

---

## 2. 레이아웃 분석

### 2.1 그리드 시스템

#### 반응형 브레이크포인트 (Tailwind 기본값)

| 브레이크포인트 | 너비 | 주요 변화 |
|---------------|------|-----------|
| 기본 (모바일) | < 640px | 1열 레이아웃, 모바일 메뉴 |
| `sm` | >= 640px | 버튼 가로 배치 |
| `md` | >= 768px | 2-3열 그리드, 태블릿 |
| `lg` | >= 1024px | 4열 그리드, 데스크톱 메뉴, 커스텀 커서 |
| `xl` | >= 1280px | (거의 미사용) |

#### 그리드 패턴

```
프로그램 목록:  grid md:grid-cols-2 lg:grid-cols-4 gap-6
블로그:         grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
푸터:           grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8
인스타그램:     grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4
통계카드:       grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
관리자 대시보드: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
```

---

### 2.2 네비게이션 구조

#### 데스크톱 네비바 (`Navbar.tsx`)

```
┌──────────────────────────────────────────────────────────┐
│ [Logo]  소개▼  프로그램▼  유니클럽  소통마당▼  함께하기▼  리서치랩↗  │  🔔 [프로필▼]
└──────────────────────────────────────────────────────────┘
  fixed top-0 | h-16 lg:h-20 | bg-white | border-b border-gray-200
  스크롤 시: shadow-lg shadow-gray-200/50
```

- 드롭다운: `DropdownMenu` (Radix UI) + `DropdownMenuContent` w-56
- 호버 색상: `hover:text-[#FF6B35]` (하드코딩)
- 외부 링크 (리서치랩): `target="_blank"` + ExternalLink 아이콘

#### 모바일 네비바

```
┌──────────────────────┐
│ [Logo]     🔔  ☰     │
└──────────────────────┘
  → Sheet (슬라이드 패널, 우측)
  → Accordion (중첩 메뉴)
  → 하단 고정: AdminMobileNav (관리자)
```

#### 메뉴 구조 (`navigation.ts`)

```
1. 소개       → /about, /history, (DB: people)
2. 프로그램    → /programs, /bookclub, /seminar, /kmove, /debate
3. 유니클럽    → /club (하이라이트)
4. 소통마당    → /notice, /blog, (DB: books), /korea-issue
5. 함께하기    → /donate, /suggest, /cooperation, /talent
6. 리서치랩    → lab.bestcome.org (외부)
```

#### 관리자 사이드바 (`admin/layout.tsx`)

```
┌─────────────────┬──────────────────────┐
│ [Logo]          │                      │
│─────────────────│                      │
│ 대시보드         │                      │
│ 회원 관리        │                      │
│ 프로그램         │     메인 콘텐츠       │
│ 책 관리          │                      │
│ 만족도 조사      │                      │
│ 협조요청 ▼       │                      │
│ 리서치랩 ▼       │                      │
│ 사업 관리 ▼      │                      │
│ 재무 ▼           │                      │
│ 콘텐츠 ▼         │                      │
│ AI 챗봇 ▼        │                      │
│ 디자인           │                      │
│ 설정 ▼           │                      │
│─────────────────│                      │
│ 사이트로 이동     │                      │
└─────────────────┴──────────────────────┘
  w-64 | bg-gray-900 | fixed h-full
  메뉴: text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl
  서브메뉴: <details> 기반 아코디언
```

---

### 2.3 퍼블릭 레이아웃 구조 (`(public)/layout.tsx`)

```
┌──────────────────────────┐
│ TopBanners (NoSSR)       │
│ NavbarWrapper            │
├──────────────────────────┤
│ main (pt-16 lg:pt-20)   │
│   {children}             │
├──────────────────────────┤
│ Footer                   │
│ BottomBanners (NoSSR)    │
│ PopupDisplay (dynamic)   │
│ FloatingButtonDisplay    │
│ ChatbotButton            │
│ CustomCursor             │
│ ScrollAnimation          │
└──────────────────────────┘
```

- `min-h-screen flex flex-col` 구조
- 클라이언트 전용 컴포넌트: `next/dynamic` + `ssr: false` (번들 최적화)
- 전체 `ErrorBoundary` 래핑

---

## 3. 페이지별 분석

### 3.1 메인 페이지 (`/`)

```
구조도:
┌──────────────────────────────────────────┐
│ HeroSection                              │
│ (min-h-screen, 배경 이미지 + 오버레이)      │
│ [타이틀] [통계] [CTA 2개] [스크롤 표시]     │
├──────────────────────────────────────────┤
│ MeaningSection (py-24, bg-white)         │
│ 유니피벗 이름의 의미 설명                    │
├──────────────────────────────────────────┤
│ KeyProgramsSection (py-24, bg-gray-50)   │
│ 4열 프로그램 카드 그리드                     │
├──────────────────────────────────────────┤
│ StorySection (py-24, bg-white)           │
│ 2열: 이미지 + 텍스트 + CTA                 │
├──────────────────────────────────────────┤
│ BulletinBoard (벽보판)                    │
│ 코르크보드 스타일 공지사항                    │
├──────────────────────────────────────────┤
│ RecentProgramsSection (py-24, bg-gray-50)│
│ 4열 프로그램 카드                           │
├──────────────────────────────────────────┤
│ UniClub 섹션 (py-16, 오렌지 그라데이션)     │
│ 3열 기능 카드 + 가입 CTA                   │
├──────────────────────────────────────────┤
│ ResearchLabSection (py-20, 다크)          │
│ 2열: 설명 + 기능 카드                       │
├──────────────────────────────────────────┤
│ InstagramFeed (py-24, bg-white)          │
│ 6열 이미지 그리드                           │
├──────────────────────────────────────────┤
│ DonationBanner (py-16, Primary 그라데이션)  │
│ CTA 배너                                  │
└──────────────────────────────────────────┘
```

**배경 색상 교차 패턴**: white → gray-50 → white → (cork) → gray-50 → orange → dark → white → primary

**히어로 섹션 상세**:
- 배경: 실제 이미지 (`hero-bg.webp`) + `bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-primary/30`
- 장식: blur 원형 요소 2개 (primary, primary-dark)
- 통계: Users, BookOpen, Calendar 아이콘 + 숫자 + 라벨
- CTA: Primary 버튼 ("프로그램 둘러보기") + Secondary 버튼 ("후원하기")
- 애니메이션: CSS `hero-fade-up` (0.1s~0.6s 순차 딜레이)

---

### 3.2 소개 페이지 (`/about`, `/history`)

```
구조도 (/about):
┌──────────────────────────────────────────┐
│ Hero (pt-32 pb-16, dark gradient)        │
│ 배지 + 제목 + 설명                         │
├──────────────────────────────────────────┤
│ 콘텐츠 영역 (py-12)                       │
│ max-w-4xl 중앙 정렬                        │
│ DB에서 로드한 콘텐츠 or 기본 소개 페이지      │
└──────────────────────────────────────────┘
```

- 다이나믹 페이지: DB `Page` 모델에서 발행된 콘텐츠 조회
- 없으면 기본 하드코딩 콘텐츠 사용
- 히스토리 페이지: 연혁 타임라인 형태 (추정)

---

### 3.3 프로그램 페이지 (`/programs`)

```
구조도:
┌──────────────────────────────────────────┐
│ Hero (pt-32 pb-16, dark gradient)        │
│ 배지 + "프로그램" + 설명 + [등록 버튼]      │
├──────────────────────────────────────────┤
│ Content (py-12, bg-gray-50)              │
│ ┌──────────────────────────────────────┐ │
│ │ ProgramTypeFilters (탭/필터)          │ │
│ ├──────────────────────────────────────┤ │
│ │ ProgramSection                       │ │
│ │ grid md:grid-cols-2 lg:grid-cols-4   │ │
│ │ [카드] [카드] [카드] [카드]            │ │
│ ├──────────────────────────────────────┤ │
│ │ CompletedProgramsSection (접이식)     │ │
│ ├──────────────────────────────────────┤ │
│ │ ClubBanner (유니클럽 홍보)            │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**프로그램 카드 구조**:
```
┌─────────────────────┐
│ [이미지 aspect-square] │
│ [상태 배지]  [찜 ♥]   │
├─────────────────────┤
│ [모드] [날짜]         │
│ 제목 (font-bold)      │
│ 설명 (text-gray-500)  │
│ [가격/무료] [CTA 버튼] │
└─────────────────────┘
```

**상태 배지 색상**:
- 모집중: `bg-green-500 text-white`
- 진행중: `bg-blue-500 text-white`
- 종료: `bg-gray-400 text-white`

**모드 배지**:
- 온라인: `bg-blue-100 text-blue-700`
- 오프라인: `bg-orange-100 text-orange-700`

---

### 3.4 소통마당 (`/notice`, `/blog`, `/korea-issue`)

```
공통 구조도:
┌──────────────────────────────────────────┐
│ Hero (pt-32 pb-16, dark gradient)        │
├──────────────────────────────────────────┤
│ Content (py-12, bg-gray-50)              │
│ ┌──────────────────────────────────────┐ │
│ │ 검색/필터 바                          │ │
│ │ bg-white rounded-2xl p-4 shadow-sm   │ │
│ ├──────────────────────────────────────┤ │
│ │ 카드 그리드/리스트                     │ │
│ ├──────────────────────────────────────┤ │
│ │ 페이지네이션                          │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**공지사항**: 리스트 형태 (`space-y-3` 카드 스택)
**블로그**: 3열 카드 그리드 (`grid md:grid-cols-2 lg:grid-cols-3`)
**한반도 이슈**: AI 채팅 인터페이스 (채팅 버블 + 입력창)

---

### 3.5 함께하기 (`/donate`, `/suggest`, `/cooperation`)

**후원 페이지** (`/donate`):
```
Hero → 후원 방법 카드 → 자주 묻는 질문 → CTA 배너
```
- 후원 카드: 금액별 3열 그리드
- 색상: 하트 아이콘 `text-red-500`, 금액 `text-primary`

**프로그램 제안** (`/suggest`):
```
Hero → 제안 양식 (max-w-2xl)
```
- 입력 양식: 표준 input/textarea 패턴
- 제출 버튼: `bg-primary hover:bg-primary-dark text-white rounded-xl`

**협조요청** (`/cooperation`):
```
Hero → 요청 유형별 섹션 (2열: 이미지+설명 교차)
```
- CooperationSection 컴포넌트 재사용

---

### 3.6 유니클럽 (`/club`)

```
구조도:
┌──────────────────────────────────────────┐
│ Hero (orange gradient)                   │
│ "유니클럽" + 설명 + CTA                   │
├──────────────────────────────────────────┤
│ 혜택 섹션                                 │
│ grid md:grid-cols-2 lg:grid-cols-3       │
│ [아이콘 카드들]                            │
├──────────────────────────────────────────┤
│ 가입 안내                                 │
│ 단계별 프로세스                             │
├──────────────────────────────────────────┤
│ 가입 CTA 배너                             │
└──────────────────────────────────────────┘
```

- 히어로: `bg-gradient-to-br from-orange-50 to-amber-50` (밝은 오렌지)
- 아이콘: `bg-[#FF6B35]/10 text-[#FF6B35]`

---

### 3.7 관리자 페이지 (`/admin`)

#### 대시보드 구조

```
┌─────────────────┬──────────────────────────────────┐
│                 │ [빠른 액션 배너]                    │
│                 │ bg-gradient-to-r from-orange-500   │
│                 │ to-orange-600                      │
│   사이드바       ├──────────────────────────────────┤
│   (w-64)        │ 통계 카드 (4열)                    │
│   bg-gray-900   │ [회원] [프로그램] [매출] [활동]     │
│                 ├──────────────────────────────────┤
│                 │ 위젯 (2열)                         │
│                 │ [최근 활동] [할일]                   │
│                 ├──────────────────────────────────┤
│                 │ [만족도] [관심키워드] [협조요청]       │
└─────────────────┴──────────────────────────────────┘
```

**통계 카드**: `bg-white rounded-2xl p-6 shadow-sm` + 아이콘 `w-12 h-12 bg-primary-light rounded-xl`
**위젯**: `bg-white rounded-2xl p-6 shadow-sm` + 헤더 + 리스트
**관리자 테마**: 사이드바 다크(`bg-gray-900`), 콘텐츠 라이트(`bg-gray-100`)

---

## 4. UX 분석

### 4.1 사용자 플로우 (주요 동선)

#### 플로우 1: 프로그램 신청

```
메인 → "프로그램 둘러보기" CTA
  → /programs (프로그램 목록)
    → 타입 필터 선택 (독서모임/세미나/워크숍)
      → 프로그램 카드 클릭
        → /programs/[slug] (상세)
          → "신청하기" 버튼
            → /programs/[slug]/apply (신청 폼)
              → 완료 → /my (마이페이지)
```

#### 플로우 2: 독후감 작성

```
/programs/[slug] (프로그램 상세)
  → "회차별 도서 안내" 섹션
    → "독후감" 버튼 클릭 (bookTitle 전달)
      → /my/reports/new?bookTitle=... (독후감 작성)
        → 도서 자동 선택됨
          → 작성 → 저장 → /my/reports
```

#### 플로우 3: 후원

```
메인 → "후원하기" CTA (또는 DonationBanner)
  → /donate (후원 페이지)
    → 후원 금액/방법 선택
      → 외부 결제 페이지 이동
```

#### 플로우 4: 관리자 워크플로우

```
/admin (대시보드)
  → 사이드바 메뉴 선택
    → /admin/programs (프로그램 관리)
      → 프로그램 등록/수정
    → /admin/members (회원 관리)
      → 회원 검색/상세
    → /admin/finance (재무 관리)
      → 거래 내역/보고서
```

### 4.2 CTA 배치 및 가시성

| 페이지 | CTA | 위치 | 가시성 |
|--------|-----|------|--------|
| 메인 히어로 | "프로그램 둘러보기" | 화면 중앙 | **높음** - 대비 좋음, 크기 큼 |
| 메인 히어로 | "후원하기" | 중앙 (보조) | 보통 - `bg-white/10`으로 덜 눈에 띔 |
| DonationBanner | "후원하기" | 섹션 우측 | **높음** - 흰색 on 오렌지 |
| UniClub | "가입하기" | 섹션 하단 중앙 | **높음** - 큰 버튼 + 그림자 |
| 프로그램 카드 | "신청하기" | 카드 하단 우측 | 보통 - 작은 크기 |
| 네비바 | "로그인" | 우측 상단 | **높음** - 오렌지 배경 |
| 프로그램 상세 | "독후감" | 세션 리스트 우측 | 보통 - `bg-primary/10` 연한 배경 |

### 4.3 정보 계층구조

```
Level 1 (최상위): 페이지 히어로 타이틀
  ├ text-4xl md:text-5xl lg:text-6xl font-bold text-white

Level 2 (섹션 제목):
  ├ text-3xl md:text-4xl font-bold text-gray-900
  ├ .section-title 클래스

Level 3 (서브섹션/카드 제목):
  ├ text-xl font-bold text-gray-900
  ├ text-lg font-semibold

Level 4 (본문/설명):
  ├ text-base text-gray-600
  ├ text-sm text-gray-500

Level 5 (보조 정보):
  ├ text-xs text-gray-400
  ├ 배지, 태그, 날짜
```

### 4.4 접근성

#### 잘 된 부분

| 항목 | 구현 | 파일 |
|------|------|------|
| 키보드 포커스 | `:focus-visible` 파란 아웃라인 | `accessibility.css:1-5` |
| 모션 감소 | `prefers-reduced-motion: reduce` 대응 | `accessibility.css:8-16`, `globals.css:654-673` |
| 고대비 모드 | `prefers-contrast: high` 대응 | `accessibility.css:19-32` |
| 이미지 alt | 모든 Image에 alt 속성 존재 | 각 컴포넌트 |
| 시맨틱 HTML | `<header>`, `<main>`, `<nav>`, `<footer>` 사용 | 레이아웃 파일들 |
| 외부 링크 | `target="_blank" rel="noopener noreferrer"` | Navbar, Footer |
| 폰트 폴백 | CLS 방지용 size-adjust 폴백 | `globals.css:13-39` |

#### 개선 필요

| 항목 | 현황 | 심각도 |
|------|------|--------|
| **커스텀 커서** | `cursor: none !important`로 시스템 커서 숨김 (데스크톱) | **High** - 보조기술 사용자 혼란 |
| **색상 대비** | `text-gray-400` on `bg-white` = 대비율 약 3.3:1 (WCAG AA 미달) | **High** |
| **포커스 링** | `#3B82F6` (파란색)은 브랜드 색상과 불일치 | Low |
| **ARIA 라벨** | 네비바 드롭다운에 `aria-label` 없음 | Medium |
| **스킵 네비게이션** | 구현 없음 | Medium |
| **lang 속성** | `<html lang="ko">` 올바름 | OK |

---

## 5. 기술적 현황

### 5.1 CSS 프레임워크

| 기술 | 버전/설정 | 파일 |
|------|-----------|------|
| **Tailwind CSS** | v3 (추정) | `tailwind.config.ts` |
| **@tailwindcss/forms** | 폼 기본 스타일링 리셋 | `tailwind.config.ts:149` |
| **@tailwindcss/typography** | `.prose` 클래스 (레거시 콘텐츠) | `tailwind.config.ts:150` |
| **tailwindcss-animate** | 애니메이션 유틸리티 | `tailwind.config.ts:151` |
| **Radix UI** | Sheet, DropdownMenu, Accordion 등 | Navbar, UI 컴포넌트 |

### 5.2 애니메이션/인터랙션

| 애니메이션 | 타입 | 트리거 | 파일 |
|-----------|------|--------|------|
| **스크롤 애니메이션** | IntersectionObserver | 뷰포트 진입 | `ScrollAnimation.tsx`, `globals.css:489-635` |
| **히어로 페이드업** | CSS @keyframes | 페이지 로드 | `globals.css:279-326` |
| **커스텀 커서** | requestAnimationFrame | 마우스 이동 | `CustomCursor.tsx` |
| **네비바 드롭다운** | CSS transition | hover | `globals.css:329-335` |
| **카드 호버** | CSS transform/shadow | hover | `globals.css:556-572` |
| **벽보판** | CSS @keyframes | 로드 | `globals.css:862-886` |
| **아코디언** | CSS @keyframes | 클릭 | `globals.css:836-845` |

**스크롤 애니메이션 클래스 목록**:
- `.animate-on-scroll` - 아래에서 위로 (translateY 30px)
- `.slide-from-left` - 왼쪽에서 (translateX -50px)
- `.slide-from-right` - 오른쪽에서 (translateX 50px)
- `.scale-in` - 확대 (scale 0.9 → 1)
- `.fade-in` - 단순 페이드

**순차 딜레이**: `.stagger-1` ~ `.stagger-6` (0.1s ~ 0.6s)

**모바일 최적화**: 768px 이하에서 duration 0.4s로 단축, stagger 딜레이 제거

### 5.3 이미지/아이콘

| 항목 | 사용 방식 | 비고 |
|------|-----------|------|
| **아이콘 라이브러리** | Lucide React | 전체 사이트 통일 |
| **히어로 이미지** | WebP (`hero-bg.webp`) + 반응형 (`hero-bg-640/1024/1920.webp`) | `next/image` priority |
| **프로그램 이미지** | 외부 URL (업로드된 이미지) | `aspect-square`, `object-cover` |
| **로고** | DB 설정 or 텍스트 폴백 | `next/image`, `h-10 w-auto` |
| **인스타그램** | API에서 동적 로드 | `aspect-square`, 6열 그리드 |
| **아바타** | Radix Avatar 컴포넌트 | 이니셜 폴백 |

---

## 6. 강점/약점 분석

### 6.1 강점

#### 1. 체계적인 퍼블릭 페이지 구조
- 모든 퍼블릭 페이지가 동일한 "다크 히어로 → 콘텐츠 영역" 패턴 준수
- 섹션 간 배경색 교차 (white/gray-50)로 시각적 구분 명확
- `max-w-7xl mx-auto px-4` 컨테이너 패턴 일관

#### 2. 성능 최적화
- Pretendard 폰트의 CLS 방지 전략 (3종 fallback + size-adjust)
- 클라이언트 전용 컴포넌트 dynamic import (`ssr: false`)
- 히어로 이미지 반응형 WebP
- 모바일에서 애니메이션 간소화
- `prefers-reduced-motion` 완벽 대응

#### 3. 풍부한 인터랙션
- 스크롤 기반 등장 애니메이션 (6종)
- 커스텀 커서 (데스크톱 전용)
- 벽보판(Bulletin Board) 독창적 UI
- 카드 호버 효과 (lift, scale)

#### 4. 컴포넌트 재사용
- `RecentProgramsSection`, `KeyProgramsSection` 등 섹션 단위 컴포넌트화
- `ErrorBoundary` 래핑으로 개별 섹션 오류 격리
- Radix UI 기반 UI 프리미티브 (Sheet, DropdownMenu, Accordion)

#### 5. 관리자 기능 충실
- 사이드바 네비게이션 12개 메뉴 그룹
- DB 기반 동적 네비게이션 메뉴
- 테마/폰트 설정 관리자 페이지에서 변경 가능
- 배너/팝업/플로팅 버튼 관리

---

### 6.2 약점

#### 1. CSS 변수와 실제 사용 색상 불일치 (**High**)
- `--primary: 0 0% 9%` (shadcn/ui 기본 = 거의 검정)
- 실제 Primary: `#FF6B35` (오렌지)
- `bg-primary`가 어떤 색을 렌더링하는지 예측 불가
- **파일**: `globals.css:86`, `tailwind.config.ts:14`

#### 2. 하드코딩된 색상 남발 (**High**)
- `text-[#FF6B35]`, `bg-[#FF6B35]`, `hover:bg-[#E55A2B]` 등 직접 사용
- 테마 변경 시 수십 곳 수동 수정 필요
- **파일**: `Navbar.tsx` (10+곳), `page.tsx` (5+곳), `HeroSection.tsx` (3+곳)

#### 3. 버튼 크기 비표준화 (**Medium**)
- `py-2 px-4`, `py-2.5 px-4`, `py-3 px-6`, `py-3.5 px-8`, `py-4 px-8` 등 5종 이상
- 어떤 것이 small/medium/large인지 규칙 없음
- **파일**: 거의 모든 페이지 컴포넌트

#### 4. 컴포넌트 클래스 미사용 (**Medium**)
- `globals.css`에 `.btn-primary`, `.btn-secondary`, `.btn-orange`, `.card`, `.section-title` 정의
- 실제 코드에서는 대부분 인라인 Tailwind 클래스 직접 사용
- 정의된 클래스와 실제 사용이 분리되어 유지보수 어려움
- **파일**: `globals.css:134-200`

#### 5. Border Radius 비일관 (**Medium**)
- 카드: `rounded-2xl` (16px) 또는 `rounded-xl` (12px) 혼용
- 버튼: `rounded-xl` 또는 `rounded-lg` 혼용
- 배지: `rounded-full` 또는 `rounded` 혼용
- **파일**: 전체

#### 6. 커스텀 커서 접근성 이슈 (**High**)
- `cursor: none !important` 전체 적용 (1025px+)
- 보조 기술/특수 마우스 사용자에게 커서 시인성 저하
- **파일**: `globals.css:204-208`, `CustomCursor.tsx`

#### 7. 그림자 시스템 단절 (**Low**)
- `shadow-sm` → `shadow-xl` (중간 단계 `shadow-md`, `shadow-lg` 거의 미사용)
- 호버 시 `shadow-sm` → `shadow-xl` 점프가 급격

#### 8. 네비게이션 스크롤 상태 미구현 (**Low**)
- 현재 페이지를 사이드바/네비바에서 하이라이트하지 않음 (active 상태 없음)
- 관리자 사이드바도 현재 메뉴 표시 없음
- **파일**: `Navbar.tsx`, `admin/layout.tsx`

---

## 7. 개선 제안 및 우선순위

### Priority: High

| # | 문제 | 개선안 | 관련 파일 | 영향 범위 |
|---|------|--------|-----------|-----------|
| H1 | CSS 변수 `--primary`와 실제 Primary 색상 불일치 | `globals.css`의 `--primary`를 `15 100% 57%` (`#FF6B35`의 HSL)로 변경. `--primary-foreground`를 `0 0% 100%`으로 설정 | `globals.css:86-87` | 전체 사이트 |
| H2 | 하드코딩된 `#FF6B35` 산재 | `text-[#FF6B35]` → `text-primary`, `bg-[#FF6B35]` → `bg-primary`로 전면 교체. Tailwind config에서 primary를 HSL 변수 기반으로 통일 | `Navbar.tsx`, `page.tsx`, `HeroSection.tsx`, `Footer.tsx` 외 다수 | 전체 사이트 |
| H3 | 커스텀 커서 접근성 | `cursor: none` 제거하거나, `prefers-reduced-motion` 또는 전용 접근성 옵션으로 opt-in 처리. 최소한 `@media (pointer: fine)` 조건 추가 | `globals.css:204-208`, `CustomCursor.tsx` | 데스크톱 |
| H4 | `text-gray-400` on white 대비율 부족 | 보조 텍스트를 `text-gray-500` (대비율 ~4.6:1) 이상으로 상향. 특히 Footer, 카드 메타 정보 | `Footer.tsx`, `RecentProgramsSection.tsx` 등 | 전체 사이트 |

### Priority: Medium

| # | 문제 | 개선안 | 관련 파일 | 영향 범위 |
|---|------|--------|-----------|-----------|
| M1 | 버튼 크기 비표준화 | 3단계 시스템 정의: `sm` (py-2 px-4), `md` (py-3 px-6), `lg` (py-4 px-8). `.btn-primary-sm`, `.btn-primary-md`, `.btn-primary-lg` 또는 Button 컴포넌트에 size prop | `globals.css`, 각 페이지 | 전체 사이트 |
| M2 | 컴포넌트 클래스 정의 vs 실사용 괴리 | 정의된 `.btn-primary` 등을 실제 코드에서 사용하도록 교체, 또는 `components/ui/Button.tsx`에 통합하고 globals에서 제거 | `globals.css:134-200`, 각 페이지 | 전체 사이트 |
| M3 | 현재 페이지 네비게이션 하이라이트 없음 | `usePathname()`으로 현재 경로 감지, 활성 메뉴에 `text-[#FF6B35]` + `font-semibold` 적용 | `Navbar.tsx`, `admin/layout.tsx` | 네비게이션 |
| M4 | 스킵 네비게이션 미구현 | `<a href="#main-content" className="sr-only focus:not-sr-only">본문 바로가기</a>` 추가 | `(public)/layout.tsx` | 접근성 |
| M5 | ARIA 라벨 부족 | 네비바 드롭다운, 모바일 메뉴 버튼, 아이콘 버튼에 `aria-label` 추가 | `Navbar.tsx` | 접근성 |
| M6 | 관리자/퍼블릭 아이콘 크기 비일관 | `w-4 h-4` (sm), `w-5 h-5` (md), `w-6 h-6` (lg) 3단계로 표준화 | 전체 | 전체 사이트 |

### Priority: Low

| # | 문제 | 개선안 | 관련 파일 | 영향 범위 |
|---|------|--------|-----------|-----------|
| L1 | Border Radius 비일관 | 규칙 정립: 카드=`rounded-2xl`, 버튼=`rounded-xl`, 입력=`rounded-xl`, 배지=`rounded-full`, 작은 요소=`rounded-lg` | 전체 | 시각적 일관성 |
| L2 | 그림자 단절 | `shadow-sm` → `shadow-md` (호버) → `shadow-lg` → `shadow-xl` 4단계 사용 | 카드 컴포넌트 | 인터랙션 |
| L3 | 섹션 간격 비표준 | 표준화: 메인 섹션=`py-24`, 보조 섹션=`py-16`, 콘텐츠 영역=`py-12` | 각 섹션 컴포넌트 | 리듬감 |
| L4 | 포커스 링 색상 불일치 | `accessibility.css`의 `#3B82F6` (파란색) → `#FF6B35` (브랜드 오렌지)로 변경 | `accessibility.css:3` | 접근성 |
| L5 | 컨테이너 너비 혼용 | 표준화: 전폭=`max-w-7xl`, 중형=`max-w-5xl`, 좁은=`max-w-3xl`. `max-w-6xl`, `max-w-4xl`, `max-w-2xl` 정리 | 각 페이지 | 레이아웃 |
| L6 | 다크 모드 미활용 | `tailwind.config.ts`에 `darkMode: ['class']` 설정됨, CSS 변수도 `.dark` 정의 있으나 토글 UI 없음 | 전체 | 향후 기능 |

---

## 부록: 파일 참조 색인

### 디자인 시스템 파일

| 파일 | 역할 |
|------|------|
| `tailwind.config.ts` | 색상, 폰트, 애니메이션, 플러그인 |
| `src/app/globals.css` | CSS 변수, 컴포넌트 클래스, 벽보판, 스크롤 애니메이션 |
| `src/styles/accessibility.css` | 포커스, 모션 감소, 고대비 |
| `src/components/FontProvider.tsx` | 동적 폰트 로딩, CSS 변수 업데이트 |

### 레이아웃 파일

| 파일 | 역할 |
|------|------|
| `src/app/layout.tsx` | 루트 레이아웃 (폰트 로딩, 메타데이터) |
| `src/app/(public)/layout.tsx` | 퍼블릭 레이아웃 (네비바, 푸터, 오버레이) |
| `src/app/admin/layout.tsx` | 관리자 레이아웃 (사이드바) |
| `src/lib/navigation.ts` | 메뉴 구조 정의 |

### 주요 컴포넌트

| 파일 | 역할 |
|------|------|
| `src/components/public/Navbar.tsx` | 데스크톱/모바일 네비게이션 |
| `src/components/public/Footer.tsx` | 푸터 (링크, 연락처, SNS) |
| `src/components/public/HeroSection.tsx` | 메인 히어로 배너 |
| `src/components/public/KeyProgramsSection.tsx` | 주요 프로그램 카드 |
| `src/components/public/RecentProgramsSection.tsx` | 최근 프로그램 카드 |
| `src/components/public/MeaningSection.tsx` | 유니피벗 의미 설명 |
| `src/components/public/StorySection.tsx` | 단체 소개 |
| `src/components/public/ResearchLabSection.tsx` | 리서치랩 소개 |
| `src/components/public/InstagramFeed.tsx` | 인스타그램 피드 |
| `src/components/public/DonationBanner.tsx` | 후원 CTA 배너 |
| `src/components/public/CustomCursor.tsx` | 커스텀 커서 |
| `src/components/public/ScrollAnimation.tsx` | 스크롤 애니메이션 Observer |
| `src/components/bulletin-board/BulletinBoard.tsx` | 벽보판 UI |
| `src/components/banners/BannerDisplay.tsx` | 배너 표시 |

---

> **요약**: bestcome.org는 **성능 최적화**와 **풍부한 인터랙션**에서 높은 완성도를 보이지만, **CSS 변수/색상 체계 불일치** (H1, H2)와 **접근성 이슈** (H3, H4)가 최우선 개선 사항입니다. 디자인 토큰을 정비하고 하드코딩된 색상을 제거하면 유지보수성이 크게 향상됩니다.
