import { Trophy } from 'lucide-react';

interface Participant {
  id: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  attendanceRate: number;
  attendedCount: number;
}

interface Props {
  participants: Participant[];
}

export default function RecapParticipants({ participants }: Props) {
  // 출석왕 (가장 높은 출석률)
  const sortedByAttendance = [...participants].sort(
    (a, b) => b.attendanceRate - a.attendanceRate,
  );
  const attendanceChamp = sortedByAttendance[0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">참가자</h2>

      {/* 출석왕 */}
      {attendanceChamp && attendanceChamp.attendanceRate > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-700">출석왕</p>
              <p className="font-semibold text-gray-900">
                {attendanceChamp.user.name || '(이름 없음)'}
              </p>
            </div>
            <span className="text-2xl font-bold text-amber-600">
              {attendanceChamp.attendanceRate}%
            </span>
          </div>
        </div>
      )}

      {/* 참가자 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            {p.user.image ? (
              <img
                src={p.user.image}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                {p.user.name?.[0] || '?'}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {p.user.name || '(이름 없음)'}
              </p>
              <p className="text-xs text-gray-500">
                출석 {p.attendedCount}회 ({p.attendanceRate}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
