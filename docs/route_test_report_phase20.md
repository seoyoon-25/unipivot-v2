# Comprehensive Route Access Test Report - Phase 20

**Date:** 2026-01-31
**Application:** UniHome v2 (Next.js App Router)
**Base Path:** `/var/www/unihome-v2/src/app/`
**Total Routes Found:** 197 (109 pages + 88+ API routes)

---

## Summary

| Section | Pages | API Routes | Error Boundary | Loading State | Not-Found |
|---------|-------|------------|----------------|---------------|-----------|
| Root (`/`) | - | - | YES | NO | YES |
| Public `(public)` | 39 | - | YES (via layout ErrorBoundary) | YES | NO |
| Auth `(auth)` | 5 | 6 | NO | NO | NO |
| Member `(member)` | 13 | 3 | NO | NO | NO |
| Club `/club` | 32 | 0 | YES | YES | NO |
| Admin `/admin` | 95 | 88+ | YES | YES (partial) | NO |
| Lab `/lab` | 8 | 7 | NO | NO | NO |
| Mypage `/mypage` | 9 | - | NO | NO | NO |
| Attendance `/attendance` | 3 | 2 | NO | NO | NO |
| Standalone | 4 | 6+ | NO | NO | NO |

---

## 1. Public Pages (`/`)

All public pages are under the `(public)` route group, which provides:
- Layout: `src/app/(public)/layout.tsx` -- includes Navbar, Footer, ChatbotButton, ErrorBoundary wrappers, PopupDisplay, FloatingButtons, Banners
- Loading: `src/app/(public)/loading.tsx` -- skeleton loading UI
- Auth: No auth required (public access)

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/` | `(public)/page.tsx` | OK | Homepage with Hero, Programs, Stories, Instagram, BulletinBoard. force-dynamic |
| `/about` | `(public)/about/page.tsx` | OK | About page with dynamic data from DB |
| `/programs` | `(public)/programs/page.tsx` | OK | Program listing with filters. force-dynamic |
| `/programs/[slug]` | `(public)/programs/[slug]/page.tsx` | OK | Program detail with metadata. Uses notFound() |
| `/programs/[slug]/apply` | `(public)/programs/[slug]/apply/page.tsx` | OK | Application form. Auth required. Uses redirect |
| `/programs/[slug]/apply/complete` | `(public)/programs/[slug]/apply/complete/page.tsx` | OK | Application completion page |
| `/programs/[slug]/book-survey` | `(public)/programs/[slug]/book-survey/page.tsx` | OK | Book survey form. Auth required |
| `/blog` | `(public)/blog/page.tsx` | OK | Blog listing. force-dynamic |
| `/blog/[slug]` | `(public)/blog/[slug]/page.tsx` | OK | Blog post detail. Uses notFound(), sanitizeHtml |
| `/notice` | `(public)/notice/page.tsx` | OK | Notice board listing. force-dynamic |
| `/notice/[id]` | `(public)/notice/[id]/page.tsx` | OK | Notice detail. Admin edit link conditional |
| `/notice/write` | `(public)/notice/write/page.tsx` | WARNING | Client component with admin check. Write notice page exposed on public route |
| `/notice/[id]/edit` | `(public)/notice/[id]/edit/page.tsx` | WARNING | Client component with session check. Edit notice on public route |
| `/reports` | `(public)/reports/page.tsx` | OK | Public book reports listing |
| `/reports/[id]` | `(public)/reports/[id]/page.tsx` | OK | Report detail with interactions |
| `/cooperation` | `(public)/cooperation/page.tsx` | OK | Cooperation hub page. force-dynamic, revalidate=60 |
| `/cooperation/consulting/apply` | `(public)/cooperation/consulting/apply/page.tsx` | OK | Consulting application form (client) |
| `/cooperation/survey/apply` | `(public)/cooperation/survey/apply/page.tsx` | OK | Survey application form (client) |
| `/cooperation/lecturer/apply` | `(public)/cooperation/lecturer/apply/page.tsx` | OK | Lecturer application form (client) |
| `/donate` | `(public)/donate/page.tsx` | OK | Donation page with form. force-dynamic |
| `/talent` | `(public)/talent/page.tsx` | OK | Talent sharing page. force-dynamic |
| `/bookclub` | `(public)/bookclub/page.tsx` | OK | Book club programs listing. force-dynamic |
| `/books` | `(public)/books/page.tsx` | OK | Book suggestions with voting. Uses checkPageAccess |
| `/bookshelf` | `(public)/bookshelf/page.tsx` | OK | Bookshelf with filters |
| `/experts` | `(public)/experts/page.tsx` | OK | Expert pool display. force-dynamic, static data |
| `/seminar` | `(public)/seminar/page.tsx` | OK | Seminar programs listing. force-dynamic |
| `/kmove` | `(public)/kmove/page.tsx` | OK | K-Move field trip programs. force-dynamic |
| `/korea-issue` | `(public)/korea-issue/page.tsx` | OK | Korea issue AI chatbot topics. force-dynamic |
| `/request` | `(public)/request/page.tsx` | OK | Lecture request info page. force-dynamic |
| `/suggest` | `(public)/suggest/page.tsx` | OK | Suggestion/idea submission. force-dynamic |
| `/privacy` | `(public)/privacy/page.tsx` | OK | Privacy policy static page |
| `/terms` | `(public)/terms/page.tsx` | OK | Terms of service static page |
| `/p/about-us` | `(public)/p/about-us/page.tsx` | OK | Organization intro page. force-dynamic |
| `/p/history` | `(public)/p/history/page.tsx` | OK | History timeline page. force-dynamic |
| `/p/[slug]` | `(public)/p/[slug]/page.tsx` | OK | Dynamic CMS page. Uses sanitizeHtml, sanitizeCss, notFound() |
| `/simple` | `(public)/simple/page.tsx` | WARNING | Test page with inline styles. Should be removed in production |
| `/debug` | `(public)/debug/page.tsx` | WARNING | Debug page with dangerouslySetInnerHTML. Must be removed in production |
| `/demo/walking-loader` | `(public)/demo/walking-loader/page.tsx` | WARNING | Demo component showcase. Should be removed in production |

---

## 2. Auth Pages (`(auth)`)

Layout: `src/app/(auth)/layout.tsx` -- Split screen with decorative left side.
Auth: No auth middleware; pages handle their own redirect logic.

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/login` | `(auth)/login/page.tsx` | OK | Client component with Suspense for useSearchParams |
| `/register` | `(auth)/register/page.tsx` | OK | Multi-step registration form |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | OK | Password reset request form |
| `/reset-password` | `(auth)/reset-password/page.tsx` | OK | Password reset with token. Uses Suspense |
| `/complete-profile` | `(auth)/complete-profile/page.tsx` | OK | Post-registration profile completion. Uses Suspense |

---

## 3. Member Pages (`(member)/my/*`)

Layout: `src/app/(member)/layout.tsx` -- Sidebar with navigation, mobile bottom nav.
Auth: Individual pages check session and redirect to /login.
**Note:** No layout-level auth check -- each page must handle its own auth.

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/my` | `(member)/my/page.tsx` | OK | Dashboard with stats. Redirects if no session |
| `/my/profile` | `(member)/my/profile/page.tsx` | OK | User profile page |
| `/my/programs` | `(member)/my/programs/page.tsx` | OK | User's enrolled programs |
| `/my/reports` | `(member)/my/reports/page.tsx` | OK | User's book reports |
| `/my/reports/new` | `(member)/my/reports/new/page.tsx` | OK | New report form. Auth redirect |
| `/my/reports/[id]` | `(member)/my/reports/[id]/page.tsx` | OK | Report detail |
| `/my/points` | `(member)/my/points/page.tsx` | OK | Points/rewards page |
| `/my/settings` | `(member)/my/settings/page.tsx` | OK | User settings |
| `/my/notifications` | `(member)/my/notifications/page.tsx` | OK | Notification center |
| `/my/accounts` | `(member)/my/accounts/page.tsx` | OK | Bank account management |
| `/my/applications` | `(member)/my/applications/page.tsx` | OK | Application history |
| `/my/likes` | `(member)/my/likes/page.tsx` | OK | Liked items |
| `/survey/[id]` | `(member)/survey/[id]/page.tsx` | OK | Survey response form (client component) |

---

## 4. Club Pages (`/club/*`)

Layout: `src/app/club/layout.tsx` -- ClubHeader, ClubSidebar, ClubBottomNav.
Error: `src/app/club/error.tsx` -- Orange-themed error boundary.
Loading: `src/app/club/loading.tsx` -- Club skeleton UI.

### 4a. Club Public/General Pages

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/club` | `club/page.tsx` | OK | Club dashboard with stats. Uses getServerSession |
| `/club/unauthorized` | `club/unauthorized/page.tsx` | OK | Unauthorized access page with role messages |
| `/club/onboarding` | `club/onboarding/page.tsx` | OK | New member onboarding. Auth redirect |
| `/club/attendance` | `club/attendance/page.tsx` | OK | Attendance status. Auth redirect |
| `/club/attendance/scan` | `club/attendance/scan/page.tsx` | OK | QR scan for attendance |
| `/club/programs/[id]/recap` | `club/programs/[id]/recap/page.tsx` | OK | Season recap page. Uses notFound() |

### 4b. Club Bookclub Pages (`/club/bookclub/*`)

Layout: `src/app/club/bookclub/layout.tsx` -- Metadata-only layout.

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/club/bookclub` | `club/bookclub/page.tsx` | OK | Redirects to /club/bookclub/bookshelf |
| `/club/bookclub/bookshelf` | `club/bookclub/bookshelf/page.tsx` | OK | Book collection with filters |
| `/club/bookclub/bookshelf/[bookId]` | `club/bookclub/bookshelf/[bookId]/page.tsx` | OK | Book detail page |
| `/club/bookclub/my-bookshelf` | `club/bookclub/my-bookshelf/page.tsx` | OK | Personal bookshelf |
| `/club/bookclub/reviews` | `club/bookclub/reviews/page.tsx` | OK | Book reviews listing |
| `/club/bookclub/reviews/[reviewId]` | `club/bookclub/reviews/[reviewId]/page.tsx` | OK | Review detail |
| `/club/bookclub/reviews/write` | `club/bookclub/reviews/write/page.tsx` | OK | Write new review |
| `/club/bookclub/quotes` | `club/bookclub/quotes/page.tsx` | OK | Notable quotes collection |
| `/club/bookclub/stamps` | `club/bookclub/stamps/page.tsx` | OK | Stamp card. Auth redirect |

### 4c. Club Protected Pages (`/club/(protected)/*`)

Layout: `src/app/club/(protected)/layout.tsx` -- Auth check, redirects to login.

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/club/my` | `club/(protected)/my/page.tsx` | OK | Personal club page. Session check |
| `/club/programs` | `club/(protected)/programs/page.tsx` | OK | My club programs list |

### 4d. Club Facilitator Pages (`/club/(facilitator)/*`)

Layout: `src/app/club/(facilitator)/layout.tsx` -- Auth + role check (minimum FACILITATOR).

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/club/facilitator` | `club/(facilitator)/facilitator/page.tsx` | OK | Facilitator tools dashboard |
| `/club/facilitator/attendance` | `club/(facilitator)/facilitator/attendance/page.tsx` | OK | Attendance management |
| `/club/facilitator/attendance/qr` | `club/(facilitator)/facilitator/attendance/qr/page.tsx` | OK | QR code generation |
| `/club/facilitator/timer` | `club/(facilitator)/facilitator/timer/page.tsx` | OK | Session timer tool |
| `/club/facilitator/questions` | `club/(facilitator)/facilitator/questions/page.tsx` | OK | Discussion questions |
| `/club/facilitator/resources` | `club/(facilitator)/facilitator/resources/page.tsx` | OK | Facilitator resources |

### 4e. Club Admin Pages (`/club/(admin)/admin/*`)

Layout: `src/app/club/(admin)/layout.tsx` -- Auth + role check (ADMIN, SUPER_ADMIN, FACILITATOR).
Includes AdminSidebar, AdminHeader.

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/club/admin` | `club/(admin)/admin/page.tsx` | OK | Admin dashboard with stats |
| `/club/admin/programs` | `club/(admin)/admin/programs/page.tsx` | OK | Program management |
| `/club/admin/programs/new` | `club/(admin)/admin/programs/new/page.tsx` | OK | Create new program |
| `/club/admin/programs/[id]/edit` | `club/(admin)/admin/programs/[id]/edit/page.tsx` | OK | Edit program |
| `/club/admin/attendance` | `club/(admin)/admin/attendance/page.tsx` | OK | Attendance management |
| `/club/admin/resources` | `club/(admin)/admin/resources/page.tsx` | OK | Resource management |
| `/club/admin/resources/upload` | `club/(admin)/admin/resources/upload/page.tsx` | OK | Upload resources |
| `/club/admin/members` | `club/(admin)/admin/members/page.tsx` | OK | Member management |
| `/club/admin/members/[userId]` | `club/(admin)/admin/members/[userId]/page.tsx` | OK | Member detail |

---

## 5. Admin Pages (`/admin/*`)

Layout: `src/app/admin/layout.tsx` -- Full admin panel with sidebar. Auth check (ADMIN/SUPER_ADMIN only).
Error: `src/app/admin/error.tsx` -- Red-themed error boundary.
Loading: `src/app/admin/loading.tsx` -- Admin skeleton with stat cards + table.
Sub-loading: `admin/programs/loading.tsx`, `admin/members/loading.tsx`

### 5a. Admin Dashboard & Members

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin` | `admin/page.tsx` | OK | Dashboard with comprehensive stats |
| `/admin/members` | `admin/members/page.tsx` | OK | Member list with search/filter. Suspense |
| `/admin/members/[id]` | `admin/members/[id]/page.tsx` | OK | Member detail/edit |
| `/admin/members/new` | `admin/members/new/page.tsx` | OK | Create new member |
| `/admin/members/blacklist` | `admin/members/blacklist/page.tsx` | OK | Blacklisted members |
| `/admin/interests` | `admin/interests/page.tsx` | OK | Interest management |

### 5b. Admin Programs

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/programs` | `admin/programs/page.tsx` | OK | Programs grouped view |
| `/admin/programs/new` | `admin/programs/new/page.tsx` | OK | Create new program |
| `/admin/programs/order` | `admin/programs/order/page.tsx` | OK | Program ordering |
| `/admin/programs/forms` | `admin/programs/forms/page.tsx` | OK | Application forms |
| `/admin/programs/[id]` | `admin/programs/[id]/page.tsx` | OK | Program detail |
| `/admin/programs/[id]/edit` | `admin/programs/[id]/edit/page.tsx` | OK | Edit program |
| `/admin/programs/[id]/applications` | `admin/programs/[id]/applications/page.tsx` | OK | Applications list |
| `/admin/programs/[id]/sessions/[sessionId]/qr` | `admin/programs/[id]/sessions/[sessionId]/qr/page.tsx` | OK | QR code for session |
| `/admin/programs/[id]/reports` | `admin/programs/[id]/reports/page.tsx` | OK | Program reports |
| `/admin/programs/[id]/session-reports` | `admin/programs/[id]/session-reports/page.tsx` | OK | Session reports |
| `/admin/programs/[id]/absences` | `admin/programs/[id]/absences/page.tsx` | OK | Absence management |
| `/admin/programs/[id]/deposit-settings` | `admin/programs/[id]/deposit-settings/page.tsx` | OK | Deposit config |
| `/admin/programs/[id]/refund` | `admin/programs/[id]/refund/page.tsx` | OK | Refund management |
| `/admin/programs/[id]/surveys/create` | `admin/programs/[id]/surveys/create/page.tsx` | OK | Create survey |
| `/admin/programs/[id]/facilitator-checklist` | `admin/programs/[id]/facilitator-checklist/page.tsx` | OK | Facilitator checklist |

### 5c. Admin Surveys

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/surveys` | `admin/surveys/page.tsx` | OK | Survey management |
| `/admin/surveys/[id]/results` | `admin/surveys/[id]/results/page.tsx` | OK | Survey results |
| `/admin/surveys/[id]/reminders` | `admin/surveys/[id]/reminders/page.tsx` | OK | Survey reminders |

### 5d. Admin Cooperation

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/cooperation` | `admin/cooperation/page.tsx` | OK | Cooperation overview |
| `/admin/cooperation/consulting` | `admin/cooperation/consulting/page.tsx` | OK | Consulting requests |
| `/admin/cooperation/lecturer` | `admin/cooperation/lecturer/page.tsx` | OK | Lecturer requests |
| `/admin/cooperation/survey` | `admin/cooperation/survey/page.tsx` | OK | Survey requests |
| `/admin/cooperation/sections` | `admin/cooperation/sections/page.tsx` | OK | Section management |

### 5e. Admin Research Lab

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/lab` | `admin/lab/page.tsx` | OK | Lab overview |
| `/admin/lab/experts` | `admin/lab/experts/page.tsx` | OK | Expert management |
| `/admin/lab/surveys` | `admin/lab/surveys/page.tsx` | OK | Survey management |
| `/admin/lab/trends` | `admin/lab/trends/page.tsx` | OK | Research trends |
| `/admin/lab/participations` | `admin/lab/participations/page.tsx` | OK | Research participations |
| `/admin/lab/reward-claims` | `admin/lab/reward-claims/page.tsx` | OK | Reward claims |

### 5f. Admin Business

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/business` | `admin/business/page.tsx` | OK | Business overview |
| `/admin/business/calendar` | `admin/business/calendar/page.tsx` | OK | Calendar management |
| `/admin/business/projects` | `admin/business/projects/page.tsx` | OK | Project management |
| `/admin/business/partners` | `admin/business/partners/page.tsx` | OK | Partner management |
| `/admin/business/documents` | `admin/business/documents/page.tsx` | OK | Document management |

### 5g. Admin Finance

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/finance` | `admin/finance/page.tsx` | OK | Finance overview |
| `/admin/finance/transactions` | `admin/finance/transactions/page.tsx` | OK | Transaction list |
| `/admin/finance/accounts` | `admin/finance/accounts/page.tsx` | OK | Account management |
| `/admin/finance/funds` | `admin/finance/funds/page.tsx` | OK | Fund management |
| `/admin/finance/deposits` | `admin/finance/deposits/page.tsx` | OK | Deposit management |
| `/admin/finance/refunds` | `admin/finance/refunds/page.tsx` | OK | Refund management |
| `/admin/finance/donations` | `admin/finance/donations/page.tsx` | OK | Donation management |
| `/admin/finance/reports` | `admin/finance/reports/page.tsx` | OK | Financial reports |
| `/admin/finance/projects` | `admin/finance/projects/page.tsx` | OK | Finance projects |
| `/admin/finance/projects/new` | `admin/finance/projects/new/page.tsx` | OK | New finance project |
| `/admin/finance/projects/[id]` | `admin/finance/projects/[id]/page.tsx` | OK | Finance project detail |

### 5h. Admin Content

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/contents` | `admin/contents/page.tsx` | OK | Content overview |
| `/admin/contents/notices` | `admin/contents/notices/page.tsx` | OK | Notice management |
| `/admin/contents/blog` | `admin/contents/blog/page.tsx` | OK | Blog management |
| `/admin/books` | `admin/books/page.tsx` | OK | Book management |
| `/admin/books/new` | `admin/books/new/page.tsx` | OK | Add new book |
| `/admin/books/[id]` | `admin/books/[id]/page.tsx` | OK | Edit book |

### 5i. Admin AI

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/ai` | `admin/ai/page.tsx` | OK | AI overview |
| `/admin/ai/chatbot` | `admin/ai/chatbot/page.tsx` | OK | Chatbot management |
| `/admin/ai/knowledge` | `admin/ai/knowledge/page.tsx` | OK | Knowledge base |

### 5j. Admin Design

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/design` | `admin/design/page.tsx` | OK | Design dashboard |
| `/admin/design/theme` | `admin/design/theme/page.tsx` | OK | Theme customization |
| `/admin/design/banners` | `admin/design/banners/page.tsx` | OK | Banner management |
| `/admin/design/popups` | `admin/design/popups/page.tsx` | OK | Popup management |
| `/admin/design/seo` | `admin/design/seo/page.tsx` | OK | SEO settings |
| `/admin/design/pages` | `admin/design/pages/page.tsx` | OK | CMS page list |
| `/admin/design/pages/[id]` | `admin/design/pages/[id]/page.tsx` | OK | CMS page editor |
| `/admin/design/cards` | `admin/design/cards/page.tsx` | OK | Card design |
| `/admin/design/menus` | `admin/design/menus/page.tsx` | OK | Menu management |
| `/admin/design/custom-code` | `admin/design/custom-code/page.tsx` | OK | Custom code injection |
| `/admin/design/floating-buttons` | `admin/design/floating-buttons/page.tsx` | OK | Floating buttons |
| `/admin/design/announcement-banner` | `admin/design/announcement-banner/page.tsx` | OK | Announcement banner |
| `/admin/design/fonts` | `admin/design/fonts/page.tsx` | OK | Font management |
| `/admin/design/history` | `admin/design/history/page.tsx` | OK | Design change history |
| `/admin/design/about` | `admin/design/about/page.tsx` | OK | About page editor |
| `/admin/design/sections` | `admin/design/sections/page.tsx` | OK | Section management |

### 5k. Admin Notifications & Settings

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/notifications` | `admin/notifications/page.tsx` | OK | Notification management |
| `/admin/notifications/templates` | `admin/notifications/templates/page.tsx` | OK | Notification templates |
| `/admin/notifications/logs` | `admin/notifications/logs/page.tsx` | OK | Notification logs |
| `/admin/settings` | `admin/settings/page.tsx` | OK | General settings |
| `/admin/settings/admins` | `admin/settings/admins/page.tsx` | OK | Admin user management |
| `/admin/settings/migration` | `admin/settings/migration/page.tsx` | OK | Data migration |
| `/admin/settings/backup` | `admin/settings/backup/page.tsx` | OK | Backup management |
| `/admin/settings/fonts` | `admin/settings/fonts/page.tsx` | OK | Font settings |

### 5l. Admin Misc

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/admin/popups` | `admin/popups/page.tsx` | WARNING | May be duplicate of /admin/design/popups |
| `/admin/seo` | `admin/seo/page.tsx` | WARNING | May be duplicate of /admin/design/seo |
| `/admin/banners` | `admin/banners/page.tsx` | WARNING | May be duplicate of /admin/design/banners |
| `/admin/themes` | `admin/themes/page.tsx` | WARNING | May be duplicate of /admin/design/theme |
| `/admin/history` | `admin/history/page.tsx` | WARNING | May be duplicate of /admin/design/history |
| `/admin/floating-buttons` | `admin/floating-buttons/page.tsx` | WARNING | May be duplicate of /admin/design/floating-buttons |
| `/admin/custom-code` | `admin/custom-code/page.tsx` | WARNING | May be duplicate of /admin/design/custom-code |
| `/admin/pages` | `admin/pages/page.tsx` | WARNING | May be duplicate of /admin/design/pages |
| `/admin/pages/[id]` | `admin/pages/[id]/page.tsx` | WARNING | May be duplicate of /admin/design/pages/[id] |
| `/admin/media` | `admin/media/page.tsx` | OK | Media management |
| `/admin/preview` | `admin/preview/page.tsx` | OK | Design preview |

---

## 6. Lab Pages (`/lab/*`)

Layout: `src/app/lab/layout.tsx` -- LabNavigation, LabFooter. Separate branding (lab.bestcome.org).
Auth: No layout-level auth. Individual pages handle auth where needed.

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/lab` | `lab/page.tsx` | OK | Lab landing page with feature links |
| `/lab/profile` | `lab/profile/page.tsx` | OK | User profile for lab |
| `/lab/experts` | `lab/experts/page.tsx` | OK | Expert listing with categories. force-dynamic |
| `/lab/experts/[id]` | `lab/experts/[id]/page.tsx` | OK | Expert detail |
| `/lab/experts/register` | `lab/experts/register/page.tsx` | OK | Expert registration |
| `/lab/surveys` | `lab/surveys/page.tsx` | OK | Survey/interview listing. force-dynamic |
| `/lab/surveys/[id]` | `lab/surveys/[id]/page.tsx` | OK | Survey detail |
| `/lab/trends` | `lab/trends/page.tsx` | OK | Research trends. force-dynamic |

---

## 7. Mypage Pages (`/mypage/*`) -- Legacy

**Note:** These appear to be legacy routes. The newer member pages are under `(member)/my/*`.
No layout file found for `/mypage`. No error boundary or loading state.

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/mypage/programs/[programId]` | `mypage/programs/[programId]/page.tsx` | WARNING | Legacy route. Client component. No layout |
| `/mypage/programs/[programId]/sessions/[sessionId]` | `mypage/.../sessions/[sessionId]/page.tsx` | WARNING | Legacy route. No layout |
| `/mypage/programs/[programId]/sessions/[sessionId]/review/write` | `mypage/.../review/write/page.tsx` | WARNING | Legacy route. No layout |
| `/mypage/programs/[programId]/sessions/[sessionId]/absence` | `mypage/.../absence/page.tsx` | WARNING | Legacy route. No layout |
| `/mypage/programs/[programId]/sessions/[sessionId]/qr` | `mypage/.../qr/page.tsx` | WARNING | Legacy route. No layout |
| `/mypage/programs/[programId]/sessions/[sessionId]/report` | `mypage/.../report/page.tsx` | WARNING | Legacy route. No layout |
| `/mypage/settings/notifications` | `mypage/settings/notifications/page.tsx` | WARNING | Legacy route. No layout |
| `/mypage/settings/bank-account` | `mypage/settings/bank-account/page.tsx` | WARNING | Legacy route. No layout |
| `/mypage/profile` | `mypage/profile/page.tsx` | WARNING | Legacy route. No layout |

---

## 8. Standalone Pages

These pages are outside any route group, with no dedicated layout, error boundary, or loading state.

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/attendance/check` | `attendance/check/page.tsx` | OK | QR attendance check-in. Client component with Suspense |
| `/attendance/[code]` | `attendance/[code]/page.tsx` | OK | QR code attendance page. Auth redirect |
| `/attendance/scan` | `attendance/scan/page.tsx` | OK | QR scanner. Client component with Suspense |
| `/preview/[sessionKey]` | `preview/[sessionKey]/page.tsx` | OK | Design preview page. Client component |
| `/rsvp/[rsvpId]` | `rsvp/[rsvpId]/page.tsx` | OK | RSVP response page. Uses Suspense, notFound() |
| `/sessions/[sessionId]/blog/edit/[postId]` | `sessions/.../edit/[postId]/page.tsx` | OK | Blog post editor for sessions. Client component |

---

## 9. API Endpoints (`/api/*`)

### 9a. Auth API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/auth/[...nextauth]` | GET, POST | OK | NextAuth.js handler |
| `/api/auth/register` | POST | OK | User registration |
| `/api/auth/forgot-password` | POST | OK | Password reset request |
| `/api/auth/reset-password` | POST | OK | Password reset with token |
| `/api/auth/change-password` | POST | OK | Password change (authenticated) |
| `/api/auth/complete-profile` | POST | OK | Profile completion |

### 9b. Public API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/public/site-config` | GET | OK | Public site configuration |
| `/api/public/banners` | GET | OK | Public banner data |
| `/api/public/theme` | GET | OK | Public theme data |

### 9c. Programs API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/programs/apply` | POST | OK | Program application |
| `/api/programs/by-slug/[slug]` | GET | OK | Get program by slug |
| `/api/programs/[id]/apply` | POST | OK | Apply to specific program |
| `/api/programs/[id]/like` | POST | OK | Like/unlike program |
| `/api/programs/[id]/deposit` | GET/POST | OK | Deposit management |
| `/api/programs/[id]/reports` | GET | OK | Program reports |
| `/api/programs/[id]/attendance` | GET/POST | OK | Attendance tracking |
| `/api/programs/[id]/sessions` | GET/POST | OK | Session management |
| `/api/programs/[id]/sessions/[sessionId]` | GET/PUT/DELETE | OK | Individual session |
| `/api/programs/[id]/participants` | GET | OK | Participant list |
| `/api/programs/[id]/book-survey` | GET/POST | OK | Book survey |

### 9d. Reports API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/reports` | GET/POST | OK | Reports CRUD |
| `/api/reports/session` | POST | OK | Session reports |
| `/api/reports/templates` | GET | OK | Report templates |
| `/api/reports/[id]/like` | POST | OK | Like report |
| `/api/reports/[id]/comment` | POST | OK | Comment on report |
| `/api/reports/[id]/comment/[commentId]` | PUT/DELETE | OK | Edit/delete comment |
| `/api/reports/[id]/comments` | GET/POST | OK | Report comments |
| `/api/reports/[id]/comments/[commentId]` | PUT/DELETE | WARNING | Duplicate of /api/reports/[id]/comment/[commentId] |

### 9e. Notifications API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/notifications` | GET | OK | List notifications |
| `/api/notifications/[id]` | PUT/DELETE | OK | Manage notification |
| `/api/notifications/read` | POST | OK | Mark notifications as read |

### 9f. Lab API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/lab/categories` | GET | OK | Expert categories |
| `/api/lab/profile` | GET/PUT | OK | Lab user profile |
| `/api/lab/experts/register` | POST | OK | Expert registration |
| `/api/lab/surveys` | GET | OK | Survey listing |
| `/api/lab/surveys/[id]/apply` | POST | OK | Apply to survey |
| `/api/lab/surveys/[id]/claim` | POST | OK | Claim survey reward |

### 9g. Finance API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/finance/summary` | GET | OK | Financial summary |
| `/api/finance/transactions` | GET/POST | OK | Transaction CRUD |
| `/api/finance/transactions/[id]` | PUT/DELETE | OK | Transaction detail |
| `/api/finance/accounts` | GET/POST | OK | Account management |
| `/api/finance/funds` | GET/POST | OK | Fund management |
| `/api/finance/deposits` | GET/POST | OK | Deposit management |
| `/api/finance/reports` | GET | OK | Financial reports |
| `/api/finance/projects` | GET/POST | OK | Finance projects |
| `/api/finance/projects/[id]` | PUT/DELETE | OK | Finance project detail |

### 9h. Cooperation API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/cooperation/sections` | GET | OK | Cooperation sections |
| `/api/cooperation/consulting` | GET/POST | OK | Consulting CRUD |
| `/api/cooperation/consulting/[id]` | GET/PUT/DELETE | OK | Consulting detail |
| `/api/cooperation/survey` | GET/POST | OK | Survey CRUD |
| `/api/cooperation/survey/[id]` | GET/PUT/DELETE | OK | Survey detail |
| `/api/cooperation/lecturer` | GET/POST | OK | Lecturer CRUD |
| `/api/cooperation/lecturer/[id]` | GET/PUT/DELETE | OK | Lecturer detail |

### 9i. Issue Surveys API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/issue-surveys` | GET/POST | OK | Issue survey listing |
| `/api/issue-surveys/admin` | GET/POST | OK | Admin issue survey management |
| `/api/issue-surveys/[id]` | GET/PUT/DELETE | OK | Issue survey detail |
| `/api/issue-surveys/[id]/respond` | POST | OK | Submit response |
| `/api/issue-surveys/[id]/responses/[responseId]/like` | POST | OK | Like response |

### 9j. Other API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/popups/active` | GET | OK | Active popups |
| `/api/popups/track` | POST | OK | Popup tracking |
| `/api/seo/metadata` | GET | OK | SEO metadata |
| `/api/banners` | GET/POST | OK | Banner CRUD |
| `/api/banners/track` | POST | OK | Banner click tracking |
| `/api/donations` | GET/POST | OK | Donation CRUD |
| `/api/donations/[id]/receipt` | GET | OK | Donation receipt |
| `/api/chat` | POST | OK | AI chat endpoint |
| `/api/themes` | GET/POST | OK | Theme management |
| `/api/design/cards` | GET/POST | OK | Card design |
| `/api/upload` | POST | OK | General upload |
| `/api/upload/file` | POST | OK | File upload |
| `/api/upload/image` | POST | OK | Image upload |
| `/api/attendance/check` | POST | OK | Attendance check |
| `/api/attendance/qr/generate` | POST | OK | QR code generation |
| `/api/preview/[sessionKey]` | GET | OK | Preview session data |
| `/api/pages` | GET/POST | OK | CMS pages |
| `/api/pages/[id]` | GET/PUT/DELETE | OK | CMS page detail |
| `/api/pages/reorder` | POST | OK | Page reordering |
| `/api/applications/check-member` | POST | OK | Member check for applications |
| `/api/sessions/[id]` | GET/PUT/DELETE | OK | Session management |
| `/api/my/accounts` | GET/POST | OK | User bank accounts |
| `/api/my/accounts/[id]` | PUT/DELETE | OK | Account detail |
| `/api/my/likes` | GET | OK | User likes |

### 9k. Cron API

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/cron/survey-reminders` | GET/POST | OK | Survey reminder cron |
| `/api/cron/rsvp` | GET/POST | OK | RSVP reminder cron |
| `/api/cron/surveys` | GET/POST | OK | Survey status cron |

### 9l. Admin API (88+ endpoints)

| Route | Methods | Status | Notes |
|-------|---------|--------|-------|
| `/api/admin/programs` | GET/POST | OK | Program CRUD |
| `/api/admin/programs/[id]` | GET/PUT/DELETE | OK | Program detail |
| `/api/admin/programs/[id]/applications/[appId]` | PUT/DELETE | OK | Application management |
| `/api/admin/programs/[id]/applications/bulk` | POST | OK | Bulk application action |
| `/api/admin/programs/[id]/deposit-settings` | GET/PUT | OK | Deposit config |
| `/api/admin/programs/[id]/refund` | GET/POST | OK | Refund management |
| `/api/admin/programs/[id]/refund/export` | GET | OK | Refund export |
| `/api/admin/programs/[id]/survey` | GET/POST | OK | Program survey |
| `/api/admin/programs/[id]/book-surveys` | GET/POST | OK | Book surveys |
| `/api/admin/programs/reorder` | POST | OK | Program reorder |
| `/api/admin/programs/reorder/reverse` | POST | OK | Reverse reorder |
| `/api/admin/members` | GET/POST | OK | Member management |
| `/api/admin/members/[id]` | GET/PUT/DELETE | OK | Member detail |
| `/api/admin/members/[id]/grade` | PUT | OK | Member grade change |
| `/api/admin/members/[id]/status` | PUT | OK | Member status change |
| `/api/admin/users` | GET | OK | User listing |
| `/api/admin/users/search` | GET | OK | User search |
| `/api/admin/popups` | GET/POST | OK | Popup CRUD |
| `/api/admin/popups/[id]` | PUT/DELETE | OK | Popup detail |
| `/api/admin/popups/templates` | GET | OK | Popup templates |
| `/api/admin/seo/settings` | GET/POST | OK | SEO settings |
| `/api/admin/seo/settings/[id]` | PUT/DELETE | OK | SEO setting detail |
| `/api/admin/seo/global` | GET/PUT | OK | Global SEO |
| `/api/admin/seo/templates` | GET | OK | SEO templates |
| `/api/admin/banners` | GET/POST | OK | Banner CRUD |
| `/api/admin/banners/[id]` | PUT/DELETE | OK | Banner detail |
| `/api/admin/banners/[id]/analytics` | GET | OK | Banner analytics |
| `/api/admin/notifications/logs` | GET | OK | Notification logs |
| `/api/admin/notification-templates` | GET/POST | OK | Notification templates |
| `/api/admin/notification-templates/[id]` | PUT/DELETE | OK | Template detail |
| `/api/admin/themes` | GET/POST | OK | Theme management |
| `/api/admin/themes/[id]` | PUT/DELETE | OK | Theme detail |
| `/api/admin/theme` | GET/PUT | OK | Active theme |
| `/api/admin/blog` | GET/POST | OK | Blog management |
| `/api/admin/blog/[id]` | PUT/DELETE | OK | Blog detail |
| `/api/admin/notices` | GET/POST | OK | Notice management |
| `/api/admin/notices/[id]` | PUT/DELETE | OK | Notice detail |
| `/api/admin/books` | GET/POST | OK | Book management |
| `/api/admin/books/[id]` | PUT/DELETE | OK | Book detail |
| `/api/admin/cooperation-sections` | GET/POST | OK | Section management |
| `/api/admin/cooperation-sections/[id]` | PUT/DELETE | OK | Section detail |
| `/api/admin/surveys` | GET/POST | OK | Survey CRUD |
| `/api/admin/surveys/[id]/results` | GET | OK | Survey results |
| `/api/admin/surveys/[id]/results/export` | GET | OK | Results export |
| `/api/admin/surveys/[id]/reminders` | POST | OK | Send reminders |
| `/api/admin/lab/surveys` | GET/POST | OK | Lab survey management |
| `/api/admin/lab/surveys/[id]` | PUT/DELETE | OK | Lab survey detail |
| `/api/admin/lab/experts/[id]` | PUT/DELETE | OK | Expert management |
| `/api/admin/lab/trends` | GET/POST | OK | Trends CRUD |
| `/api/admin/lab/trends/[id]` | PUT/DELETE | OK | Trend detail |
| `/api/admin/lab/participations/[id]` | PUT | OK | Participation management |
| `/api/admin/reward-claims` | GET/POST | OK | Reward claims |
| `/api/admin/reward-claims/export` | GET | OK | Claims export |
| `/api/admin/finance/refunds` | GET/POST | OK | Finance refunds |
| `/api/admin/history` | GET | OK | Change history |
| `/api/admin/history/rollback` | POST | OK | Rollback changes |
| `/api/admin/history/restore-points` | GET/POST | OK | Restore points |
| `/api/admin/history/restore-points/[id]` | PUT/DELETE | OK | Restore point detail |
| `/api/admin/settings` | GET/PUT | OK | Admin settings |
| `/api/admin/settings/fonts` | GET/POST | OK | Font settings |
| `/api/admin/migration/export` | POST | OK | Data export |
| `/api/admin/migration/import` | POST | OK | Data import |
| `/api/admin/migration/csv` | POST | OK | CSV migration |
| `/api/admin/calendar` | GET/POST | OK | Calendar CRUD |
| `/api/admin/calendar/[id]` | PUT/DELETE | OK | Calendar detail |
| `/api/admin/partners` | GET/POST | OK | Partner management |
| `/api/admin/partners/[id]` | PUT/DELETE | OK | Partner detail |
| `/api/admin/documents` | GET/POST | OK | Document management |
| `/api/admin/documents/[id]` | PUT/DELETE | OK | Document detail |
| `/api/admin/projects` | GET/POST | OK | Project management |
| `/api/admin/projects/[id]` | PUT/DELETE | OK | Project detail |
| `/api/admin/templates` | GET/POST | OK | Template management |
| `/api/admin/templates/[id]` | PUT/DELETE | OK | Template detail |
| `/api/admin/application-forms` | GET/POST | OK | Application form CRUD |
| `/api/admin/application-forms/[id]` | PUT/DELETE | OK | Form detail |
| `/api/admin/design/sections` | GET/POST | OK | Design sections |
| `/api/admin/design/sections/[key]` | PUT/DELETE | OK | Section detail |
| `/api/admin/design/sections/[key]/visibility` | PUT | OK | Section visibility |
| `/api/admin/design/sections/reorder` | POST | OK | Section reorder |
| `/api/admin/design/cards` | GET/POST | OK | Design cards |
| `/api/admin/menus` | GET/POST | OK | Menu CRUD |
| `/api/admin/menus/[id]` | PUT/DELETE | OK | Menu detail |
| `/api/admin/floating-buttons` | GET/POST | OK | Floating button CRUD |
| `/api/admin/floating-buttons/[id]` | PUT/DELETE | OK | Button detail |
| `/api/admin/floating-buttons/[id]/analytics` | GET | OK | Button analytics |
| `/api/admin/custom-code` | GET/POST | OK | Custom code CRUD |
| `/api/admin/custom-code/[id]` | PUT/DELETE | OK | Custom code detail |
| `/api/admin/media` | GET/POST | OK | Media management |
| `/api/admin/preview/sessions` | GET/POST | OK | Preview sessions |
| `/api/admin/preview/sessions/[id]` | PUT/DELETE | OK | Preview session detail |
| `/api/admin/preview/changes` | GET | OK | Preview changes |
| `/api/admin/preview/snapshots` | GET/POST | OK | Preview snapshots |
| `/api/admin/preview/devices` | GET | OK | Preview devices |
| `/api/admin/sessions/[id]/attendances` | GET/POST | OK | Session attendances |
| `/api/admin/sessions/[id]/qr` | GET/POST | OK | Session QR management |
| `/api/admin/interests` | GET/POST | OK | Interest management |
| `/api/admin/interests/notify` | POST | OK | Interest notifications |

---

## 10. Error/Loading/Not-Found Coverage

### Error Boundaries (`error.tsx`)

| Location | File | Status |
|----------|------|--------|
| Root `/` | `src/app/error.tsx` | OK |
| Public `(public)` | Layout uses `<ErrorBoundary>` component | OK (client-side) |
| Admin `/admin` | `src/app/admin/error.tsx` | OK |
| Club `/club` | `src/app/club/error.tsx` | OK |
| Auth `(auth)` | None | WARNING - Missing |
| Member `(member)` | None | WARNING - Missing |
| Lab `/lab` | None | WARNING - Missing |
| Mypage `/mypage` | None | WARNING - Missing |
| Attendance `/attendance` | None | WARNING - Missing |

### Loading States (`loading.tsx`)

| Location | File | Status |
|----------|------|--------|
| Root `/` | None | WARNING - Missing |
| Public `(public)` | `src/app/(public)/loading.tsx` | OK |
| Admin `/admin` | `src/app/admin/loading.tsx` | OK |
| Admin `/admin/programs` | `src/app/admin/programs/loading.tsx` | OK |
| Admin `/admin/members` | `src/app/admin/members/loading.tsx` | OK |
| Club `/club` | `src/app/club/loading.tsx` | OK |
| Auth `(auth)` | None | WARNING - Missing |
| Member `(member)` | None | WARNING - Missing |
| Lab `/lab` | None | WARNING - Missing |
| Mypage `/mypage` | None | WARNING - Missing |
| Attendance `/attendance` | None | WARNING - Missing |

### Not-Found Pages (`not-found.tsx`)

| Location | File | Status |
|----------|------|--------|
| Root `/` | `src/app/not-found.tsx` | OK |
| Public `(public)` | None | OK (falls through to root) |
| Admin `/admin` | None | WARNING - Should have admin-styled 404 |
| Club `/club` | None | WARNING - Should have club-styled 404 |
| Auth `(auth)` | None | OK (falls through to root) |
| Member `(member)` | None | OK (falls through to root) |
| Lab `/lab` | None | WARNING - Should have lab-styled 404 |

---

## 11. Issues Found

### Critical Issues

| # | Severity | Issue | Location | Description |
|---|----------|-------|----------|-------------|
| 1 | ERROR | Debug page in production | `(public)/debug/page.tsx` | Debug page uses `dangerouslySetInnerHTML` with inline script. Must be removed before production deployment. |
| 2 | ERROR | Simple test page in production | `(public)/simple/page.tsx` | Test page with inline styles and navigation links. Should be removed. |
| 3 | ERROR | Demo page in production | `(public)/demo/walking-loader/page.tsx` | Demo/showcase page. Should be behind a feature flag or removed. |

### Auth & Security Issues

| # | Severity | Issue | Location | Description |
|---|----------|-------|----------|-------------|
| 4 | WARNING | Notice write on public route | `(public)/notice/write/page.tsx` | Notice creation is on a public route. Although it checks session client-side, it should be under an authenticated route group. |
| 5 | WARNING | Notice edit on public route | `(public)/notice/[id]/edit/page.tsx` | Notice editing is on a public route with client-side auth check only. |
| 6 | WARNING | No layout-level auth for (member) | `(member)/layout.tsx` | The member layout does not enforce auth at the layout level. Each page must individually check and redirect. |
| 7 | WARNING | No layout-level auth for mypage | `mypage/` directory | No layout file found. Each page must handle its own auth, leading to potential inconsistency. |

### Structural Issues

| # | Severity | Issue | Location | Description |
|---|----------|-------|----------|-------------|
| 8 | WARNING | Legacy mypage routes | `mypage/**` | 9 legacy routes exist without a layout, error boundary, or loading state. These overlap with `(member)/my/*` routes. Consider migrating or removing. |
| 9 | WARNING | Duplicate admin pages | `admin/popups`, `admin/seo`, etc. | Multiple admin pages appear to be duplicates of `/admin/design/*` pages. Found 9 potential duplicates: popups, seo, banners, themes, history, floating-buttons, custom-code, pages, pages/[id]. |
| 10 | WARNING | Duplicate API comment routes | `/api/reports/[id]/comment/**` vs `/api/reports/[id]/comments/**` | Two parallel comment API structures exist. Should be consolidated. |

### Missing Error Handling

| # | Severity | Issue | Location | Description |
|---|----------|-------|----------|-------------|
| 11 | WARNING | No error boundary for (auth) | `(auth)/` | Auth pages (login, register, etc.) have no error boundary. Authentication failures could show raw error pages. |
| 12 | WARNING | No error boundary for (member) | `(member)/` | Member pages have no error boundary. Database errors would show generic error. |
| 13 | WARNING | No error boundary for lab | `lab/` | Lab pages have no error boundary. |
| 14 | WARNING | No error boundary for mypage | `mypage/` | Legacy mypage routes have no error boundary. |
| 15 | WARNING | No error boundary for attendance | `attendance/` | Attendance pages have no error boundary. |

### Missing Loading States

| # | Severity | Issue | Location | Description |
|---|----------|-------|----------|-------------|
| 16 | WARNING | No loading state for (auth) | `(auth)/` | Auth pages have no loading state. Could cause layout shift. |
| 17 | WARNING | No loading state for (member) | `(member)/` | Member pages have no loading state. |
| 18 | WARNING | No loading state for lab | `lab/` | Lab pages have no loading state. |
| 19 | WARNING | No loading state for mypage | `mypage/` | Legacy mypage routes have no loading state. |
| 20 | WARNING | No loading state for attendance | `attendance/` | Attendance pages have no loading state. |

### Missing Not-Found Pages

| # | Severity | Issue | Location | Description |
|---|----------|-------|----------|-------------|
| 21 | WARNING | No admin-styled 404 | `admin/` | Admin section falls through to root 404 which does not match admin layout styling. |
| 22 | WARNING | No club-styled 404 | `club/` | Club section falls through to root 404 which does not match club layout styling. |
| 23 | WARNING | No lab-styled 404 | `lab/` | Lab section falls through to root 404 which does not match lab branding. |

---

## 12. Recommendations

### Priority 1 -- Security (Immediate)

1. **Remove debug/test/demo pages** from production: `/debug`, `/simple`, `/demo/walking-loader`
2. **Move notice write/edit** behind authenticated route group or add server-side auth check
3. **Add layout-level auth** to `(member)/layout.tsx` to prevent unauthenticated access

### Priority 2 -- Error Handling (High)

4. **Add `error.tsx`** to: `(auth)`, `(member)`, `lab`, `mypage`, `attendance`
5. **Add `loading.tsx`** to: `(auth)`, `(member)`, `lab`, `mypage`, `attendance`
6. **Add section-specific `not-found.tsx`** to: `admin`, `club`, `lab`

### Priority 3 -- Cleanup (Medium)

7. **Consolidate duplicate admin pages**: Remove `/admin/popups`, `/admin/seo`, `/admin/banners`, `/admin/themes`, `/admin/history`, `/admin/floating-buttons`, `/admin/custom-code`, `/admin/pages` if they are indeed duplicates of `/admin/design/*` counterparts
8. **Migrate or remove legacy `/mypage` routes** in favor of `(member)/my/*`
9. **Consolidate duplicate comment API routes**: `/api/reports/[id]/comment/**` vs `/api/reports/[id]/comments/**`

### Priority 4 -- Enhancement (Low)

10. Add more sub-section loading states (e.g., `admin/finance/loading.tsx`, `admin/settings/loading.tsx`)
11. Add metadata to standalone pages (`attendance`, `preview`, `rsvp`)
12. Consider adding `middleware.ts` for centralized auth checking instead of per-layout checks

---

## 13. Route Count Summary

| Category | Count |
|----------|-------|
| Public pages (including auth, member) | 57 |
| Club pages (all sub-groups) | 32 |
| Admin pages | 95 |
| Lab pages | 8 |
| Mypage pages (legacy) | 9 |
| Standalone pages | 6 |
| API routes (total) | 88+ |
| **Total page routes** | **207** |
| **Total API routes** | **88+** |
| **Grand total** | **295+** |

---

*Report generated by automated route analysis on 2026-01-31*
