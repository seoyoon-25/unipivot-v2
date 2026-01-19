import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { CheckCircle, Clock, Users, Home, FileText } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ status?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const program = await prisma.program.findUnique({
    where: { slug },
    select: { title: true },
  })

  return {
    title: `신청 완료 | ${program?.title || '프로그램'}`,
  }
}

export default async function ApplicationCompletePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { status } = await searchParams

  const program = await prisma.program.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      depositAmountSetting: true,
    },
  })

  if (!program) {
    notFound()
  }

  const isApproved = status === 'APPROVED'
  const isWaitlist = status === 'WAITLIST'
  const isPending = !isApproved && !isWaitlist

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          {/* Status Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isApproved ? 'bg-green-100' :
            isWaitlist ? 'bg-blue-100' : 'bg-yellow-100'
          }`}>
            {isApproved ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : isWaitlist ? (
              <Users className="w-10 h-10 text-blue-500" />
            ) : (
              <Clock className="w-10 h-10 text-yellow-500" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isApproved ? '신청이 승인되었습니다!' :
             isWaitlist ? '대기자로 등록되었습니다' :
             '신청이 접수되었습니다'}
          </h1>

          {/* Program Title */}
          <p className="text-lg text-gray-700 mb-6">{program.title}</p>

          {/* Status Message */}
          <div className={`p-4 rounded-xl mb-6 ${
            isApproved ? 'bg-green-50 text-green-700' :
            isWaitlist ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {isApproved && (
              <>
                <p className="font-medium mb-2">VIP/VVIP 회원으로 자동 승인되었습니다.</p>
                {program.depositAmountSetting && (
                  <p className="text-sm">
                    보증금 {program.depositAmountSetting.toLocaleString()}원을 입금해주세요.
                  </p>
                )}
              </>
            )}
            {isWaitlist && (
              <>
                <p className="font-medium mb-2">정원이 마감되어 대기자로 등록되었습니다.</p>
                <p className="text-sm">자리가 생기면 안내드리겠습니다.</p>
              </>
            )}
            {isPending && (
              <>
                <p className="font-medium mb-2">신청서를 검토 중입니다.</p>
                <p className="text-sm">결과는 이메일/카카오톡으로 안내드리겠습니다.</p>
              </>
            )}
          </div>

          {/* Next Steps */}
          <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">다음 단계</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {isApproved && program.depositAmountSetting ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex-shrink-0 flex items-center justify-center text-xs font-medium">1</span>
                    <span>안내된 계좌로 보증금을 입금해주세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex-shrink-0 flex items-center justify-center text-xs font-medium">2</span>
                    <span>입금 확인 후 참여 안내가 발송됩니다</span>
                  </li>
                </>
              ) : isApproved ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center text-xs font-medium">1</span>
                    <span>프로그램 시작 전 안내 메시지를 확인해주세요</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0 flex items-center justify-center text-xs font-medium">1</span>
                    <span>운영진이 신청서를 검토합니다 (1-3일 소요)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex-shrink-0 flex items-center justify-center text-xs font-medium">2</span>
                    <span>결과를 이메일/카카오톡으로 안내드립니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex-shrink-0 flex items-center justify-center text-xs font-medium">3</span>
                    <span>승인 시 보증금 입금 안내가 발송됩니다</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/my/applications"
              className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              <FileText className="w-5 h-5" />
              신청 내역 확인하기
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Home className="w-5 h-5" />
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
