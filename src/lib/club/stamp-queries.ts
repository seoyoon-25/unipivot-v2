import prisma from '@/lib/db'

export async function getMyStamps(userId: string) {
  // Get attendances where user was PRESENT or LATE
  const attendances = await prisma.programAttendance.findMany({
    where: {
      participant: { userId },
      status: { in: ['PRESENT', 'LATE'] },
    },
    include: {
      session: {
        include: {
          program: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { session: { date: 'desc' } },
  });

  // Group by program
  const programMap = new Map<string, { title: string; stamps: { sessionNo: number; date: Date }[] }>();
  for (const att of attendances) {
    const programId = att.session.program.id;
    if (!programMap.has(programId)) {
      programMap.set(programId, { title: att.session.program.title, stamps: [] });
    }
    programMap.get(programId)!.stamps.push({
      sessionNo: att.session.sessionNo,
      date: att.session.date,
    });
  }

  return {
    total: attendances.length,
    programs: Array.from(programMap.entries()).map(([id, data]) => ({
      id,
      title: data.title,
      stamps: data.stamps,
    })),
    history: attendances.map((att) => ({
      id: att.id,
      date: att.session.date,
      programTitle: att.session.program.title,
      sessionNo: att.session.sessionNo,
    })),
  };
}
