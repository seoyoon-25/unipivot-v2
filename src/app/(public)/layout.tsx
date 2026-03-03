import nextDynamic from 'next/dynamic'
import { Providers } from '@/components/Providers'
import { NavbarWrapper } from '@/components/public/NavbarWrapper'
import { Footer } from '@/components/public/Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NoSSR } from '@/components/NoSSR'
import { TopBanners, BottomBanners } from '@/components/banners/BannerDisplay'

// Below-fold / client-only components — lazy load to reduce main bundle & render delay
const PopupDisplay = nextDynamic(() => import('@/components/popups/PopupDisplay'), { ssr: false })
const FloatingButtonDisplay = nextDynamic(() => import('@/components/floating-buttons/FloatingButtonDisplay').then(m => ({ default: m.FloatingButtonDisplay })), { ssr: false })
const ChatbotButton = nextDynamic(() => import('@/components/public/ChatbotButton').then(m => ({ default: m.ChatbotButton })), { ssr: false })
const CustomCursor = nextDynamic(() => import('@/components/public/CustomCursor').then(m => ({ default: m.CustomCursor })), { ssr: false })
const ScrollAnimation = nextDynamic(() => import('@/components/public/ScrollAnimation').then(m => ({ default: m.ScrollAnimation })), { ssr: false })

// Force dynamic rendering for all public pages to avoid prerender errors
export const dynamic = 'force-dynamic'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col">
          {/* 상단 배너 */}
          <ErrorBoundary>
            <NoSSR>
              <TopBanners />
            </NoSSR>
          </ErrorBoundary>

          <ErrorBoundary>
            <NavbarWrapper />
          </ErrorBoundary>

          <main className="flex-1 pt-16">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>

          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>

          {/* 하단 배너 */}
          <ErrorBoundary>
            <NoSSR>
              <BottomBanners />
            </NoSSR>
          </ErrorBoundary>

          {/* 클라이언트 전용 컴포넌트들 — lazy loaded via next/dynamic ssr:false */}
          <ErrorBoundary>
            <PopupDisplay />
            <FloatingButtonDisplay />
            <ChatbotButton />
            <CustomCursor />
            <ScrollAnimation />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </Providers>
  )
}
