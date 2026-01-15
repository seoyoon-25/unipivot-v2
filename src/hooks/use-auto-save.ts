'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAutoSaveOptions {
  key: string
  value: string
  onSave: (value: string) => Promise<void>
  delay?: number
  enabled?: boolean
  onRestore?: (value: string) => void
}

export function useAutoSave({
  key,
  value,
  onSave,
  delay = 5000,
  enabled = true,
  onRestore
}: UseAutoSaveOptions) {
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasSavedData, setHasSavedData] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastValueRef = useRef(value)
  const isInitialMount = useRef(true)

  // Check for saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`autosave-${key}`)
      if (savedData && savedData !== value) {
        setHasSavedData(true)
        if (onRestore) {
          onRestore(savedData)
        }
      }
    } catch (error) {
      console.warn('Failed to check auto-save data:', error)
    }
  }, [key, value, onRestore])

  // Auto-save logic
  useEffect(() => {
    if (!enabled || value === lastValueRef.current) {
      return
    }

    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      lastValueRef.current = value
      return
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Save to localStorage immediately for backup
    try {
      localStorage.setItem(`autosave-${key}`, value)
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }

    // Set new timeout for server save
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsAutoSaving(true)
        await onSave(value)
        setLastSaved(new Date())
        setHasSavedData(false)

        // Clear localStorage backup after successful save
        try {
          localStorage.removeItem(`autosave-${key}`)
        } catch (error) {
          console.warn('Failed to clear localStorage backup:', error)
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setIsAutoSaving(false)
      }
    }, delay)

    lastValueRef.current = value

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [key, value, onSave, delay, enabled])

  // Restore from saved data
  const restore = useCallback(() => {
    try {
      const savedData = localStorage.getItem(`autosave-${key}`)
      if (savedData && onRestore) {
        onRestore(savedData)
        setHasSavedData(false)
      }
    } catch (error) {
      console.error('Failed to restore data:', error)
    }
  }, [key, onRestore])

  // Clear saved data
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(`autosave-${key}`)
      setHasSavedData(false)
    } catch (error) {
      console.error('Failed to clear saved data:', error)
    }
  }, [key])

  // Force save now
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      setIsAutoSaving(true)
      await onSave(value)
      setLastSaved(new Date())
      setHasSavedData(false)

      try {
        localStorage.removeItem(`autosave-${key}`)
      } catch (error) {
        console.warn('Failed to clear localStorage backup:', error)
      }
    } catch (error) {
      console.error('Manual save failed:', error)
      throw error
    } finally {
      setIsAutoSaving(false)
    }
  }, [key, value, onSave])

  return {
    isAutoSaving,
    lastSaved,
    hasSavedData,
    restore,
    clear,
    saveNow
  }
}

// Hook for managing draft state with auto-restore
export function useDraftRestore(key: string) {
  const [hasDraft, setHasDraft] = useState(false)
  const [draftData, setDraftData] = useState<string | null>(null)

  useEffect(() => {
    try {
      const draft = localStorage.getItem(`draft-${key}`)
      if (draft) {
        setDraftData(draft)
        setHasDraft(true)
      }
    } catch (error) {
      console.warn('Failed to check for draft:', error)
    }
  }, [key])

  const saveDraft = useCallback((data: string) => {
    try {
      localStorage.setItem(`draft-${key}`, data)
      setDraftData(data)
      setHasDraft(true)
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }, [key])

  const restoreDraft = useCallback(() => {
    return draftData
  }, [draftData])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`draft-${key}`)
      setDraftData(null)
      setHasDraft(false)
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  }, [key])

  return {
    hasDraft,
    draftData,
    saveDraft,
    restoreDraft,
    clearDraft
  }
}