'use client'

import { useState, useRef } from 'react'
import { Mic, Upload, FileText, ExternalLink, Loader2, Check } from 'lucide-react'
import { processTranscription } from '@/lib/actions/recording'
import { getClovaNoteLaunchUrl } from '@/lib/utils/clovanote'

interface Props {
  sessionId: string
  onUploadComplete?: () => void
}

export default function ClovaNoteLauncher({ sessionId, onUploadComplete }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openClovaNote = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)

    if (isIOS) {
      window.location.href = getClovaNoteLaunchUrl('ios')
      setTimeout(() => {
        if (!document.hidden) {
          if (
            confirm(
              '클로바노트가 설치되어 있지 않습니다. 앱스토어로 이동할까요?'
            )
          ) {
            window.location.href =
              'https://apps.apple.com/kr/app/clova-note/id1474129536'
          }
        }
      }, 3000)
    } else if (isAndroid) {
      window.location.href = getClovaNoteLaunchUrl('android')
    } else {
      window.open(getClovaNoteLaunchUrl('web'), '_blank')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadComplete(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await processTranscription(sessionId, formData)

      if (result.error) {
        alert(result.error)
      } else {
        setUploadComplete(true)
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onUploadComplete?.()
      }
    } catch (error) {
      alert('업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Mic className="w-5 h-5" />
        모임 녹취 → 블로그 만들기
      </h3>

      {/* Step 1: 클로바노트 앱 */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
            1
          </span>
          클로바노트로 녹음 & 전사
        </div>

        <button
          onClick={openClovaNote}
          className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-green-700 transition-colors"
        >
          <Mic className="w-6 h-6" />
          <span>클로바노트 앱 열기</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <p className="text-sm text-gray-600 text-center">
          녹음하면 자동으로 텍스트로 변환됩니다
        </p>
      </div>

      {/* Step 2: 파일 내보내기 안내 */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
            2
          </span>
          전사 파일 내보내기
        </div>

        <div className="space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
          <p className="font-medium">클로바노트 앱에서:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>녹음 완료 후 전사 결과 확인</li>
            <li>[공유하기] 또는 [내보내기] 버튼 클릭</li>
            <li>텍스트 파일(.txt) 또는 JSON 저장</li>
          </ol>
        </div>
      </div>

      {/* Step 3: 파일 업로드 */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
            3
          </span>
          전사 파일 업로드
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium text-gray-700">전사 파일 선택하기</p>
          <p className="text-sm text-gray-500 mt-2">
            지원 형식: TXT, JSON, DOCX
          </p>
        </div>

        {file && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  업로드 및 분석
                </>
              )}
            </button>
          </div>
        )}

        {uploadComplete && (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
            <Check className="w-5 h-5" />
            <span>업로드 완료! 블로그 초안이 생성되었습니다.</span>
          </div>
        )}
      </div>

      {/* 안내 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-medium mb-1">참고</p>
        <ul className="list-disc list-inside space-y-1 text-yellow-700">
          <li>녹음 파일(MP3, WAV)은 지원하지 않습니다</li>
          <li>클로바노트에서 전사된 텍스트 파일만 업로드해주세요</li>
          <li>AI가 자동으로 개인정보를 제거하고 블로그 형태로 정리합니다</li>
        </ul>
      </div>
    </div>
  )
}
