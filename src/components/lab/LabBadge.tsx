'use client'

import { Award, Mic, ClipboardCheck } from 'lucide-react'
import { BadgeTypes } from '@/lib/lab/constants'

interface LabBadgeProps {
  type: keyof typeof BadgeTypes
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  stats?: string
}

const iconMap = {
  EXPERT: Award,
  INSTRUCTOR: Mic,
  PARTICIPANT: ClipboardCheck,
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

const containerClasses = {
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
}

export function LabBadge({ type, size = 'md', showLabel = false, stats }: LabBadgeProps) {
  const badge = BadgeTypes[type]
  const Icon = iconMap[type]

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${badge.color} ${containerClasses[size]} rounded-full flex items-center justify-center`}
        title={`${badge.label}: ${badge.description}`}
      >
        <Icon className={`${sizeClasses[size]} text-white`} />
      </div>
      {showLabel && (
        <div>
          <span className="text-sm font-medium text-gray-900">{badge.label}</span>
          {stats && <span className="text-xs text-gray-500 ml-1">({stats})</span>}
        </div>
      )}
    </div>
  )
}

interface LabBadgeListProps {
  badges: {
    expert?: { earned: boolean }
    instructor?: { earned: boolean; matchCount: number }
    participant?: { earned: boolean; surveyCount: number; interviewCount: number }
  }
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
}

export function LabBadgeList({ badges, size = 'md', showLabels = false }: LabBadgeListProps) {
  const earnedBadges: Array<{ type: keyof typeof BadgeTypes; stats?: string }> = []

  if (badges.expert?.earned) {
    earnedBadges.push({ type: 'EXPERT' })
  }
  if (badges.instructor?.earned) {
    earnedBadges.push({
      type: 'INSTRUCTOR',
      stats: `강연 ${badges.instructor.matchCount}회`,
    })
  }
  if (badges.participant?.earned) {
    const stats = []
    if (badges.participant.surveyCount > 0) {
      stats.push(`설문 ${badges.participant.surveyCount}회`)
    }
    if (badges.participant.interviewCount > 0) {
      stats.push(`인터뷰 ${badges.participant.interviewCount}회`)
    }
    earnedBadges.push({
      type: 'PARTICIPANT',
      stats: stats.join(', '),
    })
  }

  if (earnedBadges.length === 0) {
    return null
  }

  return (
    <div className={showLabels ? 'space-y-2' : 'flex items-center gap-1'}>
      {earnedBadges.map((badge) => (
        <LabBadge
          key={badge.type}
          type={badge.type}
          size={size}
          showLabel={showLabels}
          stats={badge.stats}
        />
      ))}
    </div>
  )
}
