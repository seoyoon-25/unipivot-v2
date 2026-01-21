'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { getProgram } from '@/lib/actions/programs'

interface ProgramDetails {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  capacity: number
  depositAmount: number | null
  startDate: Date | null
  endDate: Date | null
  sessions: Array<{
    id: string
    sessionNo: number
    title: string | null
    date: Date | null
    status: string | null
    bookTitle: string | null
    bookRange: string | null
  }>
  participants: Array<{
    id: string
    userId: string
    user: {
      id: string
      name: string | null
      image: string | null
    }
    attendances: Array<{
      id: string
      status: string
    }>
  }>
  _count: {
    sessions: number
    participants: number
  }
}

export default function ProgramDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const programId = params.programId as string

  const [program, setProgram] = useState<ProgramDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOrganizer, setIsOrganizer] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProgram(programId)
        setProgram(data as ProgramDetails | null)

        // 운영진 여부 확인 (관리자 권한 체크)
        const userRole = (session?.user as { role?: string })?.role || 'USER'
        setIsOrganizer(userRole === 'ADMIN' || userRole === 'SUPERADMIN')
      } catch (error) {
        console.error('프로그램 조회 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id && programId) {
      fetchData()
    }
  }, [session?.user?.id, programId])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session || !program) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <p className="text-center text-gray-500">프로그램을 찾을 수 없습니다.</p>
      </div>
    )
  }

  // 내 참가 정보
  const myParticipation = program.participants.find(
    p => p.userId === session.user.id
  )

  // 출석 현황 계산
  const totalSessions = program._count.sessions
  const attendedSessions = myParticipation?.attendances.filter(
    a => a.status === 'PRESENT'
  ).length || 0
  const attendanceRate = totalSessions > 0
    ? Math.round((attendedSessions / totalSessions) * 100)
    : 0

  const statusLabels: Record<string, string> = {
    DRAFT: '준비 중',
    RECRUITING: '모집 중',
    ACTIVE: '진행 중',
    COMPLETED: '완료',
    CANCELLED: '취소됨'
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    RECRUITING: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{program.title}</h1>
          <Badge className={statusColors[program.status] || statusColors.DRAFT}>
            {statusLabels[program.status] || program.status}
          </Badge>
        </div>
        {program.description && (
          <p className="text-gray-600">{program.description}</p>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="sessions">회차 관리</TabsTrigger>
          {isOrganizer && (
            <>
              <TabsTrigger value="participants">참가자 관리</TabsTrigger>
              <TabsTrigger value="surveys">만족도 조사</TabsTrigger>
              <TabsTrigger value="stats">통계</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 내 참여 현황 */}
            <Card>
              <CardHeader>
                <CardTitle>내 참여 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">출석률</span>
                    <span className="text-sm text-gray-500">
                      {attendedSessions}/{totalSessions} ({attendanceRate}%)
                    </span>
                  </div>
                  <Progress value={attendanceRate} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">역할</p>
                  <Badge variant={isOrganizer ? 'default' : 'secondary'}>
                      {isOrganizer ? '운영진' : '참가자'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 환급 자격 (보증금이 있는 경우) */}
            {program.depositAmount && program.depositAmount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>환급 자격</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">보증금</p>
                      <p className="text-xl font-bold">{program.depositAmount.toLocaleString()}원</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm">
                        출석률 50% 이상 또는 독후감 제출률 50% 이상 달성 시 환급됩니다.
                      </p>
                      <p className={`mt-2 font-medium ${attendanceRate >= 50 ? 'text-green-600' : 'text-gray-600'}`}>
                        현재 출석률: {attendanceRate}% {attendanceRate >= 50 ? '✓' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 프로그램 정보 */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>프로그램 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">참가자 수</p>
                    <p className="font-medium">
                      {program._count.participants}/{program.capacity}명
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">총 회차</p>
                    <p className="font-medium">{program._count.sessions}회</p>
                  </div>
                  {program.startDate && (
                    <div>
                      <p className="text-sm text-gray-500">시작일</p>
                      <p className="font-medium">
                        {new Date(program.startDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  )}
                  {program.endDate && (
                    <div>
                      <p className="text-sm text-gray-500">종료일</p>
                      <p className="font-medium">
                        {new Date(program.endDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 회차 관리 탭 */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>회차 목록</CardTitle>
              <CardDescription>
                클릭하여 회차 상세 페이지로 이동합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {program.sessions.map((sessionItem) => {
                  const sessionStatus = sessionItem.status || 'SCHEDULED'
                  const statusLabel =
                    sessionStatus === 'SCHEDULED' ? '예정' :
                    sessionStatus === 'IN_PROGRESS' ? '진행 중' :
                    sessionStatus === 'COMPLETED' ? '완료' : sessionStatus

                  return (
                    <Link
                      key={sessionItem.id}
                      href={`/mypage/programs/${programId}/sessions/${sessionItem.id}`}
                      className="block"
                    >
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {sessionItem.sessionNo}회차
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {statusLabel}
                              </Badge>
                            </div>
                            {sessionItem.title && (
                              <p className="text-sm text-gray-600 mt-1">
                                {sessionItem.title}
                              </p>
                            )}
                            {sessionItem.bookTitle && (
                              <p className="text-sm text-gray-500 mt-1">
                                책: {sessionItem.bookTitle}
                                {sessionItem.bookRange && ` (${sessionItem.bookRange})`}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {sessionItem.date && (
                              <p className="text-sm text-gray-500">
                                {new Date(sessionItem.date).toLocaleDateString('ko-KR', {
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}

                {program.sessions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    아직 등록된 회차가 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 참가자 관리 탭 (운영진 전용) */}
        {isOrganizer && (
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>참가자 목록</CardTitle>
                <CardDescription>
                  총 {program._count.participants}명
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {program.participants.map((participant) => (
                    <Link
                      key={participant.id}
                      href={`/mypage/programs/${programId}/participants/${participant.userId}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {participant.user.image ? (
                            <img
                              src={participant.user.image}
                              alt={participant.user.name || ''}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {participant.user.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{participant.user.name}</p>
                            <p className="text-sm text-gray-500">
                              출석: {participant.attendances.filter(a => a.status === 'PRESENT').length}/
                              {totalSessions}회
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          참가자
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* 만족도 조사 탭 (운영진 전용) */}
        {isOrganizer && (
          <TabsContent value="surveys">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>만족도 조사</CardTitle>
                  <Button asChild>
                    <Link href={`/admin/programs/${programId}/surveys/create`}>
                      + 새 조사 만들기
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  관리자 페이지에서 만족도 조사를 관리할 수 있습니다.
                </p>
                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href="/admin/surveys">조사 관리 페이지로 이동</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* 통계 탭 (운영진 전용) */}
        {isOrganizer && (
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>프로그램 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{program._count.participants}</p>
                    <p className="text-sm text-gray-600">참가자</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{program._count.sessions}</p>
                    <p className="text-sm text-gray-600">총 회차</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">
                      {program.sessions.filter(s => s.status === 'COMPLETED').length}
                    </p>
                    <p className="text-sm text-gray-600">완료된 회차</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">
                      {Math.round(
                        (program.sessions.filter(s => s.status === 'COMPLETED').length /
                         Math.max(program._count.sessions, 1)) * 100
                      )}%
                    </p>
                    <p className="text-sm text-gray-600">진행률</p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-500 mb-4">더 자세한 통계는 관리자 페이지에서 확인할 수 있습니다.</p>
                  <Button variant="outline" asChild>
                    <Link href={`/admin/programs/${programId}`}>관리자 페이지로 이동</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
