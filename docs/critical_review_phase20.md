# Critical Code Review Report - Phase 16-20+ (Club Admin System)

**Project:** unihome-v2 (Next.js)
**Reviewed by:** Claude Code Review
**Date:** 2026-01-31
**Scope:** `src/app/club/`, `src/components/club/`, `src/lib/club/`, `prisma/schema.prisma`, server actions, API routes

---

## Table of Contents

1. [Missing Features (빠진 기능)](#1-missing-features-빠진-기능)
2. [Security Issues (보안 이슈)](#2-security-issues-보안-이슈)
3. [Code Quality (코드 품질)](#3-code-quality-코드-품질)
4. [Performance Issues (성능 이슈)](#4-performance-issues-성능-이슈)
5. [UX/Accessibility (UX/접근성)](#5-uxaccessibility-ux접근성)
6. [DB Schema Issues (DB 스키마)](#6-db-schema-issues-db-스키마)
7. [Summary Statistics](#7-summary-statistics)

---

## 1. Missing Features (빠진 기능)

### 1.1 Error Handling Gaps

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 1 | `src/app/club/attendance/actions.ts` | 12-113 | `checkInWithQR()` throws raw Error objects instead of returning error results. When the server action throws, the client receives an opaque error. The companion actions `manualCheckIn()` (line 118) and `generateSessionQR()` (line 178) have the same pattern. | 높음 | Return `{ error: message }` objects like the admin actions do, or wrap in a try-catch that returns structured error objects. |
| 2 | `src/app/club/bookclub/quotes/actions.ts` | 17-73 | `createQuote()` and `deleteQuote()` throw raw errors. Client code must use try-catch everywhere these are called. This is inconsistent with admin actions that return `{ error }` objects. | 중간 | Standardize on returning `{ error }` or `{ success }` objects for all server actions. |
| 3 | `src/app/club/(facilitator)/facilitator/timer/actions.ts` | 13-17 | `saveSpeakingTimes()` throws on auth failure but does not catch DB errors (the upsert loop at lines 22-37 has no try-catch). If one upsert fails mid-loop, partial data is saved. | 높음 | Wrap the upsert loop in a Prisma `$transaction` and add a try-catch returning `{ error }`. |
| 4 | `src/lib/club/recap-queries.ts` | 30 | `generateProgramRecap()` throws `new Error('Program not found')` without catching at the call site in `getProgramRecap()` (line 12). If program is deleted between the findUnique check and generation, the page crashes. | 중간 | Add try-catch in `getProgramRecap()` or return null instead of throwing. |
| 5 | `src/lib/club/recap-ai.ts` | 73-79 | AI response parsing uses `JSON.parse(jsonMatch[0])` on regex-extracted content without try-catch around the parse specifically. If the AI returns malformed JSON inside braces, the `JSON.parse` throws but is caught by the outer catch (line 80). However, if the AI returns valid-looking but semantically wrong JSON, it is cast directly with `as AIHighlights` -- no runtime validation. | 중간 | Add a zod schema or runtime validation for the AI response shape. |

### 1.2 Missing Loading States

| # | File | Description | Priority | Suggested Fix |
|---|------|-------------|----------|---------------|
| 6 | `src/app/club/(admin)/admin/*/` | No `loading.tsx` files exist in any club admin sub-routes (`admin/programs/`, `admin/members/`, `admin/attendance/`, `admin/resources/`). Only the root `/club/loading.tsx` exists. | 높음 | Add `loading.tsx` skeleton files to admin sub-routes for proper Suspense boundaries during RSC navigation. |
| 7 | `src/app/club/(facilitator)/facilitator/*/` | No `loading.tsx` in facilitator routes (timer, questions, resources, attendance). | 중간 | Add loading skeletons for facilitator pages. |
| 8 | `src/app/club/programs/[id]/recap/` | No loading state for the recap page. Recap generation calls AI and multiple DB queries which can be slow. | 중간 | Add `loading.tsx` with a recap skeleton. |
| 9 | `src/app/club/bookclub/*/` | No `loading.tsx` in bookclub sub-routes (bookshelf, reviews, quotes, stamps). | 중간 | Add loading skeletons for bookclub pages. |

### 1.3 Missing Error Boundaries

| # | File | Description | Priority | Suggested Fix |
|---|------|-------------|----------|---------------|
| 10 | `src/app/club/(admin)/admin/` | No `error.tsx` boundary for admin routes. If any admin page throws, the error bubbles up to `/club/error.tsx`, losing admin context. | 중간 | Add admin-specific `error.tsx` with admin navigation preserved. |
| 11 | `src/app/club/(facilitator)/facilitator/` | No `error.tsx` boundary for facilitator routes. | 중간 | Add facilitator-specific `error.tsx`. |
| 12 | `src/app/club/bookclub/` | No `error.tsx` boundary for bookclub routes. | 낮음 | Add bookclub-specific `error.tsx`. |

### 1.4 Missing Confirmation for Destructive Actions

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 13 | `src/components/club/admin/ProgramTable.tsx` | 109-121 | Uses `window.confirm()` for program deletion. This is functional but provides no undo mechanism and the browser-native dialog is inconsistent across platforms. | 낮음 | Replace with a custom confirmation modal component. |
| 14 | `src/components/club/admin/MemberTable.tsx` | -- | Role change modal exists (`RoleChangeModal`), which is good. However, there is no confirmation for participant removal in `ProgramEditParticipants`. | 중간 | Add confirmation before removing participants from programs. |
| 15 | `src/app/club/bookclub/quotes/actions.ts` | 48-73 | `deleteQuote()` has no client-side confirmation pattern. The action just deletes directly. | 낮음 | Add a confirmation dialog on the client before calling deleteQuote. |

---

## 2. Security Issues (보안 이슈)

### 2.1 Missing/Inconsistent Auth Checks

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 16 | `src/app/club/attendance/actions.ts` | 118-173 | `manualCheckIn()` only checks for login (`session.user.id`) but does NOT verify the caller is a facilitator or admin. Any logged-in user could manually mark attendance for any other user. | 높음 | Add role check: verify the user is FACILITATOR, ADMIN, or SUPER_ADMIN, or verify they have a ProgramMembership with ORGANIZER/FACILITATOR role for this program. |
| 17 | `src/app/club/attendance/actions.ts` | 178-214 | `generateSessionQR()` only checks for login but does NOT verify the caller has facilitator/admin privileges. Any logged-in user can generate QR codes for any session. | 높음 | Add role check similar to manualCheckIn. |
| 18 | `src/app/club/(facilitator)/facilitator/timer/actions.ts` | 13-88 | `saveSpeakingTimes()` only checks for login. No verification that the caller is actually a facilitator for the given session's program. | 높음 | Verify caller has ORGANIZER/FACILITATOR membership for the session's program. |
| 19 | `src/app/club/programs/[id]/recap/page.tsx` | 20-69 | Recap page has no auth check at all. Any visitor (even unauthenticated) can view the recap page for any completed program if they know the program ID. | 중간 | Add auth check -- at minimum require login, and optionally restrict to program participants. |
| 20 | `src/app/club/(admin)/admin/programs/actions.ts` | 17 | `checkAdminAuth()` allows FACILITATOR role for all program management operations including `deleteProgram`. This may be too permissive -- facilitators should perhaps not delete programs. | 중간 | Restrict `deleteProgram` to ADMIN and SUPER_ADMIN only; create a separate auth check for destructive operations. |

### 2.2 Input Validation Gaps

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 21 | `src/app/club/(admin)/admin/programs/actions.ts` | 46-83 | `createProgram()` accepts `formData.type` and `formData.status` as arbitrary strings without validation. A caller can pass any string value for these fields. | 중간 | Validate `type` against allowed values (BOOKCLUB, SEMINAR, DEBATE) and `status` against (DRAFT, RECRUITING, ONGOING, COMPLETED). |
| 22 | `src/app/club/(admin)/admin/programs/actions.ts` | 229-249 | `addParticipant()` does not check if the userId actually exists before creating the participant record. If an invalid userId is passed, the foreign key constraint will catch it but the error message will be generic. | 낮음 | First verify the user exists, then create the participant. |
| 23 | `src/app/club/(admin)/admin/programs/actions.ts` | 159-200 | `addSession()` does not validate date format. If `data.date` is an invalid date string, `new Date(data.date)` produces `Invalid Date` which Prisma may reject or store incorrectly. | 중간 | Add date validation before passing to Prisma. |
| 24 | `src/app/club/(admin)/admin/resources/actions.ts` | 27-57 | `createResource()` does not validate the `type` field or sanitize `title`/`description` inputs beyond trimming. The `url` field is not validated as a proper URL. | 중간 | Add URL validation for `data.url` and validate `type` against known values. |
| 25 | `src/app/club/bookclub/my-bookshelf/actions.ts` | 11-49 | `addWishBook()` uses `formData.get('readBookId') as string | null` without any validation. FormData values are always strings, so casting is safe, but there is no check that `readBookId` refers to a valid book. | 낮음 | Verify readBookId exists in the ReadBook table before creating. |

### 2.3 XSS Vulnerabilities

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 26 | `src/app/(public)/debug/page.tsx` | 13-15 | Uses `dangerouslySetInnerHTML` with a hardcoded `console.log` string -- NOT user input, so it is safe. However, this debug page should not exist in production. | 중간 | Remove the debug page or gate it behind auth/environment check. |
| 27 | `src/components/seo/JsonLd.tsx` | 30, 130, 183, 214, 243 | Uses `dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}` for JSON-LD scripts. If any field in `data` contains `</script>`, it could break out of the script tag. `JSON.stringify` does not escape `</script>`. | 높음 | Use a proper JSON-LD sanitizer or replace `</` sequences in the output (e.g., `.replace(/<\//g, '<\\/')`). |
| 28 | `src/lib/sanitize.ts` | 1-8 | `sanitizeHtml()` configuration allows `<iframe>` tags via `ADD_TAGS: ['iframe']`. While DOMPurify is used, allowing iframes means embedded content from arbitrary sources is possible. The `ADD_ATTR` list includes `allow`, `allowfullscreen`, but does NOT include `sandbox`. | 중간 | Either remove iframe from ADD_TAGS or add `sandbox` to permitted attributes and enforce a `sandbox` attribute in iframes. Alternatively, restrict iframe `src` to whitelisted domains. |
| 29 | `src/lib/sanitize.ts` | 10-18 | `sanitizeCss()` uses regex-based filtering which is inherently fragile. While the current patterns block obvious attacks, CSS injection via unicode escapes or unusual whitespace could bypass regex. | 중간 | Consider using a proper CSS parser/sanitizer library instead of regex. |

### 2.4 Upload Security

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 30 | `src/app/api/upload/route.ts` | 47 | File extension is extracted from user-provided filename (`file.name.split('.').pop()`). An attacker could upload a file named `malicious.jpg.php`. The MIME type check provides a first line of defense, but the extension saved is from the filename. | 중간 | Derive extension from validated MIME type instead of filename, or validate that extension matches the MIME type. |
| 31 | `src/app/api/upload/route.ts` | 34 | `image/svg+xml` is allowed in uploads. SVG files can contain embedded JavaScript, making them a common XSS vector when served from the same origin. | 높음 | Remove SVG from allowed upload types, or serve SVGs with `Content-Security-Policy` headers preventing script execution. |
| 32 | `src/app/api/upload/file/route.ts` | 25-93 | File upload only requires basic login (`session?.user`), not admin role. Any logged-in user can upload arbitrary documents (pdf, doc, zip, etc.) to the public uploads directory. | 중간 | Restrict file upload to admin/facilitator roles, or add rate limiting. |

### 2.5 API Exposure

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 33 | `src/app/club/(admin)/admin/export/route.ts` | 21-25 | The members export (`type=members`) exports ALL users with email addresses. While auth-gated, this is a significant data exposure if an account is compromised. There is no audit logging for exports. | 중간 | Add audit logging when data exports occur. Consider limiting exported fields. |
| 34 | `src/app/api/chat/route.ts` | 12-25 | Chat API does NOT require authentication (the session is fetched but a missing session only results in `userId` being undefined, not a 401). Any anonymous user can send messages to the AI chat. | 중간 | Either require authentication or implement rate limiting for anonymous users. |

---

## 3. Code Quality (코드 품질)

### 3.1 Code Duplication

| # | Files | Description | Priority | Suggested Fix |
|---|-------|-------------|----------|---------------|
| 35 | `src/app/club/(admin)/admin/programs/actions.ts` (L12-22), `src/app/club/(admin)/admin/resources/actions.ts` (L11-21), `src/app/club/(admin)/admin/members/actions.ts` (L11-21) | Three duplicated `checkAdminAuth()` functions with slightly different allowed roles (programs allows FACILITATOR, members does not). | 중간 | Extract to a shared utility: `checkAuth(allowedRoles: string[])` in `src/lib/club/auth-utils.ts`. |
| 36 | `src/lib/club/member-queries.ts` (L54-73), `src/lib/club/admin-queries.ts` (L15-31) | Attendance rate calculation logic is duplicated: fetch all attendance records, filter by status, compute percentage. This pattern appears at least 5 times across the codebase. | 중간 | Extract `calculateAttendanceRate(attendances)` utility function. |
| 37 | `src/components/club/admin/ProgramTable.tsx`, `src/components/club/admin/MemberTable.tsx` | Near-identical pagination UI code (prev/next buttons with the same styling). Both files have ~40 lines of duplicated pagination markup. | 낮음 | Extract a reusable `<Pagination>` component. |
| 38 | Multiple files in `src/lib/club/` | Hardcoded status labels like `PRESENT`, `LATE`, `ABSENT`, `EXCUSED` and type labels like `BOOKCLUB`, `SEMINAR`, `DEBATE` are duplicated across `export-utils.ts`, `ProgramTable.tsx`, `MemberTable.tsx`, and multiple query files. | 낮음 | Create a `src/lib/club/constants.ts` with centralized label maps. |

### 3.2 Type Safety Issues

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 39 | `src/lib/auth.ts` | 12 | `const providers: any[] = []` - The providers array uses `any` type. | 낮음 | Type as `Provider[]` from next-auth. |
| 40 | `src/lib/auth.ts` | 129-131, 148-152 | Multiple unsafe casts with `(user as { role?: string })` and `(session.user as { id?: string })`. The session/token types should be properly extended. | 중간 | Extend NextAuth types via module augmentation in `next-auth.d.ts`. |
| 41 | `src/lib/club/admin-queries.ts` | 88, 132, 237 | Multiple uses of `Record<string, unknown>` for building Prisma `where` clauses, bypassing type safety. | 중간 | Use Prisma's generated `Prisma.ProgramWhereInput` types. |
| 42 | `src/lib/actions/admin.ts` | 142, 235, 435, 500, 557, 642, 663, 995, 1021 | Extensive use of `any` type for `where` clauses throughout the admin actions file. | 중간 | Replace with properly typed Prisma where input types. |
| 43 | `src/lib/club/recap-queries.ts` | 44 | `avgAttendanceRate` is typed as `Float` in the schema but calculated as `Math.round()` (returning an integer). While this works, the schema type is misleading. | 낮음 | Either use `Int` in the schema or keep the float precision. |

### 3.3 Inconsistent Patterns

| # | Files | Description | Priority | Suggested Fix |
|---|-------|-------------|----------|---------------|
| 44 | Multiple files in `src/lib/club/` | Inconsistent imports: some files use `import prisma from '@/lib/db'` (default export) while others use `import { prisma } from '@/lib/db'` (named export). Both work because `db.ts` exports both, but this is inconsistent. Files using each style: Default: `admin-queries.ts`, `member-queries.ts`, `recap-queries.ts`, `recap-ai.ts`, `attendance-queries.ts`, `review-queries.ts`, `quote-queries.ts`, `program-admin-queries.ts`. Named: `queries.ts`, `program-queries.ts`, `my-bookshelf-queries.ts`, `stamp-queries.ts`, `book-queries.ts`. | 낮음 | Standardize on one import style across the project. |
| 45 | Server actions across club | Inconsistent error handling pattern: admin actions (`programs/actions.ts`, `resources/actions.ts`) return `{ error }` objects. User-facing actions (`attendance/actions.ts`, `quotes/actions.ts`, `timer/actions.ts`) throw errors. | 높음 | Standardize all server actions to return `{ error?: string, success?: boolean }` objects. |
| 46 | `src/app/club/(admin)/admin/programs/actions.ts` | L76-79 | The redirect-after-create pattern requires special handling of Next.js redirect errors (`if ('digest' in err) throw err`). This is a known Next.js pattern but fragile and easy to get wrong. | 낮음 | Consider using `redirect()` outside the try-catch block, or return the ID and redirect on the client. |

---

## 4. Performance Issues (성능 이슈)

### 4.1 N+1 Query Patterns

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 47 | `src/lib/club/member-queries.ts` | 52-88 | **Critical N+1 pattern.** `getAdminMembersExtended()` first fetches members (1 query), then for EACH member runs `Promise.all` with 2 additional queries (attendance + reports). For 20 members per page, this is 1 + 20*2 = 41 queries per page load. | 높음 | Restructure to use a single query with aggregations, or use Prisma's `$queryRaw` for the attendance rate calculation, or calculate attendance stats in a batch query. |
| 48 | `src/lib/club/member-queries.ts` | 113-121 | `getMemberDetail()` similarly runs separate queries for attendance and reports after the initial user fetch. Less critical since it is a single-user view. | 낮음 | Could be consolidated but lower impact since it is one user. |
| 49 | `src/lib/club/recap-queries.ts` | 21-76 | `generateProgramRecap()` runs 4 separate queries (program, attendances, bookReports count, quotes count). These could be partially consolidated. | 중간 | Use `include` with `_count` to reduce to fewer queries. |
| 50 | `src/app/club/(admin)/admin/export/route.ts` | 98-105 | Attendance export fetches ALL attendance records for a program with multiple nested includes. For programs with many sessions and participants, this could return very large result sets. | 중간 | Add pagination or streaming for large exports. |

### 4.2 Missing Image Optimization

| # | File | Line | Description | Priority | Suggested Fix |
|---|------|------|-------------|----------|---------------|
| 51 | `src/components/club/recap/RecapParticipants.tsx` | 57-60 | Uses `<img>` tag instead of `next/image` for participant avatars. | 중간 | Replace with `<Image>` from `next/image` with proper width/height. |
| 52 | `src/components/club/admin/MemberTable.tsx` | 103-105 | Uses `<img>` for member avatars in the admin table. | 중간 | Replace with `next/image`. |
| 53 | `src/components/club/admin/AddParticipantModal.tsx` | 106-108 | Uses `<img>` for user search result avatars. | 낮음 | Replace with `next/image`. |
| 54 | `src/components/club/admin/AdminHeader.tsx` | 55 | Uses `<img>` for admin user avatar. | 낮음 | Replace with `next/image`. |
| 55 | Multiple files across `src/components/admin/`, `src/app/community/`, `src/app/admin/` | At least 15+ instances of `<img>` instead of `next/image` across the broader codebase (admin themes, blog forms, cooperation sections, community reports, program forms, etc.). | 중간 | Systematic replacement with `next/image` for performance benefits. |

### 4.3 Missing Caching

| # | File | Description | Priority | Suggested Fix |
|---|------|-------------|----------|---------------|
| 56 | `src/lib/club/admin-queries.ts` | `getAdminStats()` makes 4 DB queries on every admin dashboard load. These statistics (total members, new members this week, etc.) do not change frequently. | 중간 | Add `unstable_cache` or implement a short TTL cache for dashboard statistics. |
| 57 | `src/lib/club/queries.ts` | `getMyStats()` runs 4 separate count queries. For the user dashboard, this could be cached per user. | 낮음 | Add per-user caching with revalidation on relevant mutations. |
| 58 | `src/lib/club/recap-queries.ts` | `getProgramRecap()` generates recap data on first access. Once generated, the data is stored in DB which is good. However, `getParticipantStats()` and `getProgramHighlights()` run fresh queries every time the recap page is loaded. | 중간 | Cache the participant stats and highlights in the ProgramRecap record, or use request-level caching. |

### 4.4 Large Bundle Concerns

| # | File | Description | Priority | Suggested Fix |
|---|------|-------------|----------|---------------|
| 59 | `src/components/editor/RichTextEditor.tsx` | Imports 18+ TipTap extensions. This is a very large client bundle. | 중간 | Lazy-load the editor with `dynamic(() => import(...), { ssr: false })` where it is used. |
| 60 | `src/lib/club/recap-ai.ts` | Imports `@google/generative-ai` at the module level. This SDK is loaded even if AI features are not used. | 낮음 | Use dynamic import (`await import(...)`) inside the function. |

---

## 5. UX/Accessibility (UX/접근성)

### 5.1 Missing Keyboard Navigation

| # | File | Description | Priority | Suggested Fix |
|---|------|-------------|----------|---------------|
| 61 | `src/components/club/admin/AddParticipantModal.tsx` | Modal does not trap focus. Pressing Tab can move focus behind the modal overlay. No Escape key handler to close the modal. | 중간 | Add focus trap, Escape key handler, and `role="dialog"` with `aria-modal="true"`. |
| 62 | `src/components/club/admin/RoleChangeModal.tsx` | Same modal accessibility issues as AddParticipantModal. | 중간 | Add focus trap and keyboard handlers. |
| 63 | `src/components/club/admin/ProgramTable.tsx` | Delete button (line 254-261) relies solely on mouse click and has `title="삭제"` but no visible label text. Screen readers read the title, but keyboard-only users may not know the button's purpose. | 낮음 | Add `aria-label="프로그램 삭제"` and ensure focus styling is visible. |

### 5.2 Missing ARIA Labels

| # | File | Description | Priority | Suggested Fix |
|---|------|-------------|----------|---------------|
| 64 | `src/components/club/` (all files) | Zero `aria-label`, `aria-describedby`, or `role` attributes found across ALL club components. This is a systemic accessibility gap. | 높음 | Add ARIA labels to all interactive elements: buttons, modals, forms, navigation, tables. |
| 65 | `src/components/club/admin/ProgramTable.tsx` | Filter `<select>` elements (line 141, 153) have no `<label>` or `aria-label`. Screen readers cannot identify what these dropdowns control. | 중간 | Add `aria-label="상태 필터"` and `aria-label="타입 필터"`. |
| 66 | `src/components/club/admin/MemberTable.tsx` | Action buttons (Eye, UserCog icons) at lines 163-175 only have `title` attributes. | 낮음 | Add `aria-label` to icon-only buttons. |
| 67 | `src/components/club/recap/RecapStats.tsx` | Stat cards are purely visual with no semantic markup. | 낮음 | Consider adding `role="status"` or `aria-label` for screen readers. |

### 5.3 Missing Form Validation Feedback

| # | File | Description | Priority | Suggested Fix |
|---|------|-------------|----------|---------------|
| 68 | `src/components/club/admin/ProgramForm.tsx` | Program creation form validation errors (if any) are not displayed inline next to the fields. Server action errors are returned but there is no visual feedback mechanism beyond `alert()`. | 중간 | Add inline error display with `aria-describedby` linking fields to error messages. |
| 69 | `src/components/club/bookclub/QuoteCard.tsx` / quote actions | Quote creation uses `throw new Error()` pattern which likely shows as an unhandled error on the client unless wrapped in try-catch by the caller. | 중간 | Show inline validation errors in the quote form. |

### 5.4 Mobile Responsiveness

| # | File | Description | Priority | Suggested Fix |
|---|------|-------------|----------|---------------|
| 70 | `src/components/club/admin/ProgramTable.tsx` | The admin table uses `overflow-x-auto` (line 181) which provides horizontal scrolling on mobile, but the table content is not optimized for small screens. 6 columns are always shown. | 중간 | Consider a card-based layout on mobile or hide less critical columns (type, session count) on small screens. |
| 71 | `src/components/club/admin/MemberTable.tsx` | Same issue - 7 columns in the member table on all screen sizes. | 중간 | Responsive table or card layout for mobile. |
| 72 | `src/components/club/admin/AttendanceTable.tsx` | Attendance tables can be very wide (one column per session). No responsive handling documented. | 중간 | Add horizontal scroll indicators or collapsible session columns. |

---

## 6. DB Schema Issues (DB 스키마)

### 6.1 Missing Indexes

| # | Model | Description | Priority | Suggested Fix |
|---|-------|-------------|----------|---------------|
| 73 | `ProgramAttendance` | Only has `@@index([qrTokenId])` and the `@@unique([sessionId, participantId])` compound index. Missing individual index on `participantId` which is used in member detail queries (`where: { participant: { userId } }`). These queries must scan through all attendance records without an efficient path. | 높음 | Add `@@index([participantId])` and `@@index([sessionId])`. |
| 74 | `ProgramParticipant` | Has `@@unique([programId, userId])` but no individual indexes on `programId` or `userId`. Many queries filter by `userId` alone (e.g., `getClubPrograms`, `getMyAttendanceSummary`). | 높음 | Add `@@index([userId])` and `@@index([programId])`. |
| 75 | `ProgramSession` | No indexes at all. Frequently queried by `programId` and ordered by `date` or `sessionNo`. | 높음 | Add `@@index([programId])`, `@@index([programId, date])`, and `@@index([date])`. |
| 76 | `Notification` | Has relation to User but no indexes. Notifications are queried by `userId` with `isRead` filter. | 중간 | Add `@@index([userId, isRead])` and `@@index([userId, createdAt])`. |
| 77 | `ProgramRecap` | Has `programId @unique` which serves as an index. This is sufficient for current access patterns. | -- | No change needed. |
| 78 | `FacilitatorResource` | No indexes. Queried by `sessionId` and ordered by `createdAt`. | 중간 | Add `@@index([sessionId])` and `@@index([createdAt])`. |
| 79 | `ProgramReport` | No indexes visible. Queried by `sessionId` and `participantId`. | 중간 | Add `@@index([sessionId])` and `@@index([participantId])`. |

### 6.2 Data Integrity Concerns

| # | Model/Field | Description | Priority | Suggested Fix |
|---|-------------|-------------|----------|---------------|
| 80 | `User.role` | Stored as `String` instead of an enum. Any arbitrary string can be written. The validation in `members/actions.ts` checks against `VALID_ROLES` but does not include `SUPER_ADMIN` in the allowed values for changes -- this means once someone is SUPER_ADMIN, their role cannot be changed through the UI (which may be intentional but is not explicit). | 중간 | Consider using a Prisma enum for role, or add a CHECK constraint at the DB level. |
| 81 | `Program.status` | Stored as `String` without enum constraint. Currently accepts any string value. Actions do not validate status transitions (e.g., a COMPLETED program could be set back to DRAFT). | 중간 | Use a Prisma enum and implement state machine validation for status transitions. |
| 82 | `Program.type` | Stored as `String` without constraint. The UI shows three types (BOOKCLUB, SEMINAR, DEBATE) but the DB accepts anything. | 낮음 | Use a Prisma enum. |
| 83 | `ProgramParticipant` | No `onDelete` cascade from User. If a user is deleted, their participant records become orphaned with invalid `userId` references. The relation declaration on line 963 shows `user User @relation(...)` without `onDelete: Cascade`. | 중간 | Add `onDelete: Cascade` or `onDelete: SetNull` to prevent orphaned records. |
| 84 | `ProgramRecap.avgAttendanceRate` | Stored as `Float` but calculated as integer `Math.round()`. The schema type suggests decimal precision that is never used. | 낮음 | Change to `Int` to match actual usage, or store the precise float. |
| 85 | `ProgramRecap` | The recap is auto-generated on first access and never automatically updated. If new attendance records are added or book reports are written after the recap is generated, the data becomes stale. There is no mechanism to invalidate/regenerate. | 중간 | Add a `regenerateRecap()` function, or add an admin action to manually refresh, or auto-invalidate when related data changes. |
| 86 | `ProgramSession.sessionNo` | Not unique within a program. The `addSession` action auto-increments based on the last session, but if concurrent requests occur, duplicate session numbers could be created. | 낮음 | Add `@@unique([programId, sessionNo])` to the schema. |

### 6.3 Relationship Issues

| # | Model | Description | Priority | Suggested Fix |
|---|-------|-------------|----------|---------------|
| 87 | `BookReport` / `Quote` linking to Programs | `generateProgramRecap()` counts quotes by matching `bookTitle` strings from sessions. This is fragile -- if a session's bookTitle is edited, the quote count changes. There is no direct foreign key linking quotes to programs. | 중간 | Consider adding a `programId` or `sessionId` to the Quote model for direct linking. |
| 88 | `ProgramRecap` -> `Program` | The recap has a one-to-one relationship with the program via `programId @unique`. However, there is no mechanism to delete the recap when a program is deleted (though `onDelete: Cascade` is correctly set). | -- | No change needed, cascade is correctly configured. |

---

## 7. Summary Statistics

### By Priority

| Priority | Count |
|----------|-------|
| 높음 (High) | 14 |
| 중간 (Medium) | 50 |
| 낮음 (Low) | 21 |
| **Total** | **85** |

### By Category

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Missing Features | 3 | 8 | 3 | 14 |
| Security | 6 | 10 | 3 | 19 |
| Code Quality | 1 | 6 | 6 | 13 |
| Performance | 2 | 8 | 4 | 14 |
| UX/Accessibility | 1 | 9 | 5 | 15 |
| DB Schema | 3 | 6 | 4 | 13 |

### Critical Items Requiring Immediate Attention

1. **[#16] `manualCheckIn()` missing auth check** -- Any logged-in user can mark attendance for anyone.
2. **[#17] `generateSessionQR()` missing auth check** -- Any logged-in user can generate QR codes.
3. **[#18] `saveSpeakingTimes()` missing auth check** -- Any logged-in user can save speaking times.
4. **[#27] JSON-LD XSS via `</script>` injection** -- Potential script breakout in structured data.
5. **[#31] SVG upload allowed** -- SVG files can contain JavaScript, enabling stored XSS.
6. **[#47] N+1 queries in `getAdminMembersExtended()`** -- 41+ queries per admin page load.
7. **[#73-75] Missing DB indexes on ProgramAttendance, ProgramParticipant, ProgramSession** -- High-traffic tables without proper indexes.
8. **[#45] Inconsistent error handling** -- Server actions mix throw vs return patterns, causing unpredictable client behavior.
9. **[#64] Zero ARIA labels across club components** -- Systemic accessibility failure.
10. **[#6] No loading states for admin sub-routes** -- Poor perceived performance during navigation.

---

*End of Report*
