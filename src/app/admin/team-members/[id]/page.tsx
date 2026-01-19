import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import TeamMemberForm from '../TeamMemberForm';

export const metadata: Metadata = {
  title: '팀 멤버 편집 | 어드민',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeamMemberPage({ params }: PageProps) {
  const { id } = await params;

  const member = await prisma.teamMember.findUnique({
    where: { id },
  });

  if (!member) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">팀 멤버 편집</h1>
        <p className="text-gray-600 mt-1">
          {member.name}님의 정보를 수정합니다.
        </p>
      </div>

      <TeamMemberForm member={member} />
    </div>
  );
}
