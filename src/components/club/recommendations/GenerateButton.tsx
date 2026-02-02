'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'
import TasteAnalysis from './TasteAnalysis'

export default function GenerateButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const res = await fetch('/api/club/recommendations/generate', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '추천 생성에 실패했습니다.')
        return
      }

      if (data.analysis) {
        setAnalysis(data.analysis)
      }

      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            분석 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            추천 받기
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1 text-right">{error}</p>}
      {analysis && <TasteAnalysis analysis={analysis} />}
    </div>
  )
}
