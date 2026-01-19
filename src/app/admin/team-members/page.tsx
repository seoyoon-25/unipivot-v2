import { Metadata } from 'next';
import Link from 'next/link';
import { getAllTeamMembers } from '@/lib/actions/team-members';
import TeamMemberList from './TeamMemberList';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: '함께하는 사람들 관리 | 어드민',
};

export default async function AdminTeamMembersPage() {
  const members = await getAllTeamMembers();

  const staff = members.filter(m => m.role === 'STAFF');
  const advisors = members.filter(m => m.role === 'ADVISOR');
  const alumni = members.filter(m => m.role === 'ALUMNI');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">함께하는 사람들</h1>
          <p className="text-gray-600 mt-1">
            운영진, 자문위원, 역대 운영진을 관리합니다.
          </p>
        </div>
        <Link
          href="/admin/team-members/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          추가
        </Link>
      </div>

      <TeamMemberList
        staff={staff}
        advisors={advisors}
        alumni={alumni}
      />
    </div>
  );
}
