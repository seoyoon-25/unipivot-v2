import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAdminPrograms } from '@/lib/club/admin-queries';
import ProgramTable from '@/components/club/admin/ProgramTable';

export const metadata = { title: '프로그램 관리' };

interface Props {
  searchParams: Promise<{ page?: string; status?: string; type?: string; search?: string }>;
}

export default async function AdminProgramsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const { programs, total, totalPages } = await getAdminPrograms({
    page,
    status: params.status,
    type: params.type,
    search: params.search,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로그램 관리</h1>
          <p className="text-gray-500 mt-1">총 {total}개 프로그램</p>
        </div>
        <Link
          href="/club/admin/programs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          프로그램 추가
        </Link>
      </div>

      <ProgramTable
        programs={programs}
        currentPage={page}
        totalPages={totalPages}
        filters={{
          status: params.status || '',
          type: params.type || '',
          search: params.search || '',
        }}
      />
    </div>
  );
}
