'use client'

import { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import {
  MaritalStatusOptions,
  EducationLevelOptions,
  OccupationOptions,
} from '@/lib/lab/constants'

interface LabProfileFormProps {
  initialData?: {
    birthYear?: number | null
    birthRegion?: string | null
    hometown?: string | null
    leftHometownYear?: number | null
    enteredKoreaYear?: number | null
    maritalStatus?: string | null
    educationHometown?: string | null
    educationKorea?: string | null
    occupations?: string[] | null
  }
  onSubmit: (data: any) => Promise<void>
  submitLabel?: string
}

export function LabProfileForm({ initialData, onSubmit, submitLabel = '저장' }: LabProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    birthYear: initialData?.birthYear || '',
    birthRegion: initialData?.birthRegion || '',
    hometown: initialData?.hometown || '',
    leftHometownYear: initialData?.leftHometownYear || '',
    enteredKoreaYear: initialData?.enteredKoreaYear || '',
    maritalStatus: initialData?.maritalStatus || '',
    educationHometown: initialData?.educationHometown || '',
    educationKorea: initialData?.educationKorea || '',
    occupations: initialData?.occupations || [],
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i)

  const handleOccupationChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      occupations: prev.occupations.includes(value)
        ? prev.occupations.filter((o) => o !== value)
        : [...prev.occupations, value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 필수 필드 검증
    if (!form.birthYear || !form.birthRegion || !form.hometown || !form.maritalStatus ||
        !form.educationHometown || !form.educationKorea || form.occupations.length === 0) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        birthYear: Number(form.birthYear),
        birthRegion: form.birthRegion,
        hometown: form.hometown,
        leftHometownYear: form.leftHometownYear ? Number(form.leftHometownYear) : null,
        enteredKoreaYear: form.enteredKoreaYear ? Number(form.enteredKoreaYear) : null,
        maritalStatus: form.maritalStatus,
        educationHometown: form.educationHometown,
        educationKorea: form.educationKorea,
        occupations: form.occupations,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            출생연도 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.birthYear}
            onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          >
            <option value="">선택하세요</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            출생지역 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.birthRegion}
            onChange={(e) => setForm({ ...form, birthRegion: e.target.value })}
            placeholder="예: 함경북도, 서울특별시"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고향 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.hometown}
            onChange={(e) => setForm({ ...form, hometown: e.target.value })}
            placeholder="예: 청진시, 부산광역시"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고향을 떠난 시기
          </label>
          <select
            value={form.leftHometownYear}
            onChange={(e) => setForm({ ...form, leftHometownYear: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">선택하세요 (선택사항)</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            남한 입국 시기
          </label>
          <select
            value={form.enteredKoreaYear}
            onChange={(e) => setForm({ ...form, enteredKoreaYear: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">선택하세요 (선택사항)</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            결혼 여부 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.maritalStatus}
            onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          >
            <option value="">선택하세요</option>
            {MaritalStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 학력 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고향에서 최종학력 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.educationHometown}
            onChange={(e) => setForm({ ...form, educationHometown: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          >
            <option value="">선택하세요</option>
            {EducationLevelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            남한에서 최종학력 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.educationKorea}
            onChange={(e) => setForm({ ...form, educationKorea: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          >
            <option value="">선택하세요</option>
            {EducationLevelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 직업 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          현재 직업 <span className="text-red-500">*</span>
          <span className="text-gray-500 font-normal ml-2">(복수 선택 가능)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {OccupationOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                form.occupations.includes(opt.value)
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={form.occupations.includes(opt.value)}
                onChange={() => handleOccupationChange(opt.value)}
                className="sr-only"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
