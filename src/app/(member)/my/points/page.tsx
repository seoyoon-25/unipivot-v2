import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Coins, TrendingUp, TrendingDown, Gift, Calendar, BookOpen, Heart, Award } from 'lucide-react'
import { getUserPoints, getPointHistory } from '@/lib/actions/public'

function getCategoryIcon(category: string) {
  switch (category) {
    case 'ATTENDANCE': return Calendar
    case 'REPORT': return BookOpen
    case 'DONATION': return Heart
    case 'PROGRAM': return Award
    case 'EXCHANGE': return Gift
    default: return Coins
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case 'ATTENDANCE': return '출석'
    case 'REPORT': return '독서 기록'
    case 'DONATION': return '후원'
    case 'PROGRAM': return '프로그램'
    case 'EVENT': return '이벤트'
    case 'EXCHANGE': return '교환'
    default: return '기타'
  }
}

export default async function PointsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [pointsData, history] = await Promise.all([
    getUserPoints(),
    getPointHistory({ limit: 20 })
  ])

  const totalPoints = pointsData?.balance || 0
  const earnedThisMonth = pointsData?.earnedThisMonth || 0
  const spentThisMonth = pointsData?.spentThisMonth || 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">포인트</h1>

      {/* Balance */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white/80 text-sm">보유 포인트</p>
            <p className="text-3xl font-bold">{totalPoints.toLocaleString()}P</p>
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-white/60">이번 달 적립</p>
            <p className="text-white font-medium">+{earnedThisMonth.toLocaleString()}P</p>
          </div>
          <div>
            <p className="text-white/60">이번 달 사용</p>
            <p className="text-white font-medium">-{spentThisMonth.toLocaleString()}P</p>
          </div>
        </div>
      </div>

      {/* Point Earning Guide */}
      <div className="bg-white rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">포인트 적립 안내</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-bold text-gray-900">출석</p>
            <p className="text-primary text-sm">+100P</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-bold text-gray-900">독서 기록</p>
            <p className="text-primary text-sm">+200P</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <Award className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-bold text-gray-900">프로그램 완료</p>
            <p className="text-primary text-sm">+500P</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-bold text-gray-900">후원</p>
            <p className="text-primary text-sm">10%</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">포인트 내역</h2>
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Coins className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>포인트 내역이 없습니다.</p>
            <p className="text-sm mt-2">프로그램에 참여하고 포인트를 적립해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const Icon = getCategoryIcon(item.category)
              const isEarn = item.type === 'EARN'

              return (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isEarn ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isEarn ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{item.description}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(item.createdAt).toLocaleDateString('ko-KR')} · {getCategoryLabel(item.category)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                      {isEarn ? '+' : ''}{item.amount.toLocaleString()}P
                    </p>
                    <p className="text-gray-400 text-xs">잔액 {item.balance.toLocaleString()}P</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
