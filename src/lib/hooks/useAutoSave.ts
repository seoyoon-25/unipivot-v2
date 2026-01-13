'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface UseAutoSaveOptions {
  key: string
  value: string
  delay?: number // 저장 딜레이 (ms)
  enabled?: boolean
  onRestore?: (value: string) => void
}

interface AutoSaveState {
  lastSaved: Date | null
  isSaving: boolean
  hasRestoredData: boolean
}

/**
 * localStorage 자동 저장 훅
 * - 지정된 딜레이 후 자동 저장
 * - 복원 기능 제공
 */
export function useAutoSave({
  key,
  value,
  delay = 3000,
  enabled = true,
  onRestore,
}: UseAutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    lastSaved: null,
    isSaving: false,
    hasRestoredData: false,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastValueRef = useRef<string>(value)
  const storageKey = `autosave_${key}`

  // 저장 함수
  const save = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return

    try {
      const data = {
        content: lastValueRef.current,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
      setState((prev) => ({
        ...prev,
        lastSaved: new Date(),
        isSaving: false,
      }))
    } catch (error) {
      console.error('Auto-save failed:', error)
      setState((prev) => ({ ...prev, isSaving: false }))
    }
  }, [storageKey, enabled])

  // 디바운스된 저장
  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setState((prev) => ({ ...prev, isSaving: true }))

    timeoutRef.current = setTimeout(() => {
      save()
    }, delay)
  }, [save, delay])

  // 값 변경 감지
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value
      if (enabled && value.length > 0) {
        debouncedSave()
      }
    }
  }, [value, enabled, debouncedSave])

  // 저장된 데이터 복원
  const restore = useCallback((): string | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null

      const data = JSON.parse(stored)
      if (data.content) {
        setState((prev) => ({ ...prev, hasRestoredData: true }))
        return data.content
      }
    } catch (error) {
      console.error('Auto-save restore failed:', error)
    }
    return null
  }, [storageKey])

  // 저장된 데이터 존재 여부 확인
  const hasSavedData = useCallback((): boolean => {
    if (typeof window === 'undefined') return false

    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return false

      const data = JSON.parse(stored)
      return !!data.content && data.content.length > 0
    } catch {
      return false
    }
  }, [storageKey])

  // 저장된 데이터 정보 가져오기
  const getSavedInfo = useCallback((): { savedAt: Date; preview: string } | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null

      const data = JSON.parse(stored)
      if (!data.content) return null

      // HTML 태그 제거하고 미리보기 생성
      const textContent = data.content.replace(/<[^>]*>/g, '').trim()
      const preview = textContent.slice(0, 100) + (textContent.length > 100 ? '...' : '')

      return {
        savedAt: new Date(data.savedAt),
        preview,
      }
    } catch {
      return null
    }
  }, [storageKey])

  // 저장된 데이터 삭제
  const clear = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(storageKey)
      setState((prev) => ({
        ...prev,
        lastSaved: null,
        hasRestoredData: false,
      }))
    } catch (error) {
      console.error('Auto-save clear failed:', error)
    }
  }, [storageKey])

  // 초기 로드 시 복원 데이터 확인
  useEffect(() => {
    if (enabled && hasSavedData() && onRestore) {
      const saved = restore()
      if (saved) {
        onRestore(saved)
      }
    }
  }, []) // 의도적으로 빈 배열 - 최초 1회만 실행

  // 클린업
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    save,
    restore,
    clear,
    hasSavedData,
    getSavedInfo,
  }
}

/**
 * 시간 포맷팅 (몇 분 전, 방금 전 등)
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
