'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, TrendingUp, MessageSquare, BarChart3, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// 기존 관심사 컴포넌트 재사용
import { InterestInput, TopInterests, KeywordDetailModal, NetworkGraph } from '@/components/interests'
import { PostItNote } from './PostItNote'
import { InterestPosterCard } from './InterestPosterCard'
import { SurveyCard } from '@/components/surveys'

interface BulletinBoardProps {
  className?: string
}

interface Interest {
  id: string
  keyword: { keyword: string }
  content?: string
  nickname?: string
  likeCount: number
  createdAt: string
}

interface Keyword {
  id: string
  keyword: string
  category?: string | null
  totalCount: number
  likeCount: number
  isFixed: boolean
  isRecommended: boolean
}

interface Survey {
  id: string
  title: string
  description?: string
  type: string
  responseCount: number
  options: Array<{ id: string; text: string; responseCount: number }>
}

export function BulletinBoard({ className }: BulletinBoardProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    interests: true,
    surveys: true,
    trending: true,
    network: false
  })

  // 데이터 상태
  const [recentInterests, setRecentInterests] = useState<Interest[]>([])
  const [topKeywords, setTopKeywords] = useState<Keyword[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [interestsRes, keywordsRes, surveysRes] = await Promise.all([
          fetch('/api/interests?limit=12'),
          fetch('/api/interests/keywords?type=popular&limit=8'),
          fetch('/api/issue-surveys?limit=3')
        ])

        if (interestsRes.ok) {
          const data = await interestsRes.json()
          setRecentInterests(data.interests || [])
        }

        if (keywordsRes.ok) {
          const data = await keywordsRes.json()
          setTopKeywords(data.keywords || [])
        }

        if (surveysRes.ok) {
          const data = await surveysRes.json()
          setSurveys(data.surveys || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleKeywordClick = useCallback((keyword: string) => {
    setSelectedKeyword(keyword)
  }, [])

  const handleNetworkNodeClick = useCallback((node: any) => {
    setSelectedKeyword(node.keyword)
  }, [])

  const handleSubmitSuccess = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  // 포스트잇 색상 랜덤 배열
  const postItColors: Array<'yellow' | 'pink' | 'blue' | 'green' | 'orange'> = ['yellow', 'pink', 'blue', 'green', 'orange']
  const getRandomColor = (index: number) => postItColors[index % postItColors.length]
  const getRandomRotation = (index: number) => (index % 3 - 1) * 2

  return (
    <section className={cn('py-16', className)}>
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-800 text-sm font-medium mb-4">
            📌 우리의 이야기
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            유니피벗 관심사 벽보판
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            당신의 관심사를 포스터로 붙여주세요.
            <br className="hidden sm:block" />
            여기서 나눈 이야기가 새로운 프로그램으로 이어집니다.
          </p>
        </div>

        {/* 코르크 보드 영역 */}
        <div className="cork-board-light p-6 md:p-8">

        {/* 설문 섹션 */}
        {surveys.length > 0 && (
          <CollapsibleSection
            title="지금 진행 중인 설문"
            icon={<BarChart3 className="w-5 h-5" />}
            badge={`${surveys.length}개 진행 중`}
            isExpanded={expandedSections.surveys}
            onToggle={() => toggleSection('surveys')}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {surveys.map(survey => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onRespond={() => setRefreshKey(prev => prev + 1)}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 관심사 입력 & 최근 관심사 */}
        <CollapsibleSection
          title="관심사 남기기"
          icon={<Plus className="w-5 h-5" />}
          badge="포스트잇 붙이기"
          isExpanded={expandedSections.interests}
          onToggle={() => toggleSection('interests')}
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 입력 */}
            <div>
              <InterestInput onSubmit={handleSubmitSuccess} />
            </div>

            {/* 최근 포스트잇 */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">최근 남겨진 관심사</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {recentInterests.slice(0, 6).map((interest, index) => (
                  <PostItNote
                    key={interest.id}
                    id={interest.id}
                    keyword={interest.keyword.keyword}
                    content={interest.content}
                    nickname={interest.nickname}
                    likeCount={interest.likeCount}
                    createdAt={interest.createdAt}
                    color={getRandomColor(index)}
                    rotation={getRandomRotation(index)}
                    onClick={() => handleKeywordClick(interest.keyword.keyword)}
                  />
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 인기 키워드 포스터 */}
        <CollapsibleSection
          title="지금 뜨는 관심사"
          icon={<TrendingUp className="w-5 h-5" />}
          badge="TOP 8"
          isExpanded={expandedSections.trending}
          onToggle={() => toggleSection('trending')}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topKeywords.map((kw, index) => (
              <InterestPosterCard
                key={kw.id}
                id={kw.id}
                keyword={kw.keyword}
                category={kw.category}
                totalCount={kw.totalCount}
                likeCount={kw.likeCount}
                isFixed={kw.isFixed}
                isRecommended={kw.isRecommended}
                trend={index < 3 ? 'up' : undefined}
                onClick={() => handleKeywordClick(kw.keyword)}
              />
            ))}
          </div>

          <div className="mt-6">
            <TopInterests key={`top-${refreshKey}`} onKeywordClick={handleKeywordClick} />
          </div>
        </CollapsibleSection>

        {/* 네트워크 그래프 */}
        <CollapsibleSection
          title="관심사 연결 네트워크"
          icon={<Share2 className="w-5 h-5" />}
          badge="시각화"
          isExpanded={expandedSections.network}
          onToggle={() => toggleSection('network')}
        >
          <NetworkGraph key={`network-${refreshKey}`} onNodeClick={handleNetworkNodeClick} />
        </CollapsibleSection>

        </div> {/* cork-board-light 닫기 */}

        {/* 안내 문구 */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>
            입력하신 관심사는 통계로 활용되며, 관련 프로그램 개설에 반영됩니다.
          </p>
          <p className="mt-1">
            알림을 신청하시면 관련 프로그램이 열릴 때 알려드립니다.
          </p>
        </div>
      </div>

      {/* 키워드 상세 모달 */}
      <KeywordDetailModal
        keyword={selectedKeyword || ''}
        isOpen={!!selectedKeyword}
        onClose={() => setSelectedKeyword(null)}
      />
    </section>
  )
}

// 접이식 섹션 컴포넌트
interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  badge?: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  icon,
  badge,
  isExpanded,
  onToggle,
  children
}: CollapsibleSectionProps) {
  return (
    <div className="bulletin-accordion">
      <div
        className="bulletin-accordion-header"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="p-2 bg-amber-100 rounded-lg text-amber-700">
            {icon}
          </span>
          <span className="font-semibold text-gray-800">{title}</span>
          {badge && (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
              {badge}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </Button>
      </div>
      {isExpanded && (
        <div className="bulletin-accordion-content">
          {children}
        </div>
      )}
    </div>
  )
}
