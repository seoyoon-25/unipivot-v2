'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Bell } from 'lucide-react'
import Link from 'next/link'

interface Banner {
  id: string
  title: string
  content?: string | null
  type: string
  backgroundColor?: string | null
  textColor?: string | null
  linkUrl?: string | null
  linkText?: string | null
  openInNewTab: boolean
  showCloseButton: boolean
  isSticky: boolean
}

export function AnnouncementBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load dismissed banners from sessionStorage
    const dismissed = sessionStorage.getItem('dismissedBanners')
    if (dismissed) {
      setDismissedIds(new Set(JSON.parse(dismissed)))
    }

    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/public/banners')
      if (!res.ok) return
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Failed to fetch banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds)
    newDismissed.add(id)
    setDismissedIds(newDismissed)
    sessionStorage.setItem('dismissedBanners', JSON.stringify(Array.from(newDismissed)))
  }

  const visibleBanners = banners.filter(b => !dismissedIds.has(b.id))

  if (loading || visibleBanners.length === 0) return null

  return (
    <div className={visibleBanners[0]?.isSticky ? 'sticky top-0 z-50' : ''}>
      {visibleBanners.slice(0, 2).map((banner) => (
        <div
          key={banner.id}
          className="py-2 px-4 flex items-center justify-center gap-4 text-sm"
          style={{
            backgroundColor: banner.backgroundColor || '#3b82f6',
            color: banner.textColor || '#ffffff',
          }}
        >
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{banner.title}</span>
            {banner.content && (
              <span className="hidden sm:inline opacity-90">- {banner.content}</span>
            )}
            {banner.linkUrl && (
              <Link
                href={banner.linkUrl}
                target={banner.openInNewTab ? '_blank' : '_self'}
                rel={banner.openInNewTab ? 'noopener noreferrer' : undefined}
                className="underline hover:no-underline flex items-center gap-1 ml-2"
              >
                {banner.linkText || '자세히 보기'}
                {banner.openInNewTab && <ExternalLink className="h-3 w-3" />}
              </Link>
            )}
          </div>
          {banner.showCloseButton && (
            <button
              onClick={() => handleDismiss(banner.id)}
              className="p-1 hover:bg-black/10 rounded transition-colors flex-shrink-0"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
