import { prisma } from '@/lib/db';

export async function getClubPrograms(userId: string) {
  const participations = await prisma.programParticipant.findMany({
    where: { userId },
    include: {
      program: {
        include: {
          sessions: {
            orderBy: { date: 'asc' },
            select: { id: true, sessionNo: true, date: true, title: true },
          },
          _count: { select: { participants: true } },
        },
      },
    },
    orderBy: { program: { startDate: 'desc' } },
  });

  return participations.map((p) => ({
    id: p.program.id,
    title: p.program.title,
    type: p.program.type,
    status: p.program.status,
    image: p.program.image,
    thumbnailSquare: p.program.thumbnailSquare,
    participantCount: p.program._count.participants,
    sessions: p.program.sessions,
    myRole: p.status,
  }));
}
