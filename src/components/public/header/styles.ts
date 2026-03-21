// 색상 상수
export const COLORS = {
  primary: '#F97316',      // 주황색 (호버 배경)
  primaryDark: '#E55A2B',  // 주황색 (다크)
  primaryLight: '#FF6B35', // 주황색 (밝음)
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
} as const

// 애니메이션 딜레이
export const ANIMATION = {
  dropdownDelay: 150,  // ms - 드롭다운 닫힘 딜레이
  duration: 150,       // ms - 애니메이션 지속 시간
} as const

// 브레이크포인트
export const BREAKPOINTS = {
  lg: 1024,
} as const

// 로고
export const DEFAULT_LOGO = '/images/logo.png'
