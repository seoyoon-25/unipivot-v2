import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Gift, Calendar, ClipboardList, Mic, ExternalLink, CheckCircle } from 'lucide-react'
import { prisma } from '@/lib/db'
import SurveyApplyForm from './SurveyApplyForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getSurvey(id: string) {
  const survey = await prisma.labSurvey.findUnique({
    where: { id },
    include: {
      _count: {
        select: { participations: true },
      },
    },
  })

  if (!survey || !survey.isPublic) {
    return null
  }

  return survey
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const survey = await prisma.labSurvey.findUnique({
    where: { id },
    select: { title: true, description: true },
  })

  if (!survey) {
    return { title: '설문조사를 찾을 수 없습니다' }
  }

  return {
    title: survey.title,
    description: survey.description || `${survey.title} - 설문조사 참가`,
  }
}

export default async function SurveyDetailPage({ params }: PageProps) {
  const { id } = await params
  const survey = await getSurvey(id)

  if (!survey) {
    notFound()
  }

  const isOngoing = survey.status === 'RECRUITING'
  const isFull = survey.currentCount >= survey.targetCount
  const canApply = isOngoing && !isFull

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getOriginLabel = (origin: string | null) => {
    switch (origin) {
      case 'NORTH':
        return '북한이탈주민'
      case 'SOUTH':
        return '남한 출신'
      case 'ANY':
        return '제한 없음'
      default:
        return '제한 없음'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/lab/surveys"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            설문조사 목록으로
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Status & Type */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
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
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{survey.title}</h1>

              {/* Requester */}
              {survey.requesterOrg && (
                <p className="text-gray-500 mb-4">
                  요청기관: {survey.requesterOrg}
                </p>
              )}

              {/* Description */}
              {survey.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-600 whitespace-pre-wrap">{survey.description}</p>
                </div>
              )}
            </div>

            {/* Target Conditions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">참가 자격</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-600">
                    대상: <span className="font-medium">{getOriginLabel(survey.targetOrigin)}</span>
                  </span>
                </li>
                {(survey.targetAgeMin || survey.targetAgeMax) && (
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-600">
                      연령: {survey.targetAgeMin || '제한없음'}세 ~ {survey.targetAgeMax || '제한없음'}세
                    </span>
                  </li>
                )}
                {survey.targetGender && survey.targetGender !== 'ANY' && (
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-600">
                      성별: {survey.targetGender === 'MALE' ? '남성' : '여성'}
                    </span>
                  </li>
                )}
                {survey.targetConditions && (
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-600 whitespace-pre-wrap">{survey.targetConditions}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* External URL */}
            {survey.externalUrl && canApply && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">설문 참여</h2>
                <a
                  href={survey.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                >
                  외부 설문으로 이동
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="mt-3 text-sm text-gray-500">
                  외부 설문 서비스(구글폼 등)로 이동합니다.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">참가 현황</span>
                  <span className="font-bold text-primary">
                    {survey.currentCount} / {survey.targetCount}명
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min((survey.currentCount / survey.targetCount) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">모집 기간</p>
                    <p className="font-medium">
                      {formatDate(survey.startDate)} ~ {formatDate(survey.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">소요 시간</p>
                    <p className="font-medium">{survey.estimatedTime || '?'}분</p>
                  </div>
                </div>

                {survey.questionCount && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">문항 수</p>
                      <p className="font-medium">{survey.questionCount}문항</p>
                    </div>
                  </div>
                )}

                {survey.rewardAmount && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">사례비</p>
                      <p className="font-bold text-primary">
                        {survey.rewardAmount.toLocaleString()}원
                      </p>
                      {survey.rewardNote && (
                        <p className="text-xs text-gray-400">{survey.rewardNote}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Section */}
              {canApply && !survey.externalUrl && (
                <SurveyApplyForm surveyId={survey.id} />
              )}

              {!canApply && (
                <div className="text-center py-4">
                  <p className="text-gray-500">
                    이 설문조사는 진행완료되었습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
