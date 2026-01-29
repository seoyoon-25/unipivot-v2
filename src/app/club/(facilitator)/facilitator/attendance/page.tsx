import { getFacilitatorSessions } from '@/lib/club/attendance-queries'
import FacilitatorAttendanceClient from './FacilitatorAttendanceClient'

export const metadata = {
  title: '출석 관리 | 운영진 도구 | 유니클럽',
}

export default async function FacilitatorAttendancePage() {
  const programs = await getFacilitatorSessions()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">출석 관리</h1>
      <p className="text-sm text-gray-500 mb-6">
        QR 코드 생성 및 출석 관리
      </p>

      <FacilitatorAttendanceClient programs={JSON.parse(JSON.stringify(programs))} />
    </div>
  )
}
