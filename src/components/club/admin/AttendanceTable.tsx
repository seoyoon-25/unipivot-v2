'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

interface AttendanceUser {
  id: string;
  name: string | null;
  email: string;
}

interface Participant {
  id: string;
  user: AttendanceUser;
}

interface Attendance {
  id: string;
  status: string;
  participant: Participant;
}

interface Session {
  id: string;
  sessionNo: number;
  title: string | null;
  date: string | Date;
  attendances: Attendance[];
}

interface AttendanceTableProps {
  sessions: Session[];
}

// -------------------------------------------------------------------------
// Status helpers
// -------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof CheckCircle }
> = {
  PRESENT: {
    label: '출석',
    color: 'text-green-700',
    bg: 'bg-green-50',
    icon: CheckCircle,
  },
  LATE: {
    label: '지각',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    icon: Clock,
  },
  ABSENT: {
    label: '결석',
    color: 'text-red-700',
    bg: 'bg-red-50',
    icon: XCircle,
  },
  EXCUSED: {
    label: '사유결석',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    icon: AlertCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.ABSENT;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.color}`}
      title={config.label}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// -------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------

export default function AttendanceTable({ sessions }: AttendanceTableProps) {
  // Build a map of all unique participants across every session
  const { participants, attendanceMap, summaries } = useMemo(() => {
    const participantMap = new Map<string, { id: string; name: string; email: string }>();
    // Key: `${participantId}::${sessionId}` -> status
    const attMap = new Map<string, string>();

    for (const session of sessions) {
      for (const att of session.attendances) {
        const p = att.participant;
        if (!participantMap.has(p.id)) {
          participantMap.set(p.id, {
            id: p.id,
            name: p.user.name || '(이름 없음)',
            email: p.user.email,
          });
        }
        attMap.set(`${p.id}::${session.id}`, att.status);
      }
    }

    const participantList = Array.from(participantMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'ko'),
    );

    // Calculate attendance rate per participant
    const summaryMap = new Map<string, { total: number; present: number; rate: number }>();
    for (const p of participantList) {
      let total = 0;
      let present = 0;
      for (const session of sessions) {
        const status = attMap.get(`${p.id}::${session.id}`);
        if (status) {
          total++;
          if (status === 'PRESENT' || status === 'LATE') {
            present++;
          }
        }
      }
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      summaryMap.set(p.id, { total, present, rate });
    }

    return {
      participants: participantList,
      attendanceMap: attMap,
      summaries: summaryMap,
    };
  }, [sessions]);

  if (participants.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">등록된 참가자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 sticky left-0 bg-gray-50 z-10 min-w-[160px]">
                참가자
              </th>
              {sessions.map((session) => (
                <th
                  key={session.id}
                  className="text-center px-3 py-3 font-medium text-gray-500 min-w-[90px]"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{session.sessionNo}회차</span>
                    <span className="text-[10px] font-normal text-gray-400">
                      {format(new Date(session.date), 'M/d', { locale: ko })}
                    </span>
                  </div>
                </th>
              ))}
              <th className="text-center px-4 py-3 font-medium text-gray-500 min-w-[80px]">
                출석률
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {participants.map((participant) => {
              const summary = summaries.get(participant.id);
              const rate = summary?.rate ?? 0;

              return (
                <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                  {/* Participant info */}
                  <td className="px-4 py-3 sticky left-0 bg-white z-10">
                    <div>
                      <p className="font-medium text-gray-900">{participant.name}</p>
                      <p className="text-xs text-gray-400">{participant.email}</p>
                    </div>
                  </td>

                  {/* Status per session */}
                  {sessions.map((session) => {
                    const status = attendanceMap.get(
                      `${participant.id}::${session.id}`,
                    );
                    return (
                      <td key={session.id} className="px-3 py-3 text-center">
                        {status ? (
                          <StatusBadge status={status} />
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Attendance rate */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center min-w-[48px] px-2 py-1 text-xs font-semibold rounded-full ${
                        rate >= 80
                          ? 'bg-green-50 text-green-700'
                          : rate >= 50
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-700">범례:</span>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <span key={key} className={`inline-flex items-center gap-1 ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
