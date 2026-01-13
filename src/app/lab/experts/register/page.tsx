'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Upload, CheckCircle } from 'lucide-react'
import {
  MIGRANT_CATEGORY_LIST,
  ORIGIN_COUNTRIES,
  MIGRANT_BACKGROUND_CATEGORIES,
  CATEGORY_SPECIFIC_FIELDS,
  getMigrantCategoryLabel,
  getCategoryColorClasses,
  type MigrantCategoryValue,
} from '@/lib/constants/migrant'

interface Category {
  id: string
  name: string
}

interface Education {
  school: string
  degree: string
  major: string
  year: string
}

interface Career {
  company: string
  position: string
  period: string
}

export default function ExpertRegisterPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    organization: '',
    // 이주배경 정보
    originCategory: '' as string,
    originCountry: '',
    arrivalYear: '',
    // 북한이탈주민 특화 필드 (기존 호환)
    origin: 'NORTH',
    defectionYear: '',
    settlementYear: '',
    hometown: '',
    // 전문 대상 그룹
    targetExpertise: [] as string[],
    selectedCategories: [] as string[],
    specialties: '',
    lectureTopics: '',
    lectureAreas: [] as string[],
    lectureFeeMin: '',
    lectureFeeMax: '',
    lectureNote: '',
    bio: '',
    surveyAvailable: true,
    interviewAvailable: true,
  })

  const [education, setEducation] = useState<Education[]>([
    { school: '', degree: '', major: '', year: '' },
  ])

  const [career, setCareer] = useState<Career[]>([
    { company: '', position: '', period: '' },
  ])

  useEffect(() => {
    fetch('/api/lab/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const toggleCategory = (category: string) => {
    setForm((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category],
    }))
  }

  const toggleArea = (area: string) => {
    setForm((prev) => ({
      ...prev,
      lectureAreas: prev.lectureAreas.includes(area)
        ? prev.lectureAreas.filter((a) => a !== area)
        : [...prev.lectureAreas, area],
    }))
  }

  const toggleTargetExpertise = (category: string) => {
    setForm((prev) => ({
      ...prev,
      targetExpertise: prev.targetExpertise.includes(category)
        ? prev.targetExpertise.filter((c) => c !== category)
        : [...prev.targetExpertise, category],
    }))
  }

  // 이주배경 카테고리에 따른 필드 표시 여부
  const showDefectorFields = form.originCategory === 'DEFECTOR'
  const showCountryField = form.originCategory && form.originCategory !== 'DEFECTOR' && form.originCategory !== 'KOREAN'
  const showArrivalYearField = form.originCategory && form.originCategory !== 'KOREAN' && form.originCategory !== 'MULTICULTURAL_CHILD'

  const addEducation = () => {
    setEducation((prev) => [...prev, { school: '', degree: '', major: '', year: '' }])
  }

  const removeEducation = (idx: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateEducation = (idx: number, field: keyof Education, value: string) => {
    setEducation((prev) =>
      prev.map((edu, i) => (i === idx ? { ...edu, [field]: value } : edu))
    )
  }

  const addCareer = () => {
    setCareer((prev) => [...prev, { company: '', position: '', period: '' }])
  }

  const removeCareer = (idx: number) => {
    setCareer((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateCareer = (idx: number, field: keyof Career, value: string) => {
    setCareer((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email) {
      alert('이름과 이메일은 필수입니다.')
      return
    }

    if (!form.originCategory) {
      alert('이주배경을 선택해주세요.')
      return
    }

    if (form.selectedCategories.length === 0) {
      alert('전문 분야를 최소 1개 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...form,
        // 새 필드들
        originCategory: form.originCategory,
        originCountry: form.originCountry || null,
        arrivalYear: form.arrivalYear ? parseInt(form.arrivalYear) : null,
        targetExpertise: form.targetExpertise.length > 0 ? form.targetExpertise : null,
        // 기존 필드들
        categories: JSON.stringify(form.selectedCategories),
        lectureAreas: JSON.stringify(form.lectureAreas),
        education: JSON.stringify(education.filter((e) => e.school)),
        career: JSON.stringify(career.filter((c) => c.company)),
        defectionYear: form.defectionYear ? parseInt(form.defectionYear) : null,
        settlementYear: form.settlementYear ? parseInt(form.settlementYear) : null,
        lectureFeeMin: form.lectureFeeMin ? parseInt(form.lectureFeeMin) : null,
        lectureFeeMax: form.lectureFeeMax ? parseInt(form.lectureFeeMax) : null,
      }

      const res = await fetch('/api/lab/experts/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '등록에 실패했습니다.')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">등록 완료</h1>
          <p className="text-gray-600 mb-6">
            전문가 등록 신청이 완료되었습니다.
            관리자 검토 후 프로필이 공개됩니다.
          </p>
          <Link
            href="/lab/experts"
            className="inline-flex px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            전문가 목록으로
          </Link>
        </div>
      </div>
    )
  }

  const areas = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주', '전국']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/lab/experts"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            전문가 목록으로
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">전문가 등록</h1>
          <p className="text-gray-600 mb-8">
            전문가로 등록하시면 강연, 자문, 연구 협력 기회를 얻을 수 있습니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 기본 정보 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                기본 정보
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>

              {/* 이주배경 선택 */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이주배경 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MIGRANT_CATEGORY_LIST.map((cat) => {
                    const isSelected = form.originCategory === cat.value
                    const colorClasses = getCategoryColorClasses(cat.value)
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          originCategory: cat.value,
                          // DEFECTOR 선택 시 origin도 설정
                          origin: cat.value === 'DEFECTOR' ? 'NORTH' : cat.value === 'KOREAN' ? 'SOUTH' : 'OVERSEAS',
                          // 카테고리 변경 시 관련 필드 초기화
                          originCountry: cat.value === 'DEFECTOR' ? 'NORTH_KOREA' : '',
                        }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? `${colorClasses.bg} ${colorClasses.text} ring-2 ring-offset-1 ring-${cat.color}-300`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 출신 국가 (내국인, 북한이탈주민 제외) */}
              {showCountryField && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    출신 국가
                  </label>
                  <select
                    name="originCountry"
                    value={form.originCountry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">선택해주세요</option>
                    {ORIGIN_COUNTRIES.filter(c => c.value !== 'NORTH_KOREA').map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 입국년도 (내국인, 다문화자녀 제외) */}
              {showArrivalYearField && !showDefectorFields && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.originCategory === 'NATURALIZED' ? '귀화년도' : '입국년도'}
                  </label>
                  <input
                    type="number"
                    name="arrivalYear"
                    value={form.arrivalYear}
                    onChange={handleChange}
                    placeholder={new Date().getFullYear().toString()}
                    min="1950"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary md:w-1/3"
                  />
                </div>
              )}

              {/* 북한이탈주민 특화 필드 */}
              {showDefectorFields && (
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      고향
                    </label>
                    <input
                      type="text"
                      name="hometown"
                      value={form.hometown}
                      onChange={handleChange}
                      placeholder="평양, 함경북도 등"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      탈북년도
                    </label>
                    <input
                      type="number"
                      name="defectionYear"
                      value={form.defectionYear}
                      onChange={handleChange}
                      placeholder="2010"
                      min="1990"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      정착년도
                    </label>
                    <input
                      type="number"
                      name="settlementYear"
                      value={form.settlementYear}
                      onChange={handleChange}
                      placeholder="2011"
                      min="1990"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* 소속 정보 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                소속 정보
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    직함
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="연구원, 교수, 강사 등"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    소속기관
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={form.organization}
                    onChange={handleChange}
                    placeholder="기관명 또는 프리랜서"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </section>

            {/* 전문 분야 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                전문 분야 <span className="text-red-500">*</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      form.selectedCategories.includes(cat.name)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  세부 전문 분야
                </label>
                <input
                  type="text"
                  name="specialties"
                  value={form.specialties}
                  onChange={handleChange}
                  placeholder="구체적인 전문 분야를 입력해주세요"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </section>

            {/* 전문 대상 그룹 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                전문 대상 그룹
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                어떤 이주배경 그룹에 대해 전문성이 있으신가요? (복수 선택 가능)
              </p>
              <div className="flex flex-wrap gap-2">
                {MIGRANT_BACKGROUND_CATEGORIES.map((cat) => {
                  const isSelected = form.targetExpertise.includes(cat.value)
                  const colorClasses = getCategoryColorClasses(cat.value)
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleTargetExpertise(cat.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? `${colorClasses.bg} ${colorClasses.text} ring-2 ring-offset-1`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 학력 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                학력
              </h2>
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl relative">
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="학교명"
                        value={edu.school}
                        onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="학위 (학사, 석사, 박사)"
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="전공"
                        value={edu.major}
                        onChange={(e) => updateEducation(idx, 'major', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="졸업년도"
                        value={edu.year}
                        onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  학력 추가
                </button>
              </div>
            </section>

            {/* 경력 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                경력
              </h2>
              <div className="space-y-4">
                {career.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl relative">
                    {career.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCareer(idx)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="기관/회사명"
                        value={item.company}
                        onChange={(e) => updateCareer(idx, 'company', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="직위/역할"
                        value={item.position}
                        onChange={(e) => updateCareer(idx, 'position', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="기간 (예: 2020~현재)"
                        value={item.period}
                        onChange={(e) => updateCareer(idx, 'period', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCareer}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  경력 추가
                </button>
              </div>
            </section>

            {/* 강연 정보 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                강연 정보
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    강연 가능 주제
                  </label>
                  <textarea
                    name="lectureTopics"
                    value={form.lectureTopics}
                    onChange={handleChange}
                    rows={3}
                    placeholder="강연 가능한 주제를 입력해주세요"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    강연 가능 지역
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArea(area)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          form.lectureAreas.includes(area)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      최소 강연료 (만원)
                    </label>
                    <input
                      type="number"
                      name="lectureFeeMin"
                      value={form.lectureFeeMin}
                      onChange={handleChange}
                      placeholder="30"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      최대 강연료 (만원)
                    </label>
                    <input
                      type="number"
                      name="lectureFeeMax"
                      value={form.lectureFeeMax}
                      onChange={handleChange}
                      placeholder="50"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 자기소개 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                자기소개
              </h2>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={5}
                placeholder="자기소개를 작성해주세요"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </section>

            {/* 연구 참여 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                연구 참여 의향
              </h2>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="surveyAvailable"
                    checked={form.surveyAvailable}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700">설문조사 참여 가능</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="interviewAvailable"
                    checked={form.interviewAvailable}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700">인터뷰 참여 가능</span>
                </label>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
              >
                {loading ? '등록 중...' : '전문가 등록 신청'}
              </button>
              <p className="mt-4 text-sm text-gray-500 text-center">
                등록 신청 후 관리자 검토를 거쳐 프로필이 공개됩니다.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
