import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import {
  getProgramRecap,
  getParticipantStats,
  getProgramHighlights,
} from '@/lib/club/recap-queries';
import RecapHeader from '@/components/club/recap/RecapHeader';
import RecapStats from '@/components/club/recap/RecapStats';
import RecapHighlights from '@/components/club/recap/RecapHighlights';
import RecapParticipants from '@/components/club/recap/RecapParticipants';
import type { AIHighlights } from '@/lib/club/recap-ai';

export const metadata = { title: '시즌 회고' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProgramRecapPage({ params }: Props) {
  const { id } = await params;

  const program = await prisma.program.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!program) notFound();

  // COMPLETED 프로그램만 회고 가능
  if (program.status !== 'COMPLETED') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          아직 회고를 볼 수 없습니다
        </h1>
        <p className="text-gray-500">
          프로그램이 완료된 후에 시즌 회고를 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  const [recap, participantStats, highlights] = await Promise.all([
    getProgramRecap(id),
    getParticipantStats(id),
    getProgramHighlights(id),
  ]);

  // AI highlights는 recap.highlights에 저장되어 있음 (Json?)
  const aiHighlights = recap.highlights as AIHighlights | null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <RecapHeader program={program} />

      <RecapStats recap={recap} />

      <RecapHighlights highlights={highlights} aiHighlights={aiHighlights} />

      <RecapParticipants participants={participantStats} />
    </div>
  );
}
