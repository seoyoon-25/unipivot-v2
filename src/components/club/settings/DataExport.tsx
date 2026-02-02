'use client'

import { useTransition, useState } from 'react'
import { Download } from 'lucide-react'
import { exportMyData } from '@/app/club/settings/actions'

export default function DataExport() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleExport = () => {
    setError('')
    startTransition(async () => {
      const result = await exportMyData()
      if (result.error) {
        setError(result.error)
        return
      }

      if (result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `uniclub-export-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">내 데이터 내보내기</h2>
      <p className="text-sm text-gray-500 mb-4">
        독후감, 명문장, 출석 기록 등 내 활동 데이터를 JSON 파일로 다운로드합니다.
      </p>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">{error}</div>
      )}

      <button
        onClick={handleExport}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm"
      >
        <Download className="w-4 h-4" />
        {isPending ? '준비 중...' : '데이터 다운로드 (JSON)'}
      </button>
    </div>
  )
}
