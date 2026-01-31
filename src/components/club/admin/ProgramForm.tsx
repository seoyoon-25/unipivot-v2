'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProgram, updateProgram } from '@/app/club/(admin)/admin/programs/actions';

const TYPE_OPTIONS = [
  { value: 'BOOKCLUB', label: '독서모임' },
  { value: 'SEMINAR', label: '강연' },
  { value: 'DEBATE', label: '토론회' },
] as const;

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: '초안' },
  { value: 'RECRUITING', label: '모집중' },
  { value: 'ONGOING', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
] as const;

function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

interface ProgramData {
  title: string;
  type: string;
  description: string | null;
  status: string;
  startDate: string | Date | null;
  endDate: string | Date | null;
}

interface ProgramFormProps {
  mode: 'create' | 'edit';
  initialData?: ProgramData;
  programId?: string;
}

export default function ProgramForm({ mode, initialData, programId }: ProgramFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [type, setType] = useState(initialData?.type ?? 'BOOKCLUB');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [status, setStatus] = useState(initialData?.status ?? 'DRAFT');
  const [startDate, setStartDate] = useState(formatDateForInput(initialData?.startDate));
  const [endDate, setEndDate] = useState(formatDateForInput(initialData?.endDate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!type) {
      setError('타입을 선택해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const result = await createProgram({
            title: title.trim(),
            type,
            description: description.trim() || undefined,
            status,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          });
          if (result?.error) {
            setError(result.error);
          }
          // createProgram redirects on success, so no need to handle it here
        } else if (mode === 'edit' && programId) {
          const result = await updateProgram(programId, {
            title: title.trim(),
            type,
            description: description.trim() || undefined,
            status,
            startDate: startDate || null,
            endDate: endDate || null,
          });
          if (result?.error) {
            setError(result.error);
          } else {
            router.refresh();
          }
        }
      } catch {
        setError('저장 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          placeholder="프로그램 제목"
        />
      </div>

      {/* 타입 */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          타입 <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 설명 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-vertical"
          placeholder="프로그램 설명"
        />
      </div>

      {/* 상태 */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          상태
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            시작일
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            종료일
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '저장 중...' : mode === 'create' ? '생성' : '저장'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/club/admin/programs')}
          disabled={isPending}
          className="px-6 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
