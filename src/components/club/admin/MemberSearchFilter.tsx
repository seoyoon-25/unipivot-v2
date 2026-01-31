'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface Props {
  filters: {
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default function MemberSearchFilter({ filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search || '');

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete('page');
      const qs = params.toString();
      return `/club/admin/members${qs ? `?${qs}` : ''}`;
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ search }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-[200px]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일 검색..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          검색
        </button>
      </form>

      {/* 역할 필터 */}
      <select
        value={filters.role || ''}
        onChange={(e) => router.push(buildUrl({ role: e.target.value }))}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
        <option value="">모든 역할</option>
        <option value="USER">회원</option>
        <option value="FACILITATOR">운영진</option>
        <option value="ADMIN">관리자</option>
      </select>

      {/* 정렬 */}
      <select
        value={filters.sortBy || 'createdAt'}
        onChange={(e) => router.push(buildUrl({ sortBy: e.target.value }))}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
        <option value="createdAt">최근 가입순</option>
        <option value="name">이름순</option>
      </select>
    </div>
  );
}
