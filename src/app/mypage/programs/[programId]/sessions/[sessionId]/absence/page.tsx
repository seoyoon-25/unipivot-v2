'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitAbsenceRequest } from '@/lib/actions/absence'

interface AbsenceRequestPageProps {
  params: Promise<{
    programId: string
    sessionId: string
  }>
}

export default function AbsenceRequestPage({ params }: AbsenceRequestPageProps) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [attachment, setAttachment] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '업로드 실패')
      }

      const data = await response.json()
      setAttachment(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      setError('결석 사유를 입력해주세요.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const resolvedParams = await params
      await submitAbsenceRequest({
        sessionId: resolvedParams.sessionId,
        reason: reason.trim(),
        attachment: attachment || undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push(`/mypage/programs/${resolvedParams.programId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '결석 신청에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg border p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">결석 신청 완료</h2>
          <p className="text-gray-600">
            결석 신청이 접수되었습니다. 운영진의 승인을 기다려주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg border">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">결석 신청</h1>
          <p className="text-gray-600 mt-1">
            불가피한 사정으로 참석이 어려운 경우 결석 신청을 해주세요.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* 결석 사유 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결석 사유 <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="결석 사유를 상세히 입력해주세요..."
              rows={4}
              className="w-full"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              구체적인 사유를 작성해주시면 승인 처리가 빨라집니다.
            </p>
          </div>

          {/* 증빙 자료 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              증빙 자료 (선택)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {attachment ? (
              <div className="relative w-full max-w-xs">
                <img
                  src={attachment}
                  alt="증빙 자료"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors w-full justify-center"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    증빙 자료 첨부
                  </>
                )}
              </button>
            )}
            <p className="text-sm text-gray-500 mt-1">
              진료 확인서, 예약 확인서 등 증빙 자료가 있으면 첨부해주세요.
            </p>
          </div>

          {/* 안내 사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">안내 사항</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>결석 신청은 모임 시작 전까지 가능합니다.</li>
              <li>운영진 승인 후 사유 결석으로 처리됩니다.</li>
              <li>승인된 결석은 출석률 계산에서 제외됩니다.</li>
              <li>정당한 사유 없이 반복적인 결석은 참여에 제한이 있을 수 있습니다.</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  신청 중...
                </>
              ) : (
                '결석 신청'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
