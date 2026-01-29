import { prisma } from '@/lib/db';

/**
 * 내가 읽은 책 목록 (출석한 모임의 책)
 * ProgramAttendance → ProgramParticipant(userId) → ProgramSession(bookTitle)
 */
export async function getMyReadBooks(userId: string) {
  const attendances = await prisma.programAttendance.findMany({
    where: {
      participant: { userId },
      status: { in: ['PRESENT', 'LATE'] },
      session: { bookTitle: { not: null } },
    },
    include: {
      session: {
        select: {
          id: true,
          bookTitle: true,
          bookAuthor: true,
          bookImage: true,
          date: true,
          program: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      session: { date: 'desc' },
    },
  });

  // 중복 제거 (같은 책을 여러 세션에서 읽었을 수 있음)
  const bookMap = new Map<string, {
    id: string;
    title: string;
    author: string;
    image: string | null;
    program: { id: string; title: string } | null;
    readDate: Date;
  }>();

  for (const att of attendances) {
    const session = att.session;
    if (!session.bookTitle) continue;

    const key = `${session.bookTitle}-${session.bookAuthor || ''}`;
    if (!bookMap.has(key)) {
      bookMap.set(key, {
        id: session.id,
        title: session.bookTitle,
        author: session.bookAuthor || '',
        image: session.bookImage || null,
        program: session.program,
        readDate: session.date,
      });
    }
  }

  return Array.from(bookMap.values());
}

/**
 * 읽고 싶은 책 목록
 */
export async function getMyWishBooks(userId: string) {
  const wishBooks = await prisma.wishBook.findMany({
    where: { userId },
    include: {
      readBook: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return wishBooks.map((wb) => ({
    id: wb.id,
    title: wb.readBook?.title || wb.customTitle || '',
    author: wb.readBook?.author || wb.customAuthor || '',
    image: wb.readBook?.image || null,
    memo: wb.memo,
    readBookId: wb.readBookId,
    createdAt: wb.createdAt,
  }));
}

/**
 * 인생 책 목록 (최대 3권)
 */
export async function getMyFavoriteBooks(userId: string) {
  const favorites = await prisma.favoriteBook.findMany({
    where: { userId },
    include: {
      readBook: true,
    },
    orderBy: { displayOrder: 'asc' },
    take: 3,
  });

  return favorites.map((fb) => ({
    id: fb.id,
    title: fb.readBook.title,
    author: fb.readBook.author || '',
    image: fb.readBook.image || null,
    comment: fb.comment,
    order: fb.displayOrder,
    readBookId: fb.readBookId,
  }));
}

/**
 * 인생 책 선정 가능한 책 목록 (ReadBook 중 아직 선정 안 된 것)
 */
export async function getAvailableFavoriteBooks(userId: string) {
  const existingFavorites = await prisma.favoriteBook.findMany({
    where: { userId },
    select: { readBookId: true },
  });
  const existingIds = existingFavorites.map((f) => f.readBookId);

  const readBooks = await prisma.readBook.findMany({
    where: {
      id: existingIds.length > 0 ? { notIn: existingIds } : undefined,
    },
    select: {
      id: true,
      title: true,
      author: true,
      image: true,
    },
    orderBy: { title: 'asc' },
  });

  return readBooks;
}

/**
 * 내 책장 통계
 */
export async function getMyBookshelfStats(userId: string) {
  // 읽은 책 수: 출석한 세션 중 bookTitle이 있는 것의 고유 값
  const attendances = await prisma.programAttendance.findMany({
    where: {
      participant: { userId },
      status: { in: ['PRESENT', 'LATE'] },
      session: { bookTitle: { not: null } },
    },
    select: {
      session: {
        select: { bookTitle: true, bookAuthor: true },
      },
    },
  });
  const uniqueBooks = new Set(
    attendances.map((a) => `${a.session.bookTitle}-${a.session.bookAuthor || ''}`)
  );

  const [wishCount, favoriteCount] = await Promise.all([
    prisma.wishBook.count({ where: { userId } }),
    prisma.favoriteBook.count({ where: { userId } }),
  ]);

  return {
    readCount: uniqueBooks.size,
    wishCount,
    favoriteCount,
  };
}
