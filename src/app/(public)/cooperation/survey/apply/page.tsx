'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'

export default function SurveyApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    questionCount: '',
    estimatedTime: '',
    serviceFee: '',
    participantFee: '',
    requirements: '',
    requesterType: '',
    requesterName: '',
    email: '',
    phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/cooperation/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">설문·인터뷰 요청이 접수되었습니다</h1>
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
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">설문·인터뷰 요청</h1>
            <p className="text-white/80">연구 설문 및 인터뷰 조사를 지원합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* 설문기간 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">설문기간</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
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
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* 설문지 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">설문지 정보</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    문항수 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="questionCount"
                      value={form.questionCount}
                      onChange={handleChange}
                      min="1"
                      required
                      placeholder="예: 20"
                      className="w-28 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="text-gray-600">문항</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    예상 소요시간 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="estimatedTime"
                      value={form.estimatedTime}
                      onChange={handleChange}
                      min="1"
                      required
                      placeholder="예: 15"
                      className="w-28 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="text-gray-600">분</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 비용 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">비용 (선택)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설문대행 비용
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="serviceFee"
                      value={form.serviceFee}
                      onChange={handleChange}
                      min="0"
                      placeholder="예: 30"
                      className="w-28 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="text-gray-600">만원</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">미입력 시 협의로 진행</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    참가자 사례비
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="participantFee"
                      value={form.participantFee}
                      onChange={handleChange}
                      min="0"
                      placeholder="예: 1"
                      className="w-28 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="text-gray-600">만원/인</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">참가자 1인당 지급 금액</p>
                </div>
              </div>
            </div>

            {/* 요청사항 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                요청사항 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={5}
                required
                placeholder="연구 주제, 대상 조건 (예: 탈북 5년 이상, 20-40대), 필요 인원 수, 설문 방식 (온라인/오프라인) 등을 자세히 작성해 주세요."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* 요청자 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">요청자 정보</h3>

              {/* 요청구분 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요청구분 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="requesterType"
                      value="individual"
                      checked={form.requesterType === 'individual'}
                      onChange={handleChange}
                      required
                      className="text-primary focus:ring-primary"
                    />
                    <span>개인 (대학원생, 연구원 등)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="requesterType"
                      value="organization"
                      checked={form.requesterType === 'organization'}
                      onChange={handleChange}
                      className="text-primary focus:ring-primary"
                    />
                    <span>기관</span>
                  </label>
                </div>
              </div>

              {/* 요청자명/기관명 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.requesterType === 'organization' ? '기관명' : '요청자명'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="requesterName"
                  value={form.requesterName}
                  onChange={handleChange}
                  required
                  placeholder={form.requesterType === 'organization' ? '예: 서울대학교 통일연구원' : '예: 홍길동 (OO대학교 석사과정)'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* 연락처 */}
              <div className="grid md:grid-cols-2 gap-4">
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

            {/* 안내 문구 */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-2">안내사항</p>
              <ul className="list-disc list-inside space-y-1">
                <li>접수된 요청은 담당자 검토 후 1-2일 내 연락드립니다.</li>
                <li>설문대행 비용은 모집 난이도와 인원에 따라 협의 후 결정됩니다.</li>
                <li>IRB 승인이 필요한 연구는 승인 후 요청해 주세요.</li>
                <li>문의: unipivot@unipivot.org</li>
              </ul>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? '제출 중...' : '설문·인터뷰 요청하기'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
