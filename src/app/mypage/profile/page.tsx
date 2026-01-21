'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserProfile, getUserBadges } from '@/lib/actions/badges'
import BadgeDisplay from '@/components/profile/BadgeDisplay'
import UserProfileCard from '@/components/profile/UserProfileCard'

interface UserProfile {
  id: string
  userId: string
  level: number
  xp: number
  totalPrograms: number
  totalBooks: number
  totalFacilitated: number
  attendanceRate: number
  reportRate: number
  averageSpeakingTime: number
  favoriteGenres: string | null
  topKeywords: string | null
  updatedAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
}

interface UserBadge {
  id: string
  userId: string
  badgeId: string
  earnedAt: Date
  programId: string | null
  badge: {
    id: string
    code: string
    name: string
    description: string
    icon: string
    category: string
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, badgesData] = await Promise.all([
          getUserProfile(),
          getUserBadges()
        ])
        setProfile(profileData)
        setBadges(badgesData)
      } catch (error) {
        console.error('프로필 조회 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchData()
    }
  }, [session?.user?.id])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  // XP 계산 - 다음 레벨까지 필요한 XP
  const currentLevelXP = profile.level * 100
  const progressToNextLevel = ((profile.xp % currentLevelXP) / currentLevelXP) * 100

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">내 독서 프로필</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="badges">배지</TabsTrigger>
          <TabsTrigger value="stats">상세 통계</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* 프로필 카드 */}
            <UserProfileCard />

            {/* 레벨/XP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">Lv.{profile.level}</span>
                  <span className="text-gray-500 font-normal text-base">
                    {profile.xp} XP
                  </span>
                </CardTitle>
                <CardDescription>
                  다음 레벨까지 {currentLevelXP - (profile.xp % currentLevelXP)} XP 남음
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progressToNextLevel} className="h-3" />
                <p className="text-sm text-gray-500 mt-2">
                  XP 획득 방법: 출석(10), 독후감 제출(20), 진행(50), 발언(분당 5)
                </p>
              </CardContent>
            </Card>

            {/* 요약 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">{profile.totalPrograms}</p>
                  <p className="text-sm text-gray-500">참여한 프로그램</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-600">{profile.totalBooks}</p>
                  <p className="text-sm text-gray-500">읽은 책</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">{profile.totalFacilitated}</p>
                  <p className="text-sm text-gray-500">진행한 모임</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">{badges.length}</p>
                  <p className="text-sm text-gray-500">획득한 배지</p>
                </CardContent>
              </Card>
            </div>

            {/* 최근 획득 배지 */}
            {badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>최근 획득한 배지</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 flex-wrap">
                    {badges.slice(0, 5).map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2"
                      >
                        <span className="text-xl">{badge.badge.icon}</span>
                        <span className="font-medium">{badge.badge.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <BadgeDisplay showAll />
        </TabsContent>

        <TabsContent value="stats">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>참여 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">출석률</span>
                    <span className="text-sm text-gray-500">{profile.attendanceRate}%</span>
                  </div>
                  <Progress value={profile.attendanceRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">독후감 제출률</span>
                    <span className="text-sm text-gray-500">{profile.reportRate}%</span>
                  </div>
                  <Progress value={profile.reportRate} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">평균 발언 시간</p>
                      <p className="text-xl font-bold">
                        {Math.floor(profile.averageSpeakingTime / 60)}분 {profile.averageSpeakingTime % 60}초
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">총 진행 횟수</p>
                      <p className="text-xl font-bold">{profile.totalFacilitated}회</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {profile.favoriteGenres && (
              <Card>
                <CardHeader>
                  <CardTitle>선호 장르 (AI 분석)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {JSON.parse(profile.favoriteGenres).map((genre: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.topKeywords && (
              <Card>
                <CardHeader>
                  <CardTitle>관심 키워드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {JSON.parse(profile.topKeywords).map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        #{keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
