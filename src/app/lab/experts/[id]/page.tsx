import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, Mic, MessageSquare, MapPin, Mail, Phone, ArrowLeft, Calendar, Award, BookOpen } from 'lucide-react'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getExpert(id: string) {
  const expert = await prisma.expertProfile.findUnique({
    where: { id },
  })

  if (!expert || !expert.isPublic || !expert.isActive) {
    return null
  }

  // Increment view count
  await prisma.expertProfile.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })

  return expert
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const expert = await prisma.expertProfile.findUnique({
    where: { id },
    select: { name: true, title: true, specialties: true },
  })

  if (!expert) {
    return { title: '전문가를 찾을 수 없습니다' }
  }

  return {
    title: `${expert.name} - ${expert.title || '전문가'}`,
    description: expert.specialties || `${expert.name} 전문가 프로필`,
  }
}

export default async function ExpertDetailPage({ params }: PageProps) {
  const { id } = await params
  const expert = await getExpert(id)

  if (!expert) {
    notFound()
  }

  const parseJson = (str: string | null): any[] => {
    if (!str) return []
    try {
      return JSON.parse(str)
    } catch {
      return []
    }
  }

  const categories = parseJson(expert.categories)
  const education = parseJson(expert.education)
  const career = parseJson(expert.career)
  const certifications = parseJson(expert.certifications)
  const lectureAreas = parseJson(expert.lectureAreas)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/lab/experts"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            전문가 목록으로
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              {/* Photo */}
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-2xl overflow-hidden mb-4">
                {expert.photo ? (
                  <img
                    src={expert.photo}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                    {expert.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{expert.name}</h1>
                  {expert.isVerified && (
                    <BadgeCheck className="w-6 h-6 text-primary" />
                  )}
                </div>
                <p className="text-gray-500 mt-1">{expert.title || '-'}</p>
                <p className="text-gray-400 text-sm">{expert.organization || '-'}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Mic className="w-4 h-4" />
                    <span className="font-bold">{expert.lectureCount}</span>
                  </div>
                  <span className="text-xs text-gray-500">강연</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-bold">{expert.consultingCount}</span>
                  </div>
                  <span className="text-xs text-gray-500">자문</span>
                </div>
              </div>

              {/* Lecture Fee */}
              {expert.lectureFeeMin && (
                <div className="mb-6 p-4 bg-primary/5 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">강연료</p>
                  <p className="font-bold text-primary">
                    {expert.lectureFeeMin}만원
                    {expert.lectureFeeMax && expert.lectureFeeMax !== expert.lectureFeeMin && (
                      <> ~ {expert.lectureFeeMax}만원</>
                    )}
                  </p>
                </div>
              )}

              {/* Lecture Areas */}
              {lectureAreas.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    강연 가능 지역
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {lectureAreas.map((area: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <Link
                href={`/cooperation/lecturer/apply?expertId=${expert.id}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                <Mail className="w-5 h-5" />
                강연 요청하기
              </Link>
            </div>
          </div>

          {/* Right - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">전문 분야</h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {expert.bio && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">소개</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {expert.bio}
                </p>
              </div>
            )}

            {/* Lecture Topics */}
            {expert.lectureTopics && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  강연 가능 주제
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap">{expert.lectureTopics}</p>
              </div>
            )}

            {/* Specialties */}
            {expert.specialties && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">세부 전문 분야</h2>
                <p className="text-gray-600">{expert.specialties}</p>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  학력
                </h2>
                <ul className="space-y-3">
                  {education.map((edu: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{edu.school}</p>
                        <p className="text-sm text-gray-500">
                          {edu.degree} {edu.major && `- ${edu.major}`}
                          {edu.year && ` (${edu.year})`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Career */}
            {career.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  경력
                </h2>
                <ul className="space-y-3">
                  {career.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{item.company}</p>
                        <p className="text-sm text-gray-500">
                          {item.position}
                          {item.period && ` (${item.period})`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  자격/인증
                </h2>
                <ul className="space-y-2">
                  {certifications.map((cert: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">
                        {typeof cert === 'string' ? cert : cert.name}
                        {cert.year && ` (${cert.year})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Research Interests */}
            {expert.researchInterests && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">연구 관심 분야</h2>
                <p className="text-gray-600">{expert.researchInterests}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
