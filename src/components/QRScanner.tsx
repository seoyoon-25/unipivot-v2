'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QRScannerProps {
  onResult: (decodedText: string) => void
  className?: string
}

export default function QRScanner({ onResult, className }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const resultProcessedRef = useRef(false)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanning = async () => {
    setError(null)
    resultProcessedRef.current = false

    try {
      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)

      // Initialize scanner
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' }, // Back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Prevent multiple callbacks
          if (resultProcessedRef.current) return
          resultProcessedRef.current = true

          // Stop scanning and process result
          scanner.stop().then(() => {
            setIsScanning(false)
            onResult(decodedText)
          })
        },
        () => {
          // Ignore scan errors (no QR code in frame)
        }
      )

      setIsScanning(true)
    } catch (err) {
      console.error('Failed to start scanner:', err)
      setHasPermission(false)
      setError(
        err instanceof Error
          ? err.message.includes('Permission')
            ? '카메라 접근 권한이 필요합니다'
            : '카메라를 시작할 수 없습니다'
          : '알 수 없는 오류가 발생했습니다'
      )
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {
        // Ignore stop errors
      }
      setIsScanning(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Scanner viewport */}
      <div
        id="qr-reader"
        className={cn(
          'relative mx-auto overflow-hidden rounded-xl bg-gray-900',
          isScanning ? 'h-80' : 'h-64'
        )}
      >
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {error ? (
              <>
                <AlertCircle className="mb-3 h-12 w-12 text-red-400" />
                <p className="mb-4 text-center text-sm text-red-300">{error}</p>
                <Button onClick={startScanning} variant="secondary">
                  다시 시도
                </Button>
              </>
            ) : hasPermission === false ? (
              <>
                <CameraOff className="mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-center text-sm text-gray-300">
                  카메라 접근 권한이 없습니다
                </p>
                <p className="text-center text-xs text-gray-500">
                  브라우저 설정에서 카메라 권한을 허용해주세요
                </p>
              </>
            ) : (
              <>
                <Camera className="mb-3 h-12 w-12 text-gray-400" />
                <Button onClick={startScanning}>
                  <Camera className="mr-2 h-4 w-4" />
                  카메라 시작
                </Button>
              </>
            )}
          </div>
        )}

        {/* Scanning overlay */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-64 w-64">
              {/* Corner markers */}
              <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-primary" />
              <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-primary" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary" />

              {/* Scanning line animation */}
              <div className="absolute inset-x-4 top-0 h-0.5 animate-scan bg-primary/80" />
            </div>
          </div>
        )}
      </div>

      {/* Control button */}
      {isScanning && (
        <Button onClick={stopScanning} variant="outline" className="w-full">
          <CameraOff className="mr-2 h-4 w-4" />
          카메라 중지
        </Button>
      )}

      {/* Scanning animation styles */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(256px);
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
