'use client'

import { useState } from 'react'
import {
  Copy,
  Check,
  Sparkles,
  Loader2,
  Save,
  Send,
  FileText
} from 'lucide-react'
import {
  generateAnnouncement,
  saveAnnouncement,
  markAnnouncementAsSent
} from '@/lib/actions/announcement'

interface Props {
  sessionId: string
  sessionInfo: {
    programTitle: string
    sessionNo: number
    date: string
    startTime: string | null
    endTime: string | null
    location: string | null
    isOnline: boolean
    bookTitle: string | null
    bookRange: string | null
  }
}

export default function AnnouncementEditor({ sessionId, sessionInfo }: Props) {
  const [type, setType] = useState<'TWO_WEEKS' | 'ONE_WEEK' | 'ONE_DAY'>('ONE_WEEK')
  const [style, setStyle] = useState({
    tone: '친근함',
    emoji: '적당히',
    length: '보통'
  })
  const [content, setContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateAnnouncement(sessionId, type, style)
      if (result.error) {
        alert(result.error)
      } else if (result.content) {
        setContent(result.content)
      }
    } catch (error) {
      alert('공지 생성 중 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!content.trim()) {
      alert('공지 내용을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const result = await saveAnnouncement(sessionId, type, content, true, style)
      setSavedId(result.id)
      alert('공지가 저장되었습니다.')
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAsSent = async () => {
    if (!savedId) {
      await handleSave()
    }

    if (savedId) {
      await markAnnouncementAsSent(savedId)
      alert('발송 완료로 표시되었습니다.')
    }
  }

  const typeOptions = [
    { value: 'TWO_WEEKS', label: '2주 전' },
    { value: 'ONE_WEEK', label: '1주 전' },
    { value: 'ONE_DAY', label: '전날' }
  ]

  const toneOptions = ['친근함', '격식', '재미', '정보 중심']
  const emojiOptions = ['많이', '적당히', '최소', '없음']
  const lengthOptions = ['짧게', '보통', '길게']

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          카톡 공지 작성
        </h3>
      </div>

      {/* 모임 정보 요약 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <p className="font-medium">{sessionInfo.programTitle} {sessionInfo.sessionNo}회차</p>
        <p className="text-gray-600">
          {sessionInfo.date} {sessionInfo.startTime && `${sessionInfo.startTime} - ${sessionInfo.endTime}`}
        </p>
        <p className="text-gray-600">
          {sessionInfo.isOnline ? '온라인' : sessionInfo.location}
        </p>
      </div>

      {/* 공지 유형 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          공지 유형
        </label>
        <div className="flex gap-2">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value as any)}
              className={`
                px-4 py-2 rounded-lg border transition-colors
                ${type === opt.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white hover:bg-gray-50'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 스타일 선택 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            톤 & 매너
          </label>
          <select
            value={style.tone}
            onChange={e => setStyle({ ...style, tone: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            {toneOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이모지
          </label>
          <select
            value={style.emoji}
            onChange={e => setStyle({ ...style, emoji: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            {emojiOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            길이
          </label>
          <select
            value={style.length}
            onChange={e => setStyle({ ...style, length: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            {lengthOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            AI가 공지를 작성 중...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            AI로 공지 생성하기
          </>
        )}
      </button>

      {/* 공지 내용 편집 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          공지 내용
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={12}
          placeholder="AI로 생성하거나 직접 입력하세요..."
          className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          disabled={!content.trim()}
          className={`
            flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors
            ${copied
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              복사됨!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              카톡에 복사
            </>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          저장
        </button>

        <button
          onClick={handleMarkAsSent}
          disabled={!content.trim()}
          className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          발송 완료
        </button>
      </div>
    </div>
  )
}
