import { Suspense } from 'react'
import Link from 'next/link'
import { ClipboardList, Mic, Clock, Users, Gift, Calendar, ArrowRight, Globe, ListFilter } from 'lucide-react'
import { prisma } from '@/lib/db'
import {
  MIGRANT_CATEGORY_LIST,
  getMigrantCategoryLabel,
  getCategoryColorClasses,
} from '@/lib/constants/migrant'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '설문/인터뷰',
  description: '이주배경 주민 대상 설문조사 및 인터뷰 참가 모집',
}

async function getSurveys(searchParams: { type?: string; status?: string; page?: string; targetCategory?: string }) {
  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const where: any = {
    isPublic: true,
  }

  if (searchParams.status) {
    where.status = searchParams.status
  } else {
    where.status = { in: ['RECRUITING', 'CLOSED', 'COMPLETED'] }
  }

  if (searchParams.type) {
    where.type = searchParams.type
  }

  // 대상 이주배경 필터
  if (searchParams.targetCategory) {
    where.OR = [
      { targetCategories: { contains: searchParams.targetCategory, mode: 'insensitive' as const } },
      // 하위 호환: DEFECTOR → NORTH, KOREAN → SOUTH
      ...(searchParams.targetCategory === 'DEFECTOR' ? [{ targetOrigin: 'NORTH' }] : []),
      ...(searchParams.targetCategory === 'KOREAN' ? [{ targetOrigin: 'SOUTH' }] : []),
      { targetOrigin: 'ALL' },
    ]
  }

  const [surveys, total] = await Promise.all([
    prisma.labSurvey.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { endDate: 'asc' },
      ],
      skip,
      take: limit,
    }),
    prisma.labSurvey.count({ where }),
  ])

  return {
    surveys,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

interface PageProps {
  searchParams: Promise<{ type?: string; status?: string; page?: string; targetCategory?: string }>
}

export default async function SurveysPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { surveys, pagination } = await getSurveys(params)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">설문/인터뷰</h1>
          <p className="text-gray-600 max-w-2xl">
            이주배경 주민 대상 설문조사 및 인터뷰에 참여하고 사례비를 받으세요.
            여러분의 경험과 의견이 연구에 소중하게 활용됩니다.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-8 space-y-4">
          {/* Type Filter - 설문조사/인터뷰 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">유형 선택</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href={`/lab/surveys${params.status ? `?status=${params.status}` : ''}${params.targetCategory ? `${params.status ? '&' : '?'}targetCategory=${params.targetCategory}` : ''}`}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  !params.type
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                전체
              </Link>
              <Link
                href={`/lab/surveys?type=SURVEY${params.status ? `&status=${params.status}` : ''}${params.targetCategory ? `&targetCategory=${params.targetCategory}` : ''}`}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  params.type === 'SURVEY'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                설문조사
              </Link>
              <Link
                href={`/lab/surveys?type=INTERVIEW${params.status ? `&status=${params.status}` : ''}${params.targetCategory ? `&targetCategory=${params.targetCategory}` : ''}`}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  params.type === 'INTERVIEW'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Mic className="w-4 h-4" />
                인터뷰
              </Link>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">진행 상태</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/lab/surveys${params.type ? `?type=${params.type}` : ''}${params.targetCategory ? `${params.type ? '&' : '?'}targetCategory=${params.targetCategory}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !params.status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </Link>
              <Link
                href={`/lab/surveys?${params.type ? `type=${params.type}&` : ''}status=RECRUITING${params.targetCategory ? `&targetCategory=${params.targetCategory}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  params.status === 'RECRUITING'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                진행중
              </Link>
              <Link
                href={`/lab/surveys?${params.type ? `type=${params.type}&` : ''}status=COMPLETED${params.targetCategory ? `&targetCategory=${params.targetCategory}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  params.status === 'COMPLETED'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                진행완료
              </Link>
            </div>
          </div>

          {/* Target Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">대상 이주배경</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/lab/surveys${params.type ? `?type=${params.type}` : ''}${params.status ? `${params.type ? '&' : '?'}status=${params.status}` : ''}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !params.targetCategory
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </Link>
              {MIGRANT_CATEGORY_LIST.filter(cat => cat.value !== 'KOREAN').map((cat) => {
                const colorClasses = getCategoryColorClasses(cat.value)
                const baseUrl = '/lab/surveys?'
                const typeParam = params.type ? `type=${params.type}&` : ''
                const statusParam = params.status ? `status=${params.status}&` : ''
                return (
                  <Link
                    key={cat.value}
                    href={`${baseUrl}${typeParam}${statusParam}targetCategory=${cat.value}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      params.targetCategory === cat.value
                        ? `${colorClasses.bg} ${colorClasses.text}`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            총 <span className="font-semibold text-primary">{pagination.total}</span>개의 {params.type === 'SURVEY' ? '설문조사' : params.type === 'INTERVIEW' ? '인터뷰' : '설문/인터뷰'}
          </p>
        </div>

        {/* Survey Grid */}
        {surveys.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            {params.type === 'INTERVIEW' ? (
              <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            ) : (
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            )}
            <p className="text-gray-500">
              현재 진행 중인 {params.type === 'SURVEY' ? '설문조사가' : params.type === 'INTERVIEW' ? '인터뷰가' : '설문/인터뷰가'} 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <Link
                key={i + 1}
                href={`/lab/surveys?page=${i + 1}${params.type ? `&type=${params.type}` : ''}${params.status ? `&status=${params.status}` : ''}${params.targetCategory ? `&targetCategory=${params.targetCategory}` : ''}`}
                className={`px-4 py-2 rounded-lg ${
                  pagination.page === i + 1
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SurveyCard({ survey }: { survey: any }) {
  const isOngoing = survey.status === 'RECRUITING'
  const isCompleted = survey.status === 'COMPLETED' || survey.status === 'CLOSED'
  const progress = Math.min((survey.currentCount / survey.targetCount) * 100, 100)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Link
      href={`/lab/surveys/${survey.id}`}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group"
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOngoing
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isOngoing ? '진행중' : '진행완료'}
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-500">
          {survey.type === 'INTERVIEW' ? (
            <>
              <Mic className="w-4 h-4" />
              인터뷰
            </>
          ) : (
            <>
              <ClipboardList className="w-4 h-4" />
              설문조사
            </>
          )}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {survey.title}
      </h3>

      {/* Description */}
      {survey.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {survey.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">참가자</span>
          <span className="font-medium">
            {survey.currentCount} / {survey.targetCount}명
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{survey.estimatedTime || '?'}분</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>~{formatDate(survey.endDate)}</span>
        </div>
        {survey.rewardAmount && (
          <div className="flex items-center gap-2 text-primary font-medium col-span-2">
            <Gift className="w-4 h-4" />
            <span>
              사례비 {survey.rewardAmount.toLocaleString()}원
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="flex items-center justify-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
          자세히 보기
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}
