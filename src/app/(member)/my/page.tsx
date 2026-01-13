import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, FileText, Coins, Heart, ArrowRight } from 'lucide-react'
import { getUserProfile } from '@/lib/actions/public'
import { prisma } from '@/lib/db'

export default async function MyDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [user, likesCount] = await Promise.all([
    getUserProfile(session.user.id),
    prisma.programLike.count({ where: { userId: session.user.id } }),
  ])

  if (!user) {
    redirect('/login')
  }

  const programCount = user.registrations.filter(r => r.status === 'APPROVED').length
  const reportCount = user.bookReports.length

  const stats = [
    { label: '참여 프로그램', value: programCount.toString(), icon: BookOpen, href: '/my/programs' },
    { label: '독서 기록', value: reportCount.toString(), icon: FileText, href: '/my/reports' },
    { label: '보유 포인트', value: user.points.toLocaleString(), icon: Coins, href: '/my/points' },
    { label: '관심 프로그램', value: likesCount.toString(), icon: Heart, href: '/my/likes' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white mb-8">
        <h1 className="text-2xl font-bold mb-2">
          안녕하세요, {user.name || '회원'}님!
        </h1>
        <p className="text-white/80">유니피벗과 함께 새로운 한반도를 만들어가고 계시네요.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mb-3">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Programs */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">참여 프로그램</h2>
          <Link href="/my/programs" className="text-primary text-sm font-medium flex items-center gap-1">
            전체보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {user.registrations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">참여한 프로그램이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {user.registrations.slice(0, 5).map((reg) => (
              <div key={reg.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className={`w-2 h-2 rounded-full ${
                  reg.status === 'APPROVED' ? 'bg-green-500' :
                  reg.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-gray-900">{reg.program.title}</p>
                  <p className="text-gray-400 text-sm">
                    {reg.status === 'APPROVED' ? '승인됨' :
                     reg.status === 'PENDING' ? '대기중' :
                     reg.status === 'REJECTED' ? '거절됨' : '취소됨'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
