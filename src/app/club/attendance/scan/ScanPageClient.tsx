'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import QRScanner from '@/components/club/attendance/QRScanner'
import { checkInWithQR } from '../actions'

interface ScanPageClientProps {
  initialToken?: string
}

export default function ScanPageClient({ initialToken }: ScanPageClientProps) {
  const [result, setResult] = useState<{
    success: boolean
    message: string
    status?: string
    programTitle?: string
    sessionNo?: number
  } | null>(null)
  const [processing, setProcessing] = useState(false)

  // Auto-submit if token is in URL
  useEffect(() => {
    if (initialToken) {
      handleScan(initialToken)
    }
  }, [initialToken])

  const handleScan = async (token: string) => {
    if (processing) return
    setProcessing(true)

    try {
      // Extract token from URL if it's a full URL
      let qrToken = token
      try {
        const url = new URL(token)
        qrToken = url.searchParams.get('token') || token
      } catch {
        // Not a URL, use as-is
      }

      const res = await checkInWithQR(qrToken)
      setResult({
        success: true,
        message: `${res.programTitle} ${res.sessionNo}회차 출석이 완료되었습니다!`,
        status: res.status,
        programTitle: res.programTitle,
        sessionNo: res.sessionNo,
      })
    } catch (e) {
      setResult({
        success: false,
        message: e instanceof Error ? e.message : '출석 체크에 실패했습니다',
      })
    } finally {
      setProcessing(false)
    }
  }

  if (result) {
    return (
      <div className="text-center py-8">
        {result.success ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {result.status === 'LATE' ? '지각 처리되었습니다' : '출석 완료!'}
            </h2>
            <p className="text-gray-600 mb-6">{result.message}</p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">출석 실패</h2>
            <p className="text-gray-600 mb-6">{result.message}</p>
          </>
        )}
        <div className="space-y-2">
          <button
            onClick={() => setResult(null)}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            다시 스캔하기
          </button>
          <Link
            href="/club/attendance"
            className="w-full inline-flex items-center justify-center gap-2 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            출석 현황으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {processing ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">출석 처리 중...</p>
        </div>
      ) : (
        <QRScanner onScan={handleScan} />
      )}
    </div>
  )
}
