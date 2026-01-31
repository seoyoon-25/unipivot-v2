'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { deleteProgram } from '@/app/club/(admin)/admin/programs/actions';

interface Program {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: string | Date | null;
  participantCount: number;
  sessionCount: number;
}

interface Filters {
  status: string;
  type: string;
  search: string;
}

interface ProgramTableProps {
  programs: Program[];
  currentPage: number;
  totalPages: number;
  filters: Filters;
}

const TYPE_LABELS: Record<string, string> = {
  BOOKCLUB: '독서모임',
  SEMINAR: '강연',
  DEBATE: '토론회',
};

const STATUS_LABELS: Record<string, string> = {
  RECRUITING: '모집중',
  ONGOING: '진행중',
  COMPLETED: '완료',
};

const STATUS_COLORS: Record<string, string> = {
  RECRUITING: 'bg-green-100 text-green-700',
  ONGOING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-500',
};

function formatDate(date: string | Date | null): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return format(d, 'yyyy.MM.dd', { locale: ko });
}

export default function ProgramTable({
  programs,
  currentPage,
  totalPages,
  filters,
}: ProgramTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(filters.search);
  const [deleting, setDeleting] = useState<string | null>(null);

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(overrides)) {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      // Reset to page 1 when filters change (unless overriding page directly)
      if (!('page' in overrides)) {
        params.delete('page');
      }

      const qs = params.toString();
      return qs ? `?${qs}` : '';
    },
    [searchParams],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      router.push(buildUrl({ [key]: value }));
    },
    [router, buildUrl],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      router.push(buildUrl({ search }));
    },
    [router, buildUrl, search],
  );

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`정말 "${title}" 프로그램을 삭제하시겠습니까?`)) return;

    setDeleting(id);
    try {
      await deleteProgram(id);
      router.refresh();
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const pageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="RECRUITING">모집중</option>
            <option value="ONGOING">진행중</option>
            <option value="COMPLETED">완료</option>
          </select>

          {/* Type filter */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">전체 타입</option>
            <option value="BOOKCLUB">독서모임</option>
            <option value="SEMINAR">강연</option>
            <option value="DEBATE">토론회</option>
          </select>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="프로그램 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">타입</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">시작일</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">참가자</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    프로그램이 없습니다.
                  </td>
                </tr>
              ) : (
                programs.map((program) => {
                  const statusLabel = STATUS_LABELS[program.status] ?? program.status;
                  const statusColor = STATUS_COLORS[program.status] ?? 'bg-gray-100 text-gray-500';
                  const typeLabel = TYPE_LABELS[program.type] ?? program.type;

                  return (
                    <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                      {/* 제목 */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/club/admin/programs/${program.id}/edit`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {program.title}
                        </Link>
                      </td>

                      {/* 타입 */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                          {typeLabel}
                        </span>
                      </td>

                      {/* 상태 */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* 시작일 */}
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(program.startDate)}
                      </td>

                      {/* 참가자 */}
                      <td className="px-4 py-3 text-center text-gray-500">
                        {program.participantCount}명
                      </td>

                      {/* 액션 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/club/admin/programs/${program.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(program.id, program.title)}
                            disabled={deleting === program.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={pageUrl(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              이전
            </span>
          )}

          <span className="px-3 py-2 text-sm text-gray-500">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={pageUrl(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              다음
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
