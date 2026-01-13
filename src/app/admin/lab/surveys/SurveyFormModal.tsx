'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import {
  MIGRANT_CATEGORY_LIST,
  getMigrantCategoryLabel,
  getCategoryColorClasses,
} from '@/lib/constants/migrant'

interface Survey {
  id: string
  title: string
  description: string | null
  type: string
  targetCount: number
  currentCount: number
  targetOrigin: string | null
  targetCategories: string | null
  targetCountries: string | null
  targetAgeMin: number | null
  targetAgeMax: number | null
  targetGender: string | null
  targetConditions: string | null
  questionCount: number | null
  estimatedTime: number | null
  externalUrl: string | null
  rewardType: string
  rewardAmount: number | null
  rewardNote: string | null
  startDate: Date
  endDate: Date
  isExternal: boolean
  requesterOrg: string | null
  status: string
  isPublic: boolean
}

interface Props {
  survey: Survey | null
  onClose: () => void
}

export default function SurveyFormModal({ survey, onClose }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  // targetCategories JSON 파싱
  const parseTargetCategories = (categories: string | null): string[] => {
    if (!categories) return []
    try {
      return JSON.parse(categories)
    } catch {
      return []
    }
  }

  const [formData, setFormData] = useState({
    title: survey?.title || '',
    description: survey?.description || '',
    type: survey?.type || 'SURVEY',
    targetCount: survey?.targetCount || 10,
    targetOrigin: survey?.targetOrigin || 'ANY',
    targetCategories: parseTargetCategories(survey?.targetCategories || null),
    targetAgeMin: survey?.targetAgeMin || '',
    targetAgeMax: survey?.targetAgeMax || '',
    targetGender: survey?.targetGender || 'ANY',
    targetConditions: survey?.targetConditions || '',
    questionCount: survey?.questionCount || '',
    estimatedTime: survey?.estimatedTime || '',
    externalUrl: survey?.externalUrl || '',
    rewardType: survey?.rewardType || 'CASH',
    rewardAmount: survey?.rewardAmount || '',
    rewardNote: survey?.rewardNote || '',
    startDate: formatDateForInput(survey?.startDate || null) || formatDateForInput(new Date()),
    endDate: formatDateForInput(survey?.endDate || null) || '',
    isExternal: survey?.isExternal || false,
    requesterOrg: survey?.requesterOrg || '',
    status: survey?.status || 'DRAFT',
    isPublic: survey?.isPublic ?? false,
  })

  // 카테고리 토글 핸들러
  const toggleTargetCategory = (categoryValue: string) => {
    setFormData((prev) => {
      const newCategories = prev.targetCategories.includes(categoryValue)
        ? prev.targetCategories.filter((c) => c !== categoryValue)
        : [...prev.targetCategories, categoryValue]
      return { ...prev, targetCategories: newCategories }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        targetCount: parseInt(formData.targetCount.toString()) || 10,
        targetCategories: formData.targetCategories.length > 0 ? formData.targetCategories : null,
        targetAgeMin: formData.targetAgeMin ? parseInt(formData.targetAgeMin.toString()) : null,
        targetAgeMax: formData.targetAgeMax ? parseInt(formData.targetAgeMax.toString()) : null,
        questionCount: formData.questionCount ? parseInt(formData.questionCount.toString()) : null,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime.toString()) : null,
        rewardAmount: formData.rewardAmount ? parseInt(formData.rewardAmount.toString()) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      }

      const url = survey
        ? `/api/admin/lab/surveys/${survey.id}`
        : '/api/admin/lab/surveys'

      const res = await fetch(url, {
        method: survey ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.refresh()
        onClose()
      } else {
        const data = await res.json()
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error saving survey:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {survey ? '설문조사 수정' : '새 설문조사'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">기본 정보</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="SURVEY">설문조사</option>
                  <option value="INTERVIEW">인터뷰</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="DRAFT">임시저장</option>
                  <option value="RECRUITING">진행중</option>
                  <option value="CLOSED">마감</option>
                  <option value="COMPLETED">진행완료</option>
                </select>
              </div>
            </div>
          </div>

          {/* Period */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">기간</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Target */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">참가 자격</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">목표 인원</label>
              <input
                type="number"
                name="targetCount"
                value={formData.targetCount}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대상 이주배경 (복수 선택 가능, 미선택 시 제한 없음)
              </label>
              <div className="flex flex-wrap gap-2">
                {MIGRANT_CATEGORY_LIST.map((cat) => {
                  const isSelected = formData.targetCategories.includes(cat.value)
                  const colorClasses = getCategoryColorClasses(cat.value)
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleTargetCategory(cat.value)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        isSelected
                          ? `${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
              {formData.targetCategories.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  선택됨: {formData.targetCategories.map((c) => getMigrantCategoryLabel(c)).join(', ')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">최소 연령</label>
                <input
                  type="number"
                  name="targetAgeMin"
                  value={formData.targetAgeMin}
                  onChange={handleChange}
                  min="0"
                  placeholder="제한 없음"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">최대 연령</label>
                <input
                  type="number"
                  name="targetAgeMax"
                  value={formData.targetAgeMax}
                  onChange={handleChange}
                  min="0"
                  placeholder="제한 없음"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                <select
                  name="targetGender"
                  value={formData.targetGender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="ANY">제한 없음</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기타 조건</label>
              <textarea
                name="targetConditions"
                value={formData.targetConditions}
                onChange={handleChange}
                rows={2}
                placeholder="예: 20대 대학생, 서울 거주자 등"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Survey Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">설문 정보</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">문항 수</label>
                <input
                  type="number"
                  name="questionCount"
                  value={formData.questionCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소요 시간 (분)</label>
                <input
                  type="number"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">외부 설문 URL</label>
              <input
                type="url"
                name="externalUrl"
                value={formData.externalUrl}
                onChange={handleChange}
                placeholder="https://forms.google.com/..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Reward */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">사례비</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사례비 유형</label>
                <select
                  name="rewardType"
                  value={formData.rewardType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="CASH">현금</option>
                  <option value="POINT">포인트</option>
                  <option value="GIFT">상품권</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사례비 금액 (원)</label>
                <input
                  type="number"
                  name="rewardAmount"
                  value={formData.rewardAmount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사례비 참고사항</label>
              <input
                type="text"
                name="rewardNote"
                value={formData.rewardNote}
                onChange={handleChange}
                placeholder="예: 설문 완료 후 7일 이내 지급"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Requester */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">요청 기관</h3>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                name="isExternal"
                id="isExternal"
                checked={formData.isExternal}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isExternal" className="text-sm text-gray-700">외부 요청</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요청 기관명</label>
              <input
                type="text"
                name="requesterOrg"
                value={formData.requesterOrg}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">공개</label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : (survey ? '수정' : '등록')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
