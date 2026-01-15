'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { TopBanners, BottomBanners } from './BannerDisplay'

interface BannerContextType {
  refreshBanners: () => void
  currentPage: string
}

const BannerContext = createContext<BannerContextType | undefined>(undefined)

export function useBanners() {
  const context = useContext(BannerContext)
  if (!context) {
    throw new Error('useBanners must be used within a BannerProvider')
  }
  return context
}

interface BannerProviderProps {
  children: React.ReactNode
  showTopBanners?: boolean
  showBottomBanners?: boolean
  className?: string
}

export function BannerProvider({
  children,
  showTopBanners = true,
  showBottomBanners = false,
  className
}: BannerProviderProps) {
  const pathname = usePathname()
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshBanners = () => {
    setRefreshKey(prev => prev + 1)
  }

  const contextValue: BannerContextType = {
    refreshBanners,
    currentPage: pathname
  }

  return (
    <BannerContext.Provider value={contextValue}>
      <div className={className}>
        {/* 상단 배너 */}
        {showTopBanners && (
          <TopBanners
            key={`top-${refreshKey}`}
            currentPage={pathname}
          />
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1">
          {children}
        </main>

        {/* 하단 배너 */}
        {showBottomBanners && (
          <BottomBanners
            key={`bottom-${refreshKey}`}
            currentPage={pathname}
          />
        )}
      </div>
    </BannerContext.Provider>
  )
}

// 페이지별 커스터마이징을 위한 개별 컴포넌트
interface PageBannersProps {
  position: 'top' | 'bottom'
  currentPage?: string
  className?: string
}

export function PageBanners({ position, currentPage, className }: PageBannersProps) {
  const pathname = usePathname()
  const page = currentPage || pathname

  if (position === 'top') {
    return <TopBanners currentPage={page} className={className} />
  } else {
    return <BottomBanners currentPage={page} className={className} />
  }
}