'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useTransition } from 'react';

interface BookshelfFilterProps {
  seasons: string[];
  years: number[];
}

export default function BookshelfFilter({ seasons, years }: BookshelfFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const currentSeason = searchParams.get('season') || '';
  const currentYear = searchParams.get('year') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/club/bookclub/bookshelf?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchValue);
  };

  const clearFilters = () => {
    setSearchValue('');
    startTransition(() => {
      router.push('/club/bookclub/bookshelf');
    });
  };

  const hasFilters = currentSeason || currentYear || searchParams.get('search');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="책 제목 또는 저자 검색"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* 시즌 필터 */}
        <select
          value={currentSeason}
          onChange={(e) => updateFilter('season', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 시즌</option>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>

        {/* 연도 필터 */}
        <select
          value={currentYear}
          onChange={(e) => updateFilter('year', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 연도</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            초기화
          </button>
        )}
      </div>

      {isPending && (
        <div className="mt-3 text-sm text-blue-600">검색 중...</div>
      )}
    </div>
  );
}
