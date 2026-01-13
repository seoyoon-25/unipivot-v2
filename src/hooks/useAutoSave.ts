'use client'

import { useState, useEffect, useCallback } from 'react'

interface AutoSaveOptions {
  key: string
  data: any
  delay?: number
  enabled?: boolean
}

interface AutoSaveReturn {
  hasDraft: boolean
  lastSaved: Date | null
  restoreDraft: () => any | null
  clearDraft: () => void
  saveDraft: () => void
}

export function useAutoSave({
  key,
  data,
  delay = 3000,
  enabled = true,
}: AutoSaveOptions): AutoSaveReturn {
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // 페이지 로드 시 임시저장 데이터 확인
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedDraft = localStorage.getItem(key)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        if (parsed.data && parsed.timestamp) {
          setHasDraft(true)
        }
      } catch (e) {
        localStorage.removeItem(key)
      }
    }
  }, [key])

  // 자동 저장
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // 데이터가 비어있는지 확인
    const hasContent = Object.values(data).some((value) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (typeof value === 'number') return value > 0
      if (Array.isArray(value)) return value.length > 0
      return false
    })

    if (!hasContent) return

    const timer = setTimeout(() => {
      const draftData = {
        data,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(key, JSON.stringify(draftData))
      setLastSaved(new Date())
    }, delay)

    return () => clearTimeout(timer)
  }, [key, data, delay, enabled])

  // 페이지 이탈 시 경고
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasContent = Object.values(data).some((value) => {
      if (typeof value === 'string') return value.trim().length > 0
      return false
    })

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasContent) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [data])

  // 임시저장 데이터 복원
  const restoreDraft = useCallback(() => {
    if (typeof window === 'undefined') return null

    const savedDraft = localStorage.getItem(key)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        if (parsed.data) {
          setHasDraft(false)
          return parsed.data
        }
      } catch (e) {
        return null
      }
    }
    return null
  }, [key])

  // 임시저장 삭제
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(key)
    setHasDraft(false)
    setLastSaved(null)
  }, [key])

  // 수동 저장
  const saveDraft = useCallback(() => {
    if (typeof window === 'undefined') return

    const draftData = {
      data,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(draftData))
    setLastSaved(new Date())
  }, [key, data])

  return {
    hasDraft,
    lastSaved,
    restoreDraft,
    clearDraft,
    saveDraft,
  }
}
