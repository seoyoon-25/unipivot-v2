import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ScanPageClient from './ScanPageClient'

export const metadata = {
  title: 'QR 출석 | 유니클럽',
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ScanPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login?callbackUrl=/club/attendance/scan')
  }

  const params = await searchParams

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">QR 출석 체크</h1>
      <p className="text-sm text-gray-500 mb-6">
        진행자가 보여주는 QR 코드를 스캔하세요
      </p>
      <ScanPageClient initialToken={params.token} />
    </div>
  )
}
