import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProgramForEdit } from '@/lib/club/admin-queries';
import ProgramForm from '@/components/club/admin/ProgramForm';
import ProgramEditSessions from '@/components/club/admin/ProgramEditSessions';
import ProgramEditParticipants from '@/components/club/admin/ProgramEditParticipants';
import ExportButton from '@/components/club/admin/ExportButton';

export const metadata = { title: '프로그램 수정' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProgramPage({ params }: Props) {
  const { id } = await params;
  const program = await getProgramForEdit(id);

  if (!program) {
    notFound();
  }

  const sessions = program.sessions.map((s) => ({
    id: s.id,
    sessionNo: s.sessionNo,
    date: s.date.toISOString(),
    title: s.title,
    bookTitle: s.bookTitle,
    bookAuthor: s.bookAuthor,
    location: s.location,
  }));

  const participants = program.participants.map((p) => ({
    id: p.id,
    user: {
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
      image: p.user.image,
    },
    status: p.status,
    joinedAt: p.joinedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/club/admin/programs"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="뒤로"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로그램 수정</h1>
          <p className="text-gray-500 mt-1">{program.title}</p>
        </div>
      </div>

      {/* Basic Info Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <ProgramForm
          mode="edit"
          programId={program.id}
          initialData={{
            title: program.title,
            type: program.type,
            description: program.description,
            status: program.status,
            startDate: program.startDate?.toISOString() ?? null,
            endDate: program.endDate?.toISOString() ?? null,
          }}
        />
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProgramEditSessions sessions={sessions} programId={program.id} />
      </div>

      {/* Participants */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProgramEditParticipants participants={participants} programId={program.id} />
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          <ExportButton type="participants" programId={program.id} label="참가자 CSV" />
          <ExportButton type="attendance" programId={program.id} label="출석 CSV" />
        </div>
      </div>
    </div>
  );
}
