# 최종 코드 리뷰 (Phase 41-51)

리뷰 일시: 2026-02-03
리뷰 범위: Phase 41-51 신규/수정 파일

## 요약
- 검토 파일: 30개
- CRITICAL: 2건
- HIGH: 4건
- MEDIUM: 5건

## 이슈 목록

### [CRITICAL] Cron 엔드포인트 인증 우회 가능 (`x-vercel-cron` 헤더 스푸핑)
- **파일**: `src/lib/cron/auth.ts:18`
- **문제**: `verifyCronRequest`가 `CRON_SECRET`이 설정되지 않았을 때 `x-vercel-cron: 1` 헤더만으로 인증을 통과시킨다. 이 헤더는 누구나 HTTP 요청에 추가할 수 있으므로, Vercel에 배포되지 않은 환경(PM2+서버 직접 배포)에서는 누구든 cron 엔드포인트를 호출할 수 있다. 현재 `deploy.yml`에서 PM2로 직접 배포하는 것을 확인할 수 있으며, `.env` 파일에 `CRON_SECRET`이 설정되어 있는지 확인 불가(검색 결과 없음).
- **영향**: 외부 공격자가 `curl -H "x-vercel-cron: 1" https://bestcome.org/api/cron/backup`으로 백업 체크, 세션 리마인더, 주간 다이제스트 등의 cron 작업을 무단으로 트리거할 수 있다.
- **수정 제안**:
```typescript
// src/lib/cron/auth.ts
export function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // CRON_SECRET이 설정되어 있으면 Bearer token 검증 필수
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  // Vercel 환경에서만 x-vercel-cron 헤더 허용
  if (process.env.VERCEL === '1') {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    return isVercelCron
  }

  // CRON_SECRET 미설정 + 비-Vercel 환경이면 거부
  return false
}
```

---

### [CRITICAL] Health 엔드포인트 인증 없이 노출
- **파일**: `src/app/api/health/route.ts:6`
- **문제**: `/api/health` 엔드포인트에 인증이 없다. 이 엔드포인트는 DB 연결 상태, 메모리 사용량(heapUsed/heapTotal), 서버 업타임 등의 인프라 정보를 노출한다. `robots.ts`에서 `/api/`를 disallow하고 있지만 이는 크롤러 힌트일 뿐이며, 직접 접근은 막지 않는다.
- **영향**: 공격자가 DB 연결 상태, 서버 메모리 상태, 정확한 업타임(서버 재시작 시점 추정 가능) 등 인프라 정보를 수집하여 공격에 활용할 수 있다. 특히 `status: 'degraded'`일 때 취약한 시점을 노려 공격할 수 있다.
- **수정 제안**:
```typescript
// 옵션 1: 간소화된 공개 health + 인증된 상세 health
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  const isAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)

  // 비인증 요청에는 단순 status만 반환
  if (!isAdmin) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return NextResponse.json({ status: 'ok' })
    } catch {
      return NextResponse.json({ status: 'error' }, { status: 503 })
    }
  }

  // 관리자에게만 상세 정보 반환
  // ... 기존 로직
}
```

---

### [HIGH] API Docs 엔드포인트에서 `yaml.load` 사용 (잠재적 안전 문제)
- **파일**: `src/app/api/docs/route.ts:10`
- **문제**: `js-yaml`의 `yaml.load()`는 기본적으로 안전하지만(v4부터 기본 스키마가 `DEFAULT_SCHEMA`), 파일 시스템에서 읽은 YAML을 그대로 파싱하여 JSON으로 반환한다. 더 중요한 문제는 `fs.readFileSync`를 사용하여 서버리스 환경에서 파일 시스템 접근이 불안정할 수 있고, 매 요청마다 동기적으로 파일을 읽어 성능에 영향을 미친다.
- **영향**: 서버리스(Vercel) 환경에서 빌드 후 `src/docs/openapi.yaml` 파일이 번들에 포함되지 않으면 500 에러가 발생한다. PM2 환경에서는 동기 파일 읽기로 인해 이벤트 루프가 블로킹된다.
- **수정 제안**:
```typescript
// 빌드 시점에 YAML을 import하거나, 정적으로 캐시
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'

let cachedSpec: unknown = null

export async function GET() {
  try {
    if (!cachedSpec) {
      const filePath = path.join(process.cwd(), 'src/docs/openapi.yaml')
      const fileContents = await fs.readFile(filePath, 'utf8')
      cachedSpec = yaml.load(fileContents)
    }
    return NextResponse.json(cachedSpec)
  } catch {
    return NextResponse.json(
      { error: 'OpenAPI 스펙을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}
```

---

### [HIGH] API Docs 페이지가 프로덕션에서 인증 없이 접근 가능
- **파일**: `src/app/api-docs/page.tsx:8`
- **문제**: Swagger UI 페이지(`/api-docs`)가 인증 없이 누구나 접근 가능하다. 미들웨어 매처 패턴을 확인하면 `/api-docs`는 보호 대상에 포함되지 않는다. API 문서에는 모든 엔드포인트의 경로, 파라미터, 스키마 정보가 포함되어 있어 공격 표면을 확장시킨다.
- **영향**: 공격자가 전체 API 구조를 파악하여 타깃 공격을 수행할 수 있다.
- **수정 제안**: 프로덕션에서는 API 문서 페이지 접근을 관리자로 제한하거나, 개발 환경에서만 노출되도록 변경:
```typescript
// src/app/api-docs/page.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'

export default async function ApiDocsPage() {
  if (process.env.NODE_ENV === 'production') {
    const user = await getCurrentUser()
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      redirect('/login')
    }
  }
  return (/* SwaggerUI component */)
}
```

---

### [HIGH] ProgramJsonLd에서 COMPLETED 상태를 EventPostponed로 매핑
- **파일**: `src/components/seo/JsonLd.tsx:58-59`
- **문제**: 프로그램 status가 `COMPLETED`일 때 Schema.org의 `EventPostponed`로 매핑하고 있다. 이는 의미적으로 잘못되었다. "연기됨"과 "완료됨"은 완전히 다른 상태이다. Google은 이를 "이벤트가 연기되었음"으로 표시하여 사용자에게 잘못된 정보를 전달한다.
- **영향**: Google Rich Results에서 완료된 프로그램이 "연기됨"으로 표시되어 SEO 신뢰도가 하락하고, 사용자에게 잘못된 정보가 제공된다. Google의 structured data 가이드라인 위반으로 검색 노출이 감소할 수 있다.
- **수정 제안**:
```typescript
const eventStatus = program.status === 'COMPLETED'
  ? 'EventCancelled' // 또는 종료된 이벤트이므로 EventScheduled 유지
  : 'EventScheduled'
```
참고: Schema.org에는 "EventCompleted" 상태가 없으므로, COMPLETED 프로그램은 JSON-LD를 생성하지 않거나 `EventScheduled`를 유지하는 것이 올바르다.

---

### [HIGH] Rate Limiter가 서버리스 환경에서 무효화
- **파일**: `src/lib/rate-limit.ts:13`
- **문제**: 인메모리 `Map`을 사용한 rate limiting은 단일 서버 프로세스에서만 유효하다. 서버리스(Vercel) 환경에서는 각 함수 호출이 별도 인스턴스에서 실행될 수 있어 rate limit이 사실상 적용되지 않는다. PM2 클러스터 모드에서도 각 워커가 독립된 Map을 가지므로 실제 제한이 워커 수만큼 느슨해진다.
- **영향**: 공격자가 rate limit을 우회하여 브루트포스 공격(특히 `authRateLimit` - 15분당 10회 제한)을 수행할 수 있다. 인증 관련 엔드포인트의 보안이 약화된다.
- **수정 제안**: Redis 기반 rate limiting으로 전환하거나, Vercel Edge Middleware + KV Store를 활용:
```typescript
// Redis 또는 Upstash Rate Limiting 사용 권장
// @upstash/ratelimit + @upstash/redis 패키지 활용
```

---

### [MEDIUM] ErrorFallback에서 프로덕션 환경에서도 에러 스택 노출
- **파일**: `src/components/ErrorBoundary.tsx:63-67`
- **문제**: `ErrorFallback` 컴포넌트가 `error.toString()`을 `<details>` 태그 안에 그대로 표시한다. 프로덕션 환경에서도 에러 메시지와 스택 트레이스가 사용자에게 노출되어, 내부 파일 경로나 로직 정보가 유출될 수 있다.
- **영향**: 공격자가 에러 메시지에서 내부 파일 구조, 사용 중인 라이브러리, DB 쿼리 정보 등을 추출하여 공격에 활용할 수 있다.
- **수정 제안**:
```tsx
export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
      <h2 className="text-red-800 font-medium mb-2">페이지 로딩 중 오류가 발생했습니다</h2>
      {process.env.NODE_ENV === 'development' && (
        <details className="text-left mt-3 text-sm text-red-700">
          <summary className="cursor-pointer">상세 오류 정보</summary>
          <code className="block mt-2 p-2 bg-red-100 rounded whitespace-pre-wrap text-xs">
            {error.toString()}
          </code>
        </details>
      )}
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        페이지 새로고침
      </button>
    </div>
  )
}
```

---

### [MEDIUM] MonitoringDashboard에서 클라이언트에서 process.env.NODE_ENV 사용
- **파일**: `src/components/club/admin/monitoring/MonitoringDashboard.tsx:202`
- **문제**: `'use client'` 컴포넌트에서 `process.env.NODE_ENV`를 사용하고 있다. Next.js에서 이 값은 빌드 시점에 인라인되므로 동작은 하지만, 항상 빌드 환경의 값(보통 `'production'`)이 표시된다. 실제 런타임 환경과 다를 수 있어 디버깅에 혼란을 줄 수 있다.
- **영향**: 모니터링 대시보드에서 항상 "프로덕션"으로 표시되어 스테이징/개발 환경 구분이 불가능할 수 있다. 기능적 오류는 아니지만 운영 시 혼란 발생 가능.
- **수정 제안**: 서버 컴포넌트에서 환경 정보를 props로 전달하거나, metrics API 응답에 환경 정보를 포함:
```typescript
// page.tsx에서 props로 전달
<MonitoringDashboard
  initialHealth={health}
  initialMetrics={metrics}
  environment={process.env.NODE_ENV}
/>
```

---

### [MEDIUM] Sitemap에서 대량 데이터 무제한 조회 가능
- **파일**: `src/app/sitemap.ts:30-34, 45-48, 58-63`
- **문제**: `bookReport.findMany`에는 `take: 1000` 제한이 있으나, `program.findMany`와 `notice.findMany`(take: 500)는 적절하다. 그러나 세 개의 DB 쿼리를 `Promise.all`이 아닌 순차적으로 실행하여 sitemap 생성 시간이 불필요하게 길어진다. 또한, 프로그램 수가 매우 많아지면 상한이 없어 sitemap이 과도하게 커질 수 있다.
- **영향**: sitemap 생성 시 응답 시간 증가. 프로그램 수가 수만 건을 초과하면 sitemap 크기가 50MB/50,000 URL Google 제한을 초과할 수 있다.
- **수정 제안**: `Program` 쿼리에도 `take` 제한 추가, 세 쿼리를 `Promise.all`로 병렬 실행:
```typescript
const [reviews, programs, notices] = await Promise.all([
  prisma.bookReport.findMany({...}),
  prisma.program.findMany({ ...options, take: 1000 }),
  prisma.notice.findMany({...}),
])
```

---

### [MEDIUM] Deploy 워크플로우에서 빌드 아티팩트 미사용
- **파일**: `.github/workflows/deploy.yml:56-101`
- **문제**: `build` 잡에서 빌드 아티팩트를 `upload-artifact`로 업로드하지만, `deploy` 잡에서는 아티팩트를 다운로드한 후 실제로는 SSH로 서버에 접속하여 `git pull` 후 다시 `pnpm build`를 실행한다. 즉 빌드 아티팩트가 전혀 사용되지 않고 있다. 이로 인해 배포 시 빌드가 두 번 실행되고, CI 빌드와 프로덕션 빌드가 다를 수 있다.
- **영향**: 배포 시간이 불필요하게 증가하고, CI에서 검증한 빌드와 실제 배포되는 빌드가 다를 수 있어 CI 검증의 의미가 퇴색된다. 아티팩트 저장에 불필요한 스토리지를 사용한다.
- **수정 제안**: 아티팩트를 서버로 전송하여 사용하거나, 아티팩트 업로드/다운로드 단계를 제거하고 deploy 잡에서 직접 빌드:
```yaml
# 옵션 1: 아티팩트 업로드 제거
deploy:
  name: Deploy to Production
  runs-on: ubuntu-latest
  # needs: build 제거 또는 build 잡 수정
  steps:
    - name: Deploy to Server
      uses: appleboy/ssh-action@v1.0.3
      # ... 기존 SSH 스크립트 유지
```

---

### [MEDIUM] QA 스크립트에서 고아 데이터 검사 쿼리 오류
- **파일**: `scripts/final-qa.ts:72-74`
- **문제**: `prisma.bookReport.count({ where: { author: { userId: null as unknown as string } } })` 쿼리가 `null as unknown as string` 타입 캐스팅을 사용한다. BookReport의 `author`는 `Member` 관계이고 `authorId`는 필수 필드이므로, 이 쿼리는 Prisma에서 `userId`가 `Member` 모델의 필드가 아닐 수 있어 런타임 에러를 발생시킬 수 있다. 실제로 `catch`로 감싸 에러를 무시하고 있어 무결성 검사가 실질적으로 수행되지 않는다.
- **영향**: QA 스크립트의 데이터 무결성 검사가 항상 스킵되어, 고아 데이터가 있어도 감지하지 못한다.
- **수정 제안**:
```typescript
// Member의 userId 관계를 통한 올바른 쿼리
const orphanedReports = await prisma.bookReport.count({
  where: {
    author: {
      userId: { equals: null as unknown as undefined }
    }
  }
})
```
또는 Member 모델의 실제 필드 구조에 맞는 쿼리로 변경.

## Phase별 검토 결과

| Phase | 파일 수 | 이슈 | 상태 |
|-------|---------|------|------|
| 41-42 | (테스트 파일 - 리뷰 범위 외) | 0건 | OK |
| 43 | 3 (openapi.yaml, route.ts, page.tsx) | 2건 (HIGH) | 주의 |
| 44 | 7 (help-content.ts, 3 컴포넌트, 4 페이지) | 0건 | OK |
| 45 | 6 (sentry configs, instrumentation, global-error, ErrorBoundary) | 1건 (MEDIUM) | 주의 |
| 46 | 6 (health, metrics, slack, metrics route, dashboard, page) | 2건 (CRITICAL + MEDIUM) | 주의 |
| 47 | 3 (sitemap, robots, JsonLd) | 2건 (HIGH + MEDIUM) | 주의 |
| 48 | 3 (ci.yml, deploy.yml, vercel.json) | 1건 (MEDIUM) | 주의 |
| 49 | 1 (backup route) | 1건 (CRITICAL - cron auth) | 주의 |
| 50 | 3 (next.config.js, rate-limit, security-checklist) | 1건 (HIGH) | 주의 |
| 51 | 2 (final-qa.ts, security-checklist) | 1건 (MEDIUM) | 주의 |

## 결론

Phase 41-51에서 총 30개 파일을 검토한 결과, CRITICAL 2건, HIGH 4건, MEDIUM 5건의 실질적 이슈를 발견하였다.

**가장 시급하게 수정해야 할 항목:**

1. **Cron 인증 우회 (CRITICAL)**: PM2 직접 배포 환경에서 `x-vercel-cron` 헤더 스푸핑으로 모든 cron 엔드포인트가 외부에서 호출 가능하다. `CRON_SECRET` 환경변수 설정 확인 및 비-Vercel 환경에서 헤더 기반 인증 비활성화가 필요하다.

2. **Health 엔드포인트 정보 노출 (CRITICAL)**: 인증 없이 서버 인프라 정보(DB 상태, 메모리, 업타임)가 노출되어 공격 정보 수집에 활용될 수 있다.

3. **API Docs 무인증 노출 (HIGH)**: 전체 API 구조가 프로덕션에서 누구에게나 공개된다.

4. **Rate Limiter 무효화 (HIGH)**: 서버리스/클러스터 환경에서 인메모리 rate limiting이 작동하지 않아 브루트포스 공격에 취약하다.

**긍정적 측면:**
- Phase 44 (Help/FAQ)는 정적 데이터 기반으로 안전하게 구현되었다.
- Sentry 설정이 적절하며, 개발 환경에서는 이벤트 전송을 차단하고 있다.
- CSP 헤더가 상세하게 설정되어 있다.
- 모니터링 메트릭 API에는 적절한 권한 검사가 있다.
- 보안 헤더(HSTS, X-Frame-Options 등)가 올바르게 설정되어 있다.

위 CRITICAL 및 HIGH 이슈들을 런칭 전에 반드시 수정할 것을 권고한다.
