'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, XCircle } from 'lucide-react'

interface QRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')

  const startScanning = async () => {
    if (!scannerRef.current || isScanning) return

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      const scanner = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText)
          scanner.stop().catch(() => {})
          setIsScanning(false)
        },
        () => {
          // QR code not detected - ignore
        }
      )

      setIsScanning(true)
      setError('')
    } catch (err) {
      const message = '카메라에 접근할 수 없습니다. 권한을 확인해주세요.'
      setError(message)
      onError?.(message)
    }
  }

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null
      setIsScanning(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        ref={scannerRef}
        className="w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-gray-900"
        style={{ minHeight: isScanning ? '300px' : '0' }}
      />

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3" role="alert" aria-live="polite">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!isScanning ? (
        <button
          onClick={startScanning}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Camera className="w-5 h-5" />
          QR 코드 스캔 시작
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          스캔 중지
        </button>
      )}
    </div>
  )
}
