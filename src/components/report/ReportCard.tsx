'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Heart, MessageCircle, Eye, MoreHorizontal, Edit, Trash2, Lock, Users, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ReportStructureCode,
  getStructureIcon,
  getStructureName,
  REPORT_STRUCTURES,
} from '@/types/report'

interface ReportCardProps {
  report: {
    id: string
    title: string | null
    content: string
    visibility: string
    createdAt: Date
    updatedAt: Date
    user?: {
      id: string
      name: string | null
      image: string | null
    }
    session?: {
      id: string
      sessionNumber: number
      title: string | null
    }
    _count?: {
      comments: number
      likes: number
    }
    structuredReport?: {
      structure: string
      sections: string
    } | null
  }
  currentUserId?: string
  showAuthor?: boolean
  showSession?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export function ReportCard({
  report,
  currentUserId,
  showAuthor = true,
  showSession = true,
  onEdit,
  onDelete,
  className,
}: ReportCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const isOwner = currentUserId === report.user?.id

  // 내용 미리보기 (HTML 태그 제거)
  const contentPreview = report.content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
    .slice(0, 150)

  // 공개 여부 아이콘
  const visibilityConfig = {
    PRIVATE: { icon: Lock, label: '나만 보기', color: 'text-gray-500' },
    GROUP: { icon: Users, label: '모임 공개', color: 'text-blue-500' },
    PUBLIC: { icon: Globe, label: '전체 공개', color: 'text-green-500' },
  }
  const visibility = visibilityConfig[report.visibility as keyof typeof visibilityConfig] || visibilityConfig.PRIVATE
  const VisibilityIcon = visibility.icon

  // 구조 정보
  const structureCode = report.structuredReport?.structure as ReportStructureCode | undefined
  const structureInfo = structureCode ? REPORT_STRUCTURES[structureCode] : null

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* 상단: 작성자 정보 & 메뉴 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {showAuthor && report.user && (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                {report.user.image ? (
                  <img
                    src={report.user.image}
                    alt={report.user.name || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                    {report.user.name?.slice(0, 1) || '?'}
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{report.user.name}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: ko })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 구조 뱃지 */}
          {structureInfo && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
                structureInfo.color
              )}
            >
              <span>{structureInfo.icon}</span>
              <span>{structureInfo.name}</span>
            </span>
          )}

          {/* 공개 여부 */}
          <span className={cn('flex items-center gap-1 text-xs', visibility.color)}>
            <VisibilityIcon className="w-3.5 h-3.5" />
          </span>

          {/* 메뉴 */}
          {isOwner && (onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-10">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onEdit(report.id)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onDelete(report.id)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 제목 */}
      {report.title && (
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {report.title}
        </h3>
      )}

      {/* 회차 정보 */}
      {showSession && report.session && (
        <div className="text-xs text-primary font-medium mb-2">
          {report.session.sessionNumber}회차 {report.session.title && `- ${report.session.title}`}
        </div>
      )}

      {/* 내용 미리보기 */}
      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
        {contentPreview}
        {contentPreview.length >= 150 && '...'}
      </p>

      {/* 하단: 상호작용 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {report._count?.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {report._count?.comments || 0}
          </span>
        </div>

        <Link
          href={`/my/reports/${report.id}`}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Eye className="w-4 h-4" />
          자세히 보기
        </Link>
      </div>
    </div>
  )
}

// 작은 크기 버전 (목록 등에서 사용)
export function ReportCardCompact({
  report,
  className,
}: {
  report: {
    id: string
    title: string | null
    createdAt: Date
    structuredReport?: {
      structure: string
    } | null
  }
  className?: string
}) {
  const structureCode = report.structuredReport?.structure as ReportStructureCode | undefined
  const structureInfo = structureCode ? REPORT_STRUCTURES[structureCode] : null

  return (
    <Link
      href={`/my/reports/${report.id}`}
      className={cn(
        'flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {report.title || '제목 없음'}
        </div>
        <div className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: ko })}
        </div>
      </div>

      {structureInfo && (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ml-2 flex-shrink-0',
            structureInfo.color
          )}
        >
          <span>{structureInfo.icon}</span>
          <span>{structureInfo.name}</span>
        </span>
      )}
    </Link>
  )
}
