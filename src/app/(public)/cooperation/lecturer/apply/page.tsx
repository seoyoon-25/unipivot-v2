'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Plus, X, CheckCircle } from 'lucide-react'

interface Schedule {
  date: string
  startTime: string
  endTime: string
}

export default function LecturerApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [schedules, setSchedules] = useState<Schedule[]>([{ date: '', startTime: '', endTime: '' }])

  const [form, setForm] = useState({
    topic: '',
    method: '',
    requirements: '',
    fee: '',
    organization: '',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    feeAgreement: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const addSchedule = () => {
    setSchedules([...schedules, { date: '', startTime: '', endTime: '' }])
  }

  const removeSchedule = (index: number) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index))
    }
  }

  const updateSchedule = (index: number, field: keyof Schedule, value: string) => {
    const updated = [...schedules]
    updated[index][field] = value
    setSchedules(updated)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/cooperation/lecturer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          schedules,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '요청 처리 중 오류가 발생했습니다')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">강사요청이 접수되었습니다</h1>
            <p className="text-gray-600 mb-8">
              담당자가 검토 후 빠른 시일 내에 연락드리겠습니다.<br />
              문의사항은 unipivot@unipivot.org로 연락주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cooperation"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold"
              >
                협조요청 페이지로
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href="/cooperation"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          협조요청으로 돌아가기
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">강사요청</h1>
            <p className="text-white/80">강연자를 섭외해드립니다</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* 강연주제 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                강연주제 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                required
                placeholder="예: 북한이탈주민의 한국사회 정착 이야기"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* 강연일시 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강연일시 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="date"
                      value={schedule.date}
                      onChange={(e) => updateSchedule(index, 'date', e.target.value)}
                      required
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                      required
                      className="w-28 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="text-gray-400">~</span>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                      required
                      className="w-28 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSchedule}
                  className="flex items-center gap-2 text-primary hover:text-primary-dark text-sm"
                >
                  <Plus className="w-4 h-4" />
                  일정 추가
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">복수 일정이 가능한 경우 여러 개 추가해 주세요</p>
            </div>

            {/* 강연 방식 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강연 방식 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="offline"
                    checked={form.method === 'offline'}
                    onChange={handleChange}
                    required
                    className="text-primary focus:ring-primary"
                  />
                  <span>오프라인</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="online"
                    checked={form.method === 'online'}
                    onChange={handleChange}
                    className="text-primary focus:ring-primary"
                  />
                  <span>온라인</span>
                </label>
              </div>
            </div>

            {/* 요청 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                요청 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={5}
                required
                placeholder="강연 대상, 원하는 내용, 특별 요청사항 등을 자세히 작성해 주세요."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* 강연료 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                강연료 (선택)
              </label>
              <input
                type="text"
                name="fee"
                value={form.fee}
                onChange={handleChange}
                placeholder="예: 50만원, 협의 가능"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-sm text-gray-500 mt-1">미입력 시 협의로 진행됩니다</p>
            </div>

            {/* 요청기관 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">요청기관 정보</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기관명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  required
                  placeholder="예: 통일부, OO대학교, OO재단"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* 담당자 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">담당자 정보</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    담당자 성함 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    담당자 직함 (선택)
                  </label>
                  <input
                    type="text"
                    name="contactTitle"
                    value={form.contactTitle}
                    onChange={handleChange}
                    placeholder="예: 팀장, 담당자"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* 안내 및 수수료 동의 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="font-medium text-gray-700">안내사항</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>접수된 요청은 담당자 검토 후 1-2일 내 연락드립니다.</li>
                <li>강연료는 강연 내용과 시간에 따라 협의 후 결정됩니다.</li>
                <li>문의: unipivot@unipivot.org</li>
              </ul>
              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-gray-200">
                <input
                  type="checkbox"
                  name="feeAgreement"
                  checked={form.feeAgreement}
                  onChange={handleChange}
                  required
                  className="mt-0.5 w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> 강연자와 연결 성사 시 연결 수수료 3만원이 발생함을 확인했습니다.
                </span>
              </label>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? '제출 중...' : '강사 요청하기'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
