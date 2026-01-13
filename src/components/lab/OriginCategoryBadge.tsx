'use client'

import {
  getMigrantCategoryLabel,
  getMigrantCategoryLabelShort,
  getCategoryColorClasses,
  MigrantCategoryValue,
  MIGRANT_CATEGORIES,
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
  User,
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
  User,
}

interface OriginCategoryBadgeProps {
  category: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showFullLabel?: boolean
  className?: string
}

export function OriginCategoryBadge({
  category,
  size = 'md',
  showIcon = false,
  showFullLabel = false,
  className = '',
}: OriginCategoryBadgeProps) {
  if (!category) return null

  const colors = getCategoryColorClasses(category)
  const label = showFullLabel
    ? getMigrantCategoryLabel(category)
    : getMigrantCategoryLabelShort(category)

  const categoryData = MIGRANT_CATEGORIES[category as MigrantCategoryValue]
  const IconComponent = categoryData ? iconMap[categoryData.icon] : null

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && IconComponent && <IconComponent className={iconSizes[size]} />}
      {label}
    </span>
  )
}

// 여러 카테고리 뱃지
interface OriginCategoryBadgeListProps {
  categories: string[]
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  maxDisplay?: number
  className?: string
}

export function OriginCategoryBadgeList({
  categories,
  size = 'sm',
  showIcon = false,
  maxDisplay = 3,
  className = '',
}: OriginCategoryBadgeListProps) {
  if (!categories || categories.length === 0) return null

  const displayCategories = categories.slice(0, maxDisplay)
  const remaining = categories.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayCategories.map((cat) => (
        <OriginCategoryBadge key={cat} category={cat} size={size} showIcon={showIcon} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
          +{remaining}
        </span>
      )}
    </div>
  )
}

// 전문 대상 그룹 표시 (전문가 카드용)
interface ExpertiseTargetBadgesProps {
  targetExpertise: string | null | undefined
  size?: 'sm' | 'md'
  className?: string
}

export function ExpertiseTargetBadges({
  targetExpertise,
  size = 'sm',
  className = '',
}: ExpertiseTargetBadgesProps) {
  if (!targetExpertise) return null

  try {
    const targets = JSON.parse(targetExpertise) as string[]
    if (!Array.isArray(targets) || targets.length === 0) return null

    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        <span className="text-xs text-gray-500 mr-1">전문:</span>
        {targets.slice(0, 2).map((cat) => (
          <OriginCategoryBadge key={cat} category={cat} size={size} />
        ))}
        {targets.length > 2 && (
          <span className="text-xs text-gray-500">+{targets.length - 2}</span>
        )}
      </div>
    )
  } catch {
    return null
  }
}
