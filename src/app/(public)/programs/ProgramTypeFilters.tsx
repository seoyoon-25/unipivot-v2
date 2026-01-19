'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ProgramType } from '@/lib/actions/programs';

interface ProgramTypeFiltersProps {
  currentType: ProgramType;
}

const filters: { value: ProgramType; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'BOOKCLUB', label: '독서모임' },
  { value: 'SEMINAR', label: '강연' },
  { value: 'KMOVE', label: 'K-Move' },
  { value: 'DEBATE', label: '토론회' },
];

function ProgramTypeFiltersInner({ currentType }: ProgramTypeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (type: ProgramType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'ALL') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.push(`/programs?${params.toString()}`);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${currentType === filter.value
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProgramTypeFilters({ currentType }: ProgramTypeFiltersProps) {
  return (
    <Suspense fallback={<div className="h-12" />}>
      <ProgramTypeFiltersInner currentType={currentType} />
    </Suspense>
  );
}
