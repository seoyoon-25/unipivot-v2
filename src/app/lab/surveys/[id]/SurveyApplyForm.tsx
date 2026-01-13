'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

interface Props {
  surveyId: string
}

export default function SurveyApplyForm({ surveyId }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    origin: 'NORTH',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email) {
      alert('이름과 이메일은 필수입니다.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/lab/surveys/${surveyId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '신청에 실패했습니다.')
      }

      setSuccess(true)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-medium text-gray-900">신청 완료</p>
        <p className="text-sm text-gray-500 mt-1">
          담당자 확인 후 연락드리겠습니다.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
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
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          연락처
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="010-0000-0000"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          출신
        </label>
        <select
          name="origin"
          value={form.origin}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="NORTH">북한</option>
          <option value="SOUTH">남한</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
      >
        {loading ? '신청 중...' : '참가 신청'}
      </button>
    </form>
  )
}
