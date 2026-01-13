'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Wallet,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import {
  DEFAULT_REFUND_POLICIES,
  type RefundPolicyType,
  type RefundPolicyCriteria,
} from '@/lib/utils/deposit-calculator'

interface Program {
  id: string
  title: string
  type: string
  depositSetting?: {
    id: string
    isEnabled: boolean
    depositAmount: number
    conditionType: string
    refundPolicy: string | null
    depositPerSession: boolean
    perSessionAmount: number | null
    surveyRequired: boolean
    surveyDeadlineDays: number
    totalSessions: number
  } | null
}

export default function DepositSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    isEnabled: true,
    depositAmount: 100000,
    conditionType: 'ATTENDANCE_AND_REPORT' as RefundPolicyType,
    refundPolicy: DEFAULT_REFUND_POLICIES['ATTENDANCE_AND_REPORT'],
    depositPerSession: false,
    perSessionAmount: 10000,
    surveyRequired: true,
    surveyDeadlineDays: 7,
    totalSessions: 10,
  })

  useEffect(() => {
    fetchProgram()
  }, [id])

  const fetchProgram = async () => {
    try {
      const response = await fetch(`/api/admin/programs/${id}`)
      if (!response.ok) throw new Error('프로그램을 불러오는데 실패했습니다.')

      const data = await response.json()
      setProgram(data.program)

      if (data.program.depositSetting) {
        const ds = data.program.depositSetting
        setFormData({
          isEnabled: ds.isEnabled,
          depositAmount: ds.depositAmount,
          conditionType: ds.conditionType as RefundPolicyType,
          refundPolicy: ds.refundPolicy
            ? JSON.parse(ds.refundPolicy)
            : DEFAULT_REFUND_POLICIES[ds.conditionType as RefundPolicyType],
          depositPerSession: ds.depositPerSession,
          perSessionAmount: ds.perSessionAmount || 10000,
          surveyRequired: ds.surveyRequired,
          surveyDeadlineDays: ds.surveyDeadlineDays,
          totalSessions: ds.totalSessions,
        })
      }
    } catch (error) {
      console.error('Failed to fetch program:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConditionTypeChange = (type: RefundPolicyType) => {
    setFormData({
      ...formData,
      conditionType: type,
      refundPolicy: DEFAULT_REFUND_POLICIES[type],
    })
  }

  const handlePolicyChange = (index: number, field: keyof RefundPolicyCriteria, value: number | string) => {
    const newPolicy = [...formData.refundPolicy]
    newPolicy[index] = { ...newPolicy[index], [field]: value }
    setFormData({ ...formData, refundPolicy: newPolicy })
  }

  const handleAddPolicy = () => {
    setFormData({
      ...formData,
      refundPolicy: [
        ...formData.refundPolicy,
        { minAttendance: 0, minReport: 0, refundRate: 0, label: '새 기준' },
      ],
    })
  }

  const handleRemovePolicy = (index: number) => {
    const newPolicy = formData.refundPolicy.filter((_, i) => i !== index)
    setFormData({ ...formData, refundPolicy: newPolicy })
  }

  const handleResetPolicy = () => {
    setFormData({
      ...formData,
      refundPolicy: DEFAULT_REFUND_POLICIES[formData.conditionType],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/programs/${id}/deposit-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          refundPolicy: JSON.stringify(formData.refundPolicy),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '저장에 실패했습니다.')
      }

      setMessage({ type: 'success', text: '보증금 설정이 저장되었습니다.' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '저장에 실패했습니다.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">프로그램을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href={`/admin/programs/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          프로그램으로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Wallet className="w-7 h-7 text-primary" />
          보증금 설정
        </h1>
        <p className="text-gray-600 mt-1">{program.title}</p>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 설정 */}
        <section className="bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-bold mb-4">기본 설정</h2>

          <div className="space-y-4">
            {/* 보증금 사용 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="font-medium">보증금 사용</span>
            </label>

            {/* 보증금 금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">보증금 금액</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, depositAmount: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary pr-12"
                  step={10000}
                  min={0}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>

            {/* 전체 회차 수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전체 회차 수</label>
              <input
                type="number"
                value={formData.totalSessions}
                onChange={(e) =>
                  setFormData({ ...formData, totalSessions: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                min={1}
              />
            </div>
          </div>
        </section>

        {/* 반환 정책 */}
        <section className="bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-bold mb-4">반환 정책</h2>

          {/* 반환 기준 타입 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">반환 기준</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="conditionType"
                  value="ONE_TIME"
                  checked={formData.conditionType === 'ONE_TIME'}
                  onChange={() => handleConditionTypeChange('ONE_TIME')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium">1회성 프로그램</span>
                  <p className="text-sm text-gray-500">참석 시 전액 반환, 불참 시 미반환</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="conditionType"
                  value="ATTENDANCE_ONLY"
                  checked={formData.conditionType === 'ATTENDANCE_ONLY'}
                  onChange={() => handleConditionTypeChange('ATTENDANCE_ONLY')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium">출석 기준만</span>
                  <p className="text-sm text-gray-500">출석률에 따라 보증금 반환</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="conditionType"
                  value="ATTENDANCE_AND_REPORT"
                  checked={formData.conditionType === 'ATTENDANCE_AND_REPORT'}
                  onChange={() => handleConditionTypeChange('ATTENDANCE_AND_REPORT')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium">출석 + 독후감 기준</span>
                  <p className="text-sm text-gray-500">출석률과 독후감 제출률에 따라 보증금 반환</p>
                </div>
              </label>
            </div>
          </div>

          {/* 반환 기준 상세 */}
          {formData.conditionType !== 'ONE_TIME' && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">반환 기준 상세</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResetPolicy}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    기본값
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPolicy}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    기준 추가
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">출석률</th>
                      {formData.conditionType === 'ATTENDANCE_AND_REPORT' && (
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          독후감 제출률
                        </th>
                      )}
                      <th className="px-4 py-3 text-left font-medium text-gray-600">반환률</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">설명</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formData.refundPolicy.map((policy, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={policy.minAttendance}
                              onChange={(e) =>
                                handlePolicyChange(index, 'minAttendance', Number(e.target.value))
                              }
                              className="w-16 px-2 py-1 border rounded text-center"
                              min={0}
                              max={100}
                            />
                            <span className="text-gray-500">% 이상</span>
                          </div>
                        </td>
                        {formData.conditionType === 'ATTENDANCE_AND_REPORT' && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={policy.minReport || 0}
                                onChange={(e) =>
                                  handlePolicyChange(index, 'minReport', Number(e.target.value))
                                }
                                className="w-16 px-2 py-1 border rounded text-center"
                                min={0}
                                max={100}
                              />
                              <span className="text-gray-500">% 이상</span>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={policy.refundRate}
                              onChange={(e) =>
                                handlePolicyChange(index, 'refundRate', Number(e.target.value))
                              }
                              className="w-16 px-2 py-1 border rounded text-center"
                              min={0}
                              max={100}
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={policy.label}
                            onChange={(e) => handlePolicyChange(index, 'label', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleRemovePolicy(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 회차별 보증금 */}
        {formData.conditionType !== 'ONE_TIME' && (
          <section className="bg-white rounded-2xl p-6 border">
            <h2 className="text-lg font-bold mb-4">회차별 보증금 (선택)</h2>

            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={formData.depositPerSession}
                onChange={(e) =>
                  setFormData({ ...formData, depositPerSession: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium">회차별 개별 반환</span>
                <p className="text-sm text-gray-500">
                  각 회차 출석/독후감 충족 시 해당 회차 금액만 반환
                </p>
              </div>
            </label>

            {formData.depositPerSession && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회차당 금액
                </label>
                <div className="relative w-48">
                  <input
                    type="number"
                    value={formData.perSessionAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, perSessionAmount: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary pr-12"
                    step={1000}
                    min={0}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    원
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  총 보증금:{' '}
                  {(formData.perSessionAmount * formData.totalSessions).toLocaleString()}원 (
                  {formData.totalSessions}회차)
                </p>
              </div>
            )}
          </section>
        )}

        {/* 만족도 조사 */}
        <section className="bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-bold mb-4">만족도 조사</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.surveyRequired}
                onChange={(e) =>
                  setFormData({ ...formData, surveyRequired: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium">만족도 조사 필수</span>
                <p className="text-sm text-gray-500">미응답 시 보증금 미반환</p>
              </div>
            </label>

            {formData.surveyRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">응답 기한</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.surveyDeadlineDays}
                    onChange={(e) =>
                      setFormData({ ...formData, surveyDeadlineDays: Number(e.target.value) })
                    }
                    className="w-20 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                    min={1}
                    max={30}
                  />
                  <span className="text-gray-600">일</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-3">
          <Link
            href={`/admin/programs/${id}`}
            className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
