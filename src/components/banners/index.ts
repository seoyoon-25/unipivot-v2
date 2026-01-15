// Banner Display Components
export { BannerDisplay, TopBanners, BottomBanners } from './BannerDisplay'
export { BannerProvider, PageBanners, useBanners as useBannersContext } from './BannerProvider'

// Admin Components
export { BannerEditor } from '../admin/banners/BannerEditor'
export { BannerAnalytics } from '../admin/banners/BannerAnalytics'

// Hooks
export { useBanners, useBanner } from '../../hooks/use-banners'

// Banner Types Export
export interface Banner {
  id: string
  title: string
  content?: string
  type: BannerType
  backgroundColor?: string
  textColor?: string
  icon?: string
  linkUrl?: string
  linkText?: string
  openInNewTab: boolean
  position: BannerPosition
  isSticky: boolean
  showCloseButton: boolean
  autoDismiss: boolean
  autoDismissDelay?: number
  maxDisplayCount?: number
}

export type BannerType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'MAINTENANCE'
export type BannerPosition = 'TOP' | 'BOTTOM'