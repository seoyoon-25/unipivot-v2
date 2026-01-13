import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { LabNavigation } from '@/components/lab/LabNavigation'
import { LabFooter } from '@/components/lab/LabFooter'

export const metadata: Metadata = {
  metadataBase: new URL('https://lab.bestcome.org'),
  title: {
    default: '유니피벗 리서치랩 | 북한이탈주민 전문가 풀',
    template: '%s | 유니피벗 리서치랩',
  },
  description: '북한이탈주민 전문가 풀과 연구 매칭 플랫폼. 통일·북한 분야의 전문가와 강사를 직접 검색하고 섭외하세요.',
  keywords: ['유니피벗', '리서치랩', '북한이탈주민', '전문가', '강사', '설문조사', '연구', '통일'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://lab.bestcome.org',
    siteName: '유니피벗 리서치랩',
    title: '유니피벗 리서치랩 | 북한이탈주민 전문가 풀',
    description: '북한이탈주민 전문가 풀과 연구 매칭 플랫폼.',
    images: [
      {
        url: '/og-image-lab.png',
        width: 1200,
        height: 630,
        alt: '유니피벗 리서치랩',
      },
    ],
  },
}

export default function LabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <LabNavigation />
        <main className="flex-1">{children}</main>
        <LabFooter />
      </div>
    </Providers>
  )
}
