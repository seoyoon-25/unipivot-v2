'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface ProgramParticipation {
  id: string;
  program: {
    id: string;
    title: string;
    type: string;
    status: string;
    startDate: string | Date | null;
  };
}

interface AttendanceRecord {
  id: string;
  status: string;
  session: {
    id: string;
    sessionNo: number;
    date: string | Date;
    program: { id: string; title: string };
  };
}

interface BookReportRecord {
  id: string;
  bookTitle: string;
  bookAuthor: string | null;
  createdAt: string | Date;
  isPublic: boolean;
  status: string;
}

interface QuoteRecord {
  id: string;
  bookTitle: string;
  content: string;
  createdAt: string | Date;
}

interface Props {
  programs: ProgramParticipation[];
  attendances: AttendanceRecord[];
  reports: BookReportRecord[];
  quotes: QuoteRecord[];
}

const tabs = [
  { id: 'programs', label: '참여 프로그램' },
  { id: 'attendances', label: '출석 기록' },
  { id: 'reports', label: '독후감' },
  { id: 'quotes', label: '명문장' },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  PRESENT: { icon: CheckCircle, color: 'text-green-600', label: '출석' },
  LATE: { icon: Clock, color: 'text-amber-600', label: '지각' },
  ABSENT: { icon: XCircle, color: 'text-red-600', label: '결석' },
  EXCUSED: { icon: AlertCircle, color: 'text-gray-500', label: '사유결석' },
};

const programStatusLabels: Record<string, { label: string; color: string }> = {
  ONGOING: { label: '진행중', color: 'bg-blue-100 text-blue-700' },
  RECRUITING: { label: '모집중', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-700' },
};

export default function MemberActivityTabs({
  programs,
  attendances,
  reports,
  quotes,
}: Props) {
  const [activeTab, setActiveTab] = useState('programs');

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div className="p-4">
        {/* 참여 프로그램 */}
        {activeTab === 'programs' && (
          <div className="space-y-3">
            {programs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                참여 프로그램이 없습니다.
              </p>
            ) : (
              programs.map((p) => {
                const pStatus =
                  programStatusLabels[p.program.status] ||
                  programStatusLabels.COMPLETED;
                return (
                  <Link
                    key={p.id}
                    href={`/club/admin/programs/${p.program.id}/edit`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {p.program.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${pStatus.color}`}
                      >
                        {pStatus.label}
                      </span>
                    </div>
                    {p.program.startDate && (
                      <p className="text-sm text-gray-500 mt-1">
                        시작:{' '}
                        {format(new Date(p.program.startDate), 'yyyy.M.d', {
                          locale: ko,
                        })}
                      </p>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* 출석 기록 */}
        {activeTab === 'attendances' && (
          <div className="space-y-2">
            {attendances.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                출석 기록이 없습니다.
              </p>
            ) : (
              attendances.map((a) => {
                const config = statusConfig[a.status] || statusConfig.ABSENT;
                const StatusIcon = config.icon;
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {a.session.program.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(a.session.date), 'yyyy.M.d', {
                          locale: ko,
                        })}{' '}
                        &middot; {a.session.sessionNo}회차
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon className={`w-4 h-4 ${config.color}`} />
                      <span className={`text-sm ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 독후감 */}
        {activeTab === 'reports' && (
          <div className="space-y-2">
            {reports.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                작성한 독후감이 없습니다.
              </p>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{r.bookTitle}</p>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${r.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {r.isPublic ? '공개' : '비공개'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {r.bookAuthor && `${r.bookAuthor} · `}
                    {format(new Date(r.createdAt), 'yyyy.M.d', { locale: ko })}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 명문장 */}
        {activeTab === 'quotes' && (
          <div className="space-y-2">
            {quotes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                등록한 명문장이 없습니다.
              </p>
            ) : (
              quotes.map((q) => (
                <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 line-clamp-2">
                    &ldquo;{q.content}&rdquo;
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {q.bookTitle} &middot;{' '}
                    {format(new Date(q.createdAt), 'yyyy.M.d', { locale: ko })}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
