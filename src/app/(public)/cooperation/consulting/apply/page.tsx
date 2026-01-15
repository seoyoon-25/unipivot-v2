'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'

export default function ConsultingApplyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    duration: '',
    method: '',
    fee: '',
    requirements: '',
    organization: '',
    contactName: '',
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
      const res = await fetch('/api/cooperation/consulting', {
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">자문요청이 접수되었습니다</h1>
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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">자문요청</h1>
            <p className="text-white/80">프로그램 자문을 요청해주세요</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* 자문기간 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">자문기간</h3>
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

            {/* 소요시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                예상 소요시간 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  min="1"
                  required
                  placeholder="예: 2"
                  className="w-32 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-gray-600">시간</span>
              </div>
            </div>

            {/* 자문방식 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자문방식 <span className="text-red-500">*</span>
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

            {/* 자문비용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                자문비용 (선택)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="fee"
                  value={form.fee}
                  onChange={handleChange}
                  min="0"
                  placeholder="예: 30"
                  className="w-32 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-gray-600">만원</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">미입력 시 협의로 진행됩니다</p>
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
                placeholder="어떤 사람이 자문을 해주길 원하는지, 프로그램의 목적과 내용, 참가자 특성 등을 자세히 작성해 주세요."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* 요청기관 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">요청기관 정보</h3>
              <div className="space-y-4">
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
              <div className="mt-4">
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
            </div>

            {/* 안내 문구 */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-2">안내사항</p>
              <ul className="list-disc list-inside space-y-1">
                <li>접수된 요청은 담당자 검토 후 1-2일 내 연락드립니다.</li>
                <li>자문료는 자문 내용과 시간에 따라 협의 후 결정됩니다.</li>
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
              {isSubmitting ? '제출 중...' : '자문 요청하기'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
