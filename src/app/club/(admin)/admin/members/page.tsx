import { getAdminMembersExtended } from '@/lib/club/member-queries';
import MemberTable from '@/components/club/admin/MemberTable';
import MemberSearchFilter from '@/components/club/admin/MemberSearchFilter';
import ExportButton from '@/components/club/admin/ExportButton';

export const metadata = { title: '회원 관리' };

interface Props {
  searchParams: Promise<{
    page?: string;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminMembersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const { members, total, totalPages } = await getAdminMembersExtended({
    page,
    role: params.role,
    search: params.search,
    sortBy: (params.sortBy as 'createdAt' | 'name') || undefined,
    sortOrder: (params.sortOrder as 'asc' | 'desc') || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
          <p className="text-gray-500 mt-1">총 {total}명</p>
        </div>
        <ExportButton type="members" label="CSV 내보내기" />
      </div>

      <MemberSearchFilter filters={params} />

      <MemberTable
        members={members}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
