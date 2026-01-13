'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { X, RefreshCw, Maximize2, Minimize2, QrCode, Loader2 } from 'lucide-react'

interface AttendanceQRModalProps {
  sessionId: string
  sessionInfo: {
    programTitle: string
    sessionNumber: number
    sessionTitle?: string
    date: Date | string
  }
  onClose: () => void
}

export function AttendanceQRModal({ sessionId, sessionInfo, onClose }: AttendanceQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [checkInUrl, setCheckInUrl] = useState<string>('')
  const [validUntil, setValidUntil] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [remainingTime, setRemainingTime] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // QR 생성
  const generateQR = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/attendance/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, validMinutes: 30 }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'QR 생성 실패')
      }

      // QR 코드 이미지 생성
      const qrImage = await QRCode.toDataURL(data.checkInUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#1E3A5F', light: '#FFFFFF' },
      })

      setQrDataUrl(qrImage)
      setCheckInUrl(data.checkInUrl)
      setValidUntil(new Date(data.validUntil))
    } catch (err) {
      console.error('QR 생성 실패:', err)
      setError(err instanceof Error ? err.message : 'QR 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 남은 시간 타이머
  useEffect(() => {
    if (!validUntil) return

    const updateRemainingTime = () => {
      const now = new Date()
      const diff = validUntil.getTime() - now.getTime()

      if (diff <= 0) {
        setRemainingTime('만료됨')
        return false
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setRemainingTime(`${minutes}분 ${seconds}초`)
      return true
    }

    updateRemainingTime()
    const interval = setInterval(() => {
      if (!updateRemainingTime()) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [validUntil])

  // 초기 QR 생성
  useEffect(() => {
    generateQR()
  }, [sessionId])

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, onClose])

  const sessionDate = typeof sessionInfo.date === 'string' ? new Date(sessionInfo.date) : sessionInfo.date

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'bg-white' : 'bg-black/50'
      }`}
    >
      <div
        className={`bg-white shadow-2xl ${
          isFullscreen
            ? 'w-full h-full flex flex-col'
            : 'max-w-md w-full mx-4 rounded-2xl'
        } p-6 md:p-8`}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">QR 출석</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? '축소' : '전체화면'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className={`${isFullscreen ? 'flex-1 flex flex-col items-center justify-center' : ''}`}>
          {/* 프로그램 정보 */}
          <div className="text-center mb-6">
            <p className="font-medium text-lg">{sessionInfo.programTitle}</p>
            <p className="text-gray-600">
              {sessionInfo.sessionNumber}회차
              {sessionInfo.sessionTitle && ` - ${sessionInfo.sessionTitle}`}
            </p>
            <p className="text-sm text-gray-500">
              {format(sessionDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
            </p>
          </div>

          {/* QR 코드 */}
          <div className="flex justify-center mb-6">
            {loading ? (
              <div className="w-[300px] h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="w-[300px] h-[300px] bg-red-50 rounded-lg flex flex-col items-center justify-center text-red-500 p-4">
                <X className="w-12 h-12 mb-2" />
                <p className="text-center text-sm">{error}</p>
              </div>
            ) : (
              <img
                src={qrDataUrl}
                alt="출석 QR 코드"
                className={`${isFullscreen ? 'w-[400px] h-[400px]' : 'w-[300px] h-[300px]'} rounded-lg`}
              />
            )}
          </div>

          {/* 유효 시간 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">유효 시간</p>
            <p
              className={`text-2xl font-bold ${
                remainingTime === '만료됨' ? 'text-red-500' : 'text-green-600'
              }`}
            >
              {remainingTime || '로딩 중...'}
            </p>
          </div>

          {/* 안내 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span>📷</span>
              <span>회원들이 핸드폰 카메라로 QR을 스캔하면 자동으로 출석 처리됩니다.</span>
            </p>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <button
              onClick={generateQR}
              disabled={loading}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex-1 py-3 bg-primary text-white hover:bg-primary-dark rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  축소
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  전체화면
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
