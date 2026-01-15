// Floating Button Display Components
export {
  FloatingButtonDisplay,
  BottomRightFloatingButtons,
  BottomLeftFloatingButtons,
  TopRightFloatingButtons,
  TopLeftFloatingButtons
} from './FloatingButtonDisplay'

// Admin Components
export { FloatingButtonEditor } from '../admin/floating-buttons/FloatingButtonEditor'
export { FloatingButtonAnalytics } from '../admin/floating-buttons/FloatingButtonAnalytics'

// Hooks
export { useFloatingButtons, useFloatingButton } from '../../hooks/use-floating-buttons'

// Types
export type FloatingButtonType = 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'TOP_LEFT' | 'CUSTOM'
export type FloatingButtonSize = 'SMALL' | 'MEDIUM' | 'LARGE'
export type FloatingButtonAnimation = 'NONE' | 'PULSE' | 'BOUNCE' | 'SHAKE'
export type FloatingButtonShowOn = 'ALL' | 'DESKTOP' | 'MOBILE' | 'TABLET'

export interface FloatingButton {
  id: string
  title: string
  icon?: string
  color: string
  hoverColor?: string
  textColor: string
  linkUrl: string
  openInNewTab: boolean
  position: FloatingButtonType
  offsetX: number
  offsetY: number
  size: FloatingButtonSize
  showLabel: boolean
  animation: FloatingButtonAnimation
  animationDelay: number
  showOn: FloatingButtonShowOn
  scrollThreshold?: number
  maxDisplayCount?: number
}