import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { Toaster } from '@/components/ui'
import { GlobalProtection } from '@/components/GlobalProtection'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://bestcome.org'),
  title: {
    default: '유니피벗 | 남북청년 교류 커뮤니티',
    template: '%s | 유니피벗',
  },
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
  description: '남북청년이 함께 새로운 한반도를 만들어갑니다. UniPivot은 남북청년 교류와 통일 관련 프로그램을 운영하는 비영리 단체입니다.',
  keywords: ['유니피벗', 'UniPivot', '남북청년', '통일', '교류', '커뮤니티', '독서모임', '세미나'],
  authors: [{ name: 'UniPivot' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://bestcome.org',
    siteName: '유니피벗',
    title: '유니피벗 | 남북청년 교류 커뮤니티',
    description: '남북청년이 함께 새로운 한반도를 만들어갑니다.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '유니피벗',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '유니피벗 | 남북청년 교류 커뮤니티',
    description: '남북청년이 함께 새로운 한반도를 만들어갑니다.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Preconnect to font CDN */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* Preload font CSS for early discovery, then load non-blocking.
            Blocking CSS didn't help CLS (woff2 still loads async with font-display:swap)
            but cost 3.6s render delay. Non-blocking saves LCP with same CLS. */}
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';l.media='print';l.onload=function(){l.media='all'};document.head.appendChild(l)})()`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          />
        </noscript>
      </head>
      <body className="font-pretendard">
        <GlobalProtection />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
