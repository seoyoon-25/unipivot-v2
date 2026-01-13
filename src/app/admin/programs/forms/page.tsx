'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Eye, FileText, Copy } from 'lucide-react'

interface FormField {
  id: string
  label: string
  type: string
  required: boolean
  system?: boolean
  options?: { value: string; label: string }[]
  conditional?: { field: string; value: string }
}

interface ApplicationForm {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  fields: string
  createdAt: string
  _count?: {
    programs: number
  }
}

const fieldTypeLabels: Record<string, string> = {
  text: '텍스트',
  email: '이메일',
  tel: '전화번호',
  textarea: '긴 텍스트',
  radio: '선택 (라디오)',
  checkbox: '체크박스',
  select: '드롭다운',
}

export default function ApplicationFormsPage() {
  const [forms, setForms] = useState<ApplicationForm[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<ApplicationForm | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchForms()
  }, [])

  async function fetchForms() {
    try {
      const res = await fetch('/api/admin/application-forms')
      if (res.ok) {
        const data = await res.json()
        setForms(data)
      }
    } catch (error) {
      console.error('Failed to fetch forms:', error)
    }
    setLoading(false)
  }

  async function deleteForm(id: string) {
    if (!confirm('이 양식을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/application-forms/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setForms((prev) => prev.filter((f) => f.id !== id))
        if (selectedForm?.id === id) {
          setSelectedForm(null)
        }
      } else {
        const data = await res.json()
        alert(data.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  async function duplicateForm(form: ApplicationForm) {
    try {
      const res = await fetch('/api/admin/application-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.name} (복사본)`,
          description: form.description,
          fields: form.fields,
        }),
      })

      if (res.ok) {
        const newForm = await res.json()
        setForms((prev) => [newForm, ...prev])
      } else {
        const data = await res.json()
        alert(data.error || '복사 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('복사 중 오류가 발생했습니다.')
    }
  }

  const parseFields = (fieldsJson: string): FormField[] => {
    try {
      return JSON.parse(fieldsJson)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/programs"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">신청서 양식 관리</h1>
            <p className="text-gray-500">프로그램 신청서 양식을 관리합니다</p>
          </div>
        </div>
        <Link
          href="/admin/programs/forms/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 양식
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form List */}
        <div className="lg:col-span-1 space-y-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className={`bg-white rounded-xl p-4 border cursor-pointer transition-colors ${
                selectedForm?.id === form.id ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedForm(form)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{form.name}</h3>
                    {form.isDefault && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        기본
                      </span>
                    )}
                  </div>
                  {form.description && (
                    <p className="text-sm text-gray-500 mt-1">{form.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {parseFields(form.fields).length}개 필드
                    {form._count?.programs
                      ? ` · ${form._count.programs}개 프로그램에서 사용중`
                      : ''}
                  </p>
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}

          {forms.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              등록된 양식이 없습니다.
            </div>
          )}
        </div>

        {/* Form Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selectedForm ? (
            <>
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{selectedForm.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? '필드 목록' : '미리보기'}
                  </button>
                  <button
                    onClick={() => duplicateForm(selectedForm)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Copy className="w-4 h-4" />
                    복사
                  </button>
                  {!selectedForm.isDefault && (
                    <>
                      <Link
                        href={`/admin/programs/forms/${selectedForm.id}/edit`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                        수정
                      </Link>
                      <button
                        onClick={() => deleteForm(selectedForm.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-6">
                {showPreview ? (
                  <FormPreview fields={parseFields(selectedForm.fields)} />
                ) : (
                  <FieldsList fields={parseFields(selectedForm.fields)} />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              양식을 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldsList({ fields }: { fields: FormField[] }) {
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs font-medium">
            {index + 1}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{field.label}</span>
              {field.required && (
                <span className="text-red-500 text-xs">필수</span>
              )}
              {field.system && (
                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                  시스템
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span>{fieldTypeLabels[field.type] || field.type}</span>
              {field.conditional && (
                <span className="text-blue-600">
                  (조건부: {field.conditional.field} = {field.conditional.value})
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FormPreview({ fields }: { fields: FormField[] }) {
  return (
    <form className="space-y-6">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === 'text' && (
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={`${field.label}을 입력하세요`}
              disabled
            />
          )}
          {field.type === 'email' && (
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="example@email.com"
              disabled
            />
          )}
          {field.type === 'tel' && (
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="010-0000-0000"
              disabled
            />
          )}
          {field.type === 'textarea' && (
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder={`${field.label}을 입력하세요`}
              disabled
            />
          )}
          {field.type === 'radio' && field.options && (
            <div className="space-y-2">
              {field.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input type="radio" name={field.id} disabled />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
          {field.type === 'checkbox' && (
            <label className="flex items-center gap-2">
              <input type="checkbox" disabled />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          )}
          {field.type === 'select' && field.options && (
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled>
              <option>선택하세요</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </form>
  )
}
