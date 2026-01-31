import Link from 'next/link';
import { ClipboardCheck, ChevronDown } from 'lucide-react';
import {
  getProgramsForAttendance,
  getAttendanceByProgram,
} from '@/lib/club/admin-queries';
import AttendanceTable from '@/components/club/admin/AttendanceTable';

export const metadata = { title: '출석 관리' };

interface Props {
  searchParams: Promise<{ programId?: string }>;
}

export default async function AdminAttendancePage({ searchParams }: Props) {
  const params = await searchParams;
  const programs = await getProgramsForAttendance();
  const selectedProgramId = params.programId || '';

  const sessions = selectedProgramId
    ? await getAttendanceByProgram(selectedProgramId)
    : [];

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">출석 관리</h1>
          <p className="text-gray-500 mt-1">프로그램별 출석 현황을 확인합니다.</p>
        </div>
      </div>

      {/* Program Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label
          htmlFor="program-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          프로그램 선택
        </label>
        <div className="relative inline-block w-full max-w-md">
          <select
            id="program-select"
            defaultValue={selectedProgramId}
            className="appearance-none w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            // Client-side navigation via a tiny inline script is not ideal;
            // instead we wrap the select in a form that navigates on change.
            // But since this is a server component we use a simple form approach.
          >
            <option value="">프로그램을 선택하세요</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title} ({program._count.participants}명 / {program._count.sessions}회차)
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Navigation links for each program (for server-side navigation) */}
        <div className="mt-3 flex flex-wrap gap-2">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/club/admin/attendance?programId=${program.id}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedProgramId === program.id
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              {program.title}
              <span className="text-xs opacity-70">
                ({program._count.sessions}회)
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Attendance Content */}
      {selectedProgramId && selectedProgram ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedProgram.title}
            </h2>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                selectedProgram.status === 'ONGOING'
                  ? 'bg-blue-100 text-blue-700'
                  : selectedProgram.status === 'RECRUITING'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {selectedProgram.status === 'ONGOING'
                ? '진행중'
                : selectedProgram.status === 'RECRUITING'
                  ? '모집중'
                  : selectedProgram.status}
            </span>
          </div>

          {sessions.length > 0 ? (
            <AttendanceTable sessions={sessions} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                아직 등록된 세션이 없습니다.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                프로그램에 세션을 추가하면 출석 현황을 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            출석 현황을 확인할 프로그램을 선택해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
