'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { checkAttendanceWithQR } from '@/lib/actions/attendance'

// Dynamically import html5-qrcode to avoid SSR issues
const Html5QrcodeScanner = dynamic(
  () => import('@/components/QRScanner'),
  { ssr: false }
)

type ResultState = {
  status: 'idle' | 'scanning' | 'success' | 'error'
  message?: string
  attendanceStatus?: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'
  lateMinutes?: number | null
}

function AttendanceScanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [result, setResult] = useState<ResultState>({ status: 'idle' })
  const [isProcessing, setIsProcessing] = useState(false)
  const processedRef = useRef(false)

  // Check if there's a token in URL (from QR code link)
  useEffect(() => {
    const token = searchParams.get('token')
    if (token && !processedRef.current) {
      processedRef.current = true
      handleQRResult(token)
    }
  }, [searchParams])

  const handleQRResult = async (decodedText: string) => {
    if (isProcessing) return

    // Extract token from URL if it's a full URL
    let token = decodedText
    try {
      const url = new URL(decodedText)
      token = url.searchParams.get('token') || decodedText
    } catch {
      // Not a URL, use as-is
    }

    setIsProcessing(true)
    setResult({ status: 'scanning', message: '출석 처리 중...' })

    try {
      const response = await checkAttendanceWithQR(token)

      if (response.success) {
        setResult({
          status: 'success',
          message: response.message,
          attendanceStatus: response.status,
          lateMinutes: response.lateMinutes,
        })
      } else {
        setResult({
          status: 'error',
          message: response.message,
        })
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: error instanceof Error ? error.message : '출석 처리에 실패했습니다',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setResult({ status: 'idle' })
    processedRef.current = false
    router.replace('/attendance/scan')
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      {/* Scanner or Result */}
      {result.status === 'idle' && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 text-center">
              <Camera className="mx-auto mb-2 h-12 w-12 text-primary" />
              <p className="text-gray-600">
                카메라로 QR 코드를 스캔하세요
              </p>
            </div>
            <Html5QrcodeScanner onResult={handleQRResult} />
            <p className="mt-4 text-center text-sm text-gray-500">
              진행자가 보여주는 QR 코드를 스캔해주세요
            </p>
          </CardContent>
        </Card>
      )}

      {result.status === 'scanning' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
            <p className="text-lg font-medium">{result.message}</p>
          </CardContent>
        </Card>
      )}

      {result.status === 'success' && (
        <Card className="overflow-hidden">
          <div className="bg-green-500 p-8 text-center text-white">
            <CheckCircle className="mx-auto mb-4 h-20 w-20" />
            <h2 className="text-2xl font-bold">
              {result.attendanceStatus === 'PRESENT' ? '출석 완료!' : '지각 처리'}
            </h2>
          </div>
          <CardContent className="p-6 text-center">
            <p className="mb-2 text-gray-600">{result.message}</p>
            {result.lateMinutes && result.lateMinutes > 0 && (
              <p className="text-yellow-600">
                {result.lateMinutes}분 늦게 도착했습니다
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/mypage')}
              >
                마이페이지
              </Button>
              <Button className="flex-1" onClick={handleReset}>
                다시 스캔
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result.status === 'error' && (
        <Card className="overflow-hidden">
          <div className="bg-red-500 p-8 text-center text-white">
            <XCircle className="mx-auto mb-4 h-20 w-20" />
            <h2 className="text-2xl font-bold">출석 실패</h2>
          </div>
          <CardContent className="p-6 text-center">
            <p className="mb-4 text-gray-600">{result.message}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/mypage')}
              >
                마이페이지
              </Button>
              <Button className="flex-1" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="mt-8 rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-medium text-blue-800">
          <AlertCircle className="h-5 w-5" />
          출석 안내
        </h3>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• 모임 시작 10분 이내: 출석</li>
          <li>• 모임 시작 10~15분: 지각</li>
          <li>• 모임 시작 15분 이후: 결석</li>
        </ul>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
          <p className="text-lg font-medium">로딩 중...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AttendanceScanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <h1 className="text-center text-xl font-bold">QR 출석 체크</h1>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <AttendanceScanContent />
      </Suspense>
    </div>
  )
}
