'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, UserPlus } from 'lucide-react';
import { addParticipant } from '@/app/club/(admin)/admin/programs/actions';

interface Props {
  programId: string;
  onClose: () => void;
}

interface UserResult {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function AddParticipantModal({ programId, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 디바운스 검색
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/admin/users/search?q=${encodeURIComponent(query)}&programId=${programId}`,
        );
        const data = await res.json();
        setResults(data.users || []);
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, programId]);

  const handleAdd = (userId: string) => {
    setAddingId(userId);
    startTransition(async () => {
      const result = await addParticipant(programId, userId);
      if (!result?.error) {
        setResults((prev) => prev.filter((u) => u.id !== userId));
        router.refresh();
      }
      setAddingId(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="presentation">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl" role="dialog" aria-modal="true" aria-labelledby="add-participant-title">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="add-participant-title" className="text-lg font-semibold">참가자 추가</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 검색 */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름 또는 이메일로 검색..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center text-gray-500 text-sm">검색 중...</div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              {query.length < 2 ? '2자 이상 입력하세요' : '검색 결과가 없습니다'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      {user.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {user.name || '(이름 없음)'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleAdd(user.id)}
                    disabled={isPending || addingId === user.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors"
                    aria-label={`${user.name || user.email} 추가`}
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
