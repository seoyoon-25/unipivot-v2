'use client'

import { useEffect } from 'react'
import { initializePageProtection } from '@/lib/utils/global-protection'

export function GlobalProtection() {
  useEffect(() => {
    // 페이지 로드 후 보호 기능 초기화
    initializePageProtection()

    // 페이지 언로드 시 정리 (선택사항)
    return () => {
      // 필요한 경우 여기서 정리 작업
    }
  }, [])

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null
}