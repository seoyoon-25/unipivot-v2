'use client'

import { useState, useEffect, useCallback } from 'react'
import QRCode from 'react-qr-code'
import { RefreshCw, Clock } from 'lucide-react'
import { generateSessionQR } from '@/app/club/attendance/actions'

interface QRDisplayProps {
  sessionId: string
  initialToken?: string | null
  initialValidUntil?: string | null
}

export default function QRDisplay({ sessionId, initialToken, initialValidUntil }: QRDisplayProps) {
  const [token, setToken] = useState(initialToken || '')
  const [validUntil, setValidUntil] = useState(initialValidUntil || '')
  const [remaining, setRemaining] = useState(0)
  const [generating, setGenerating] = useState(false)

  const calculateRemaining = useCallback(() => {
    if (!validUntil) return 0
    const diff = new Date(validUntil).getTime() - Date.now()
    return Math.max(0, Math.floor(diff / 1000))
  }, [validUntil])

  useEffect(() => {
    setRemaining(calculateRemaining())
    const interval = setInterval(() => {
      setRemaining(calculateRemaining())
    }, 1000)
    return () => clearInterval(interval)
  }, [calculateRemaining])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateSessionQR(sessionId)
      setToken(result.token)
      setValidUntil(result.validUntil)
    } catch {
      // ignore
    } finally {
      setGenerating(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const attendanceUrl = token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/club/attendance/scan?token=${encodeURIComponent(token)}`
    : ''

  return (
    <div className="flex flex-col items-center space-y-4">
      {token && remaining > 0 ? (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <QRCode value={attendanceUrl} size={256} level="H" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className={`w-4 h-4 ${remaining < 60 ? 'text-red-500' : 'text-blue-500'}`} />
            <span className={remaining < 60 ? 'text-red-600 font-medium' : 'text-gray-600'}>
              남은 시간: {formatTime(remaining)}
            </span>
          </div>
        </>
      ) : (
        <div className="bg-gray-100 rounded-2xl p-12 flex flex-col items-center gap-3">
          <div className="text-gray-400 text-sm">
            {token ? 'QR 코드가 만료되었습니다' : 'QR 코드를 생성해주세요'}
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
      >
        <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
        {token ? 'QR 코드 새로 생성' : 'QR 코드 생성'}
      </button>
    </div>
  )
}
