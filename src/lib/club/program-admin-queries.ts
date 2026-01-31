import prisma from '@/lib/db';

/**
 * 회원 검색 (참가자 추가용)
 * - 이미 참가 중인 회원은 제외
 */
export async function searchUsersForProgram(
  programId: string,
  query: string,
  limit = 10,
) {
  const existingParticipants = await prisma.programParticipant.findMany({
    where: { programId },
    select: { userId: true },
  });
  const excludeIds = existingParticipants.map((p) => p.userId);

  return prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, email: true, image: true },
    take: limit,
  });
}
