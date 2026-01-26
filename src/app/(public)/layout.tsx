import { Providers } from '@/components/Providers'
import { NavbarWrapper } from '@/components/public/NavbarWrapper'
import { Footer } from '@/components/public/Footer'
import { ChatbotButton } from '@/components/public/ChatbotButton'
import { CustomCursor } from '@/components/public/CustomCursor'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NoSSR } from '@/components/NoSSR'
import { TopBanners, BottomBanners } from '@/components/banners/BannerDisplay'
import PopupDisplay from '@/components/popups/PopupDisplay'
import { FloatingButtonDisplay } from '@/components/floating-buttons/FloatingButtonDisplay'

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

          <main className="flex-1 pt-16 lg:pt-20">
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

          {/* 클라이언트 전용 컴포넌트들 */}
          <ErrorBoundary>
            <NoSSR>
              <PopupDisplay />
              <FloatingButtonDisplay />
              <ChatbotButton />
              <CustomCursor />
            </NoSSR>
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </Providers>
  )
}
