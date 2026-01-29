import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClubPrograms } from '@/lib/club/program-queries';
import ProgramCard from '@/components/club/programs/ProgramCard';
import EmptyState from '@/components/club/ui/EmptyState';
import { BookOpen } from 'lucide-react';

export const metadata = { title: '내 프로그램' };

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions);
  const programs = await getClubPrograms(session!.user.id);

  // JSON serialize dates for client components
  const serialized = programs.map((p) => ({
    ...p,
    sessions: p.sessions.map((s) => ({
      ...s,
      date: s.date.toISOString(),
    })),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 프로그램</h1>

      {serialized.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="참여 중인 프로그램이 없습니다"
          description="프로그램에 참여하면 여기에 표시됩니다"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serialized.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
