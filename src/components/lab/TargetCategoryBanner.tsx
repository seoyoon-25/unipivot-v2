'use client'

import Link from 'next/link'
import {
  MIGRANT_BACKGROUND_CATEGORIES,
  getCategoryColorClasses,
} from '@/lib/constants/migrant'
import {
  MapPin,
  Heart,
  Briefcase,
  GraduationCap,
  Shield,
  Globe,
  Users,
  UserCheck,
} from 'lucide-react'

// 아이콘 매핑
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin,
  Heart,
  Briefcase,
  GraduationCap,
  Shield,
  Globe,
  Users,
  UserCheck,
}

interface TargetCategoryBannerProps {
  className?: string
  title?: string
  subtitle?: string
}

export function TargetCategoryBanner({
  className = '',
  title = '다양한 이주민 그룹을 연구합니다',
  subtitle = '전문가 검색, 설문조사, 연구 협력까지 한 곳에서',
}: TargetCategoryBannerProps) {
  return (
    <section className={`bg-gradient-to-r from-blue-50 to-purple-50 py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {MIGRANT_BACKGROUND_CATEGORIES.map((category) => {
            const IconComponent = iconMap[category.icon]
            const colors = getCategoryColorClasses(category.value)

            return (
              <Link
                key={category.value}
                href={`/lab/experts?category=${category.value}`}
                className={`flex flex-col items-center p-4 rounded-xl bg-white border ${colors.border} hover:shadow-md transition-shadow`}
              >
                <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mb-2`}>
                  {IconComponent && <IconComponent className={`w-6 h-6 ${colors.text}`} />}
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {category.labelShort}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// 간단한 가로 배너 버전
interface TargetCategoryHorizontalBannerProps {
  selectedCategory?: string | null
  onCategoryChange?: (category: string | null) => void
  className?: string
}

export function TargetCategoryHorizontalBanner({
  selectedCategory,
  onCategoryChange,
  className = '',
}: TargetCategoryHorizontalBannerProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="flex gap-2 pb-2 min-w-max">
        <button
          onClick={() => onCategoryChange?.(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            !selectedCategory
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">전체</span>
        </button>
        {MIGRANT_BACKGROUND_CATEGORIES.map((category) => {
          const IconComponent = iconMap[category.icon]
          const isSelected = selectedCategory === category.value
          const colors = getCategoryColorClasses(category.value)

          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange?.(isSelected ? null : category.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                isSelected
                  ? `${colors.bg} ${colors.text} border ${colors.border}`
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span className="text-sm font-medium">{category.labelShort}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
