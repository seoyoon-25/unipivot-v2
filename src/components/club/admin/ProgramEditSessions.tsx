'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Trash2 } from 'lucide-react';
import { addSession, deleteSession } from '@/app/club/(admin)/admin/programs/actions';

interface Session {
  id: string;
  sessionNo: number;
  date: string | Date;
  title: string | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  location: string | null;
}

interface ProgramEditSessionsProps {
  sessions: Session[];
  programId: string;
}

function formatSessionDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return format(d, 'yyyy년 M월 d일 (EEEE)', { locale: ko });
}

export default function ProgramEditSessions({ sessions, programId }: ProgramEditSessionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add session form state
  const [newDate, setNewDate] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const resetForm = () => {
    setNewDate('');
    setNewTitle('');
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewLocation('');
    setShowAddForm(false);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newDate) {
      setError('날짜를 입력해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await addSession({
          programId,
          date: newDate,
          title: newTitle.trim() || undefined,
          bookTitle: newBookTitle.trim() || undefined,
          bookAuthor: newBookAuthor.trim() || undefined,
          location: newLocation.trim() || undefined,
        });
        if (result?.error) {
          setError(result.error);
        } else {
          resetForm();
          router.refresh();
        }
      } catch {
        setError('세션 추가 중 오류가 발생했습니다.');
      }
    });
  };

  const handleDeleteSession = (sessionId: string, sessionNo: number) => {
    if (!confirm(`${sessionNo}회차 세션을 삭제하시겠습니까?`)) return;

    setDeletingId(sessionId);
    setError(null);

    startTransition(async () => {
      try {
        const result = await deleteSession(sessionId, programId);
        if (result?.error) {
          setError(result.error);
        } else {
          router.refresh();
        }
      } catch {
        setError('세션 삭제 중 오류가 발생했습니다.');
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          세션 목록 ({sessions.length}개)
        </h3>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          세션 추가
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Add session form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSession}
          className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="session-date" className="block text-xs font-medium text-gray-600 mb-1">
                날짜 <span className="text-red-500">*</span>
              </label>
              <input
                id="session-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="session-title" className="block text-xs font-medium text-gray-600 mb-1">
                제목
              </label>
              <input
                id="session-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="세션 제목"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="session-book-title" className="block text-xs font-medium text-gray-600 mb-1">
                도서명
              </label>
              <input
                id="session-book-title"
                type="text"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="도서 제목"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="session-book-author" className="block text-xs font-medium text-gray-600 mb-1">
                저자
              </label>
              <input
                id="session-book-author"
                type="text"
                value={newBookAuthor}
                onChange={(e) => setNewBookAuthor(e.target.value)}
                placeholder="저자"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="session-location" className="block text-xs font-medium text-gray-600 mb-1">
                장소
              </label>
              <input
                id="session-location"
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="장소"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? '추가 중...' : '추가'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={isPending}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          등록된 세션이 없습니다.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-16">회차</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">날짜</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">도서</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">장소</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 w-16">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {session.sessionNo}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatSessionDate(session.date)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {session.title || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {session.bookTitle ? (
                      <span>
                        {session.bookTitle}
                        {session.bookAuthor && (
                          <span className="text-gray-400 ml-1">({session.bookAuthor})</span>
                        )}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {session.location || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteSession(session.id, session.sessionNo)}
                      disabled={isPending || deletingId === session.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
