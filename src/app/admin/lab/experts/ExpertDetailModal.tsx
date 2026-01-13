'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, User, Mail, Phone, Building, MapPin, Tag, BookOpen, CheckCircle, XCircle, Eye, EyeOff, Trash2, Globe, Users } from 'lucide-react'
import {
  getMigrantCategoryLabel,
  getCategoryColorClasses,
  getOriginCountryLabel,
} from '@/lib/constants/migrant'

interface Expert {
  id: string
  name: string
  title: string | null
  organization: string | null
  email: string
  phone: string | null
  origin: string | null
  originCategory: string | null
  originCountry: string | null
  arrivalYear: number | null
  defectionYear: number | null
  settlementYear: number | null
  hometown: string | null
  targetExpertise: string | null
  categories: string | null
  specialties: string | null
  isVerified: boolean
  isPublic: boolean
  isActive: boolean
  viewCount: number
  lectureCount: number
  createdAt: Date
}

interface Props {
  expert: Expert
  onClose: () => void
}

// 출신 카테고리 표시 (새 필드 우선, 하위 호환)
function getOriginDisplay(expert: Expert): { label: string; colorClasses: ReturnType<typeof getCategoryColorClasses> } {
  if (expert.originCategory) {
    return {
      label: getMigrantCategoryLabel(expert.originCategory),
      colorClasses: getCategoryColorClasses(expert.originCategory),
    }
  }
  if (expert.origin === 'NORTH') {
    return {
      label: '북한이탈주민',
      colorClasses: getCategoryColorClasses('DEFECTOR'),
    }
  }
  if (expert.origin === 'SOUTH') {
    return {
      label: '내국인',
      colorClasses: getCategoryColorClasses('KOREAN'),
    }
  }
  return {
    label: '-',
    colorClasses: getCategoryColorClasses(null),
  }
}

export default function ExpertDetailModal({ expert, onClose }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const parseCategories = (categories: string | null): string[] => {
    if (!categories) return []
    try {
      return JSON.parse(categories)
    } catch {
      return []
    }
  }

  const parseSpecialties = (specialties: string | null): string[] => {
    if (!specialties) return []
    try {
      return JSON.parse(specialties)
    } catch {
      return specialties.split(',').map(s => s.trim())
    }
  }

  const handleToggleVerified = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/lab/experts/${expert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !expert.isVerified }),
      })
      if (res.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error('Error toggling verified:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTogglePublic = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/lab/experts/${expert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !expert.isPublic }),
      })
      if (res.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error('Error toggling public:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 전문가를 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/lab/experts/${expert.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error('Error deleting expert:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const categories = parseCategories(expert.categories)
  const specialties = parseSpecialties(expert.specialties)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">전문가 상세</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{expert.name}</h3>
              {expert.title && (
                <p className="text-gray-600">{expert.title}</p>
              )}
              {expert.organization && (
                <p className="text-sm text-gray-500">{expert.organization}</p>
              )}
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                expert.isVerified
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {expert.isVerified ? '검증됨' : '대기중'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                expert.isPublic
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {expert.isPublic ? '공개' : '비공개'}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-medium text-gray-900">연락처 정보</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{expert.email}</span>
              </div>
              {expert.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{expert.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Origin Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-medium text-gray-900">출신 정보</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  이주배경:{' '}
                  {(() => {
                    const display = getOriginDisplay(expert)
                    return (
                      <span className={`ml-1 px-2 py-0.5 text-xs rounded ${display.colorClasses.bg} ${display.colorClasses.text}`}>
                        {display.label}
                      </span>
                    )
                  })()}
                </span>
              </div>
              {expert.originCountry && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">출신국가: {getOriginCountryLabel(expert.originCountry)}</span>
                </div>
              )}
              {expert.hometown && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">고향: {expert.hometown}</span>
                </div>
              )}
              {(expert.defectionYear || expert.arrivalYear) && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">
                    {expert.originCategory === 'DEFECTOR' ? '탈북년도' : '입국년도'}:{' '}
                    {expert.defectionYear || expert.arrivalYear}년
                  </span>
                </div>
              )}
              {expert.settlementYear && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">정착년도: {expert.settlementYear}년</span>
                </div>
              )}
            </div>
          </div>

          {/* Target Expertise */}
          {expert.targetExpertise && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                전문 대상 그룹
              </h4>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  try {
                    const targets = JSON.parse(expert.targetExpertise) as string[]
                    return targets.map((target, idx) => {
                      const colorClasses = getCategoryColorClasses(target)
                      return (
                        <span
                          key={idx}
                          className={`px-3 py-1 text-sm rounded-full ${colorClasses.bg} ${colorClasses.text}`}
                        >
                          {getMigrantCategoryLabel(target)}
                        </span>
                      )
                    })
                  } catch {
                    return null
                  }
                })()}
              </div>
            </div>
          )}

          {/* Categories & Specialties */}
          <div className="space-y-4">
            {categories.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  전문 분야
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {specialties.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  세부 전문분야
                </h4>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((spec, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{expert.viewCount}</p>
              <p className="text-sm text-gray-500">조회수</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{expert.lectureCount}</p>
              <p className="text-sm text-gray-500">강의 수</p>
            </div>
          </div>

          {/* Created Date */}
          <div className="text-sm text-gray-500">
            등록일: {new Date(expert.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleTogglePublic}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                expert.isPublic
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {expert.isPublic ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  비공개로 전환
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  공개로 전환
                </>
              )}
            </button>
            <button
              onClick={handleToggleVerified}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                expert.isVerified
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {expert.isVerified ? (
                <>
                  <XCircle className="w-4 h-4" />
                  검증 취소
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  검증 승인
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
