import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookOpen } from 'lucide-react';

import {
  getMyReadBooks,
  getMyWishBooks,
  getMyFavoriteBooks,
  getAvailableFavoriteBooks,
  getMyBookshelfStats,
} from '@/lib/club/my-bookshelf-queries';
import { getAllBooks } from '@/lib/club/book-queries';

import MyBookshelfTabs from '@/components/club/bookclub/MyBookshelfTabs';
import ReadBooksTab from '@/components/club/bookclub/ReadBooksTab';
import WishBooksTab from '@/components/club/bookclub/WishBooksTab';
import FavoriteBooksTab from '@/components/club/bookclub/FavoriteBooksTab';

export const metadata = {
  title: '내 책장',
};

interface Props {
  searchParams: { tab?: string };
}

export default async function MyBookshelfPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/club/bookclub/my-bookshelf');
  }

  const userId = session.user.id;
  const currentTab = searchParams.tab || 'read';

  const [stats, readBooks, wishBooks, favoriteBooks, allBooks, availableFavorites] =
    await Promise.all([
      getMyBookshelfStats(userId),
      getMyReadBooks(userId),
      getMyWishBooks(userId),
      getMyFavoriteBooks(userId),
      getAllBooks(),
      getAvailableFavoriteBooks(userId),
    ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">내 책장</h1>
        </div>
        <p className="text-gray-500">
          {session.user.name}님의 독서 기록
        </p>
      </div>

      {/* 탭 */}
      <MyBookshelfTabs counts={stats} />

      {/* 탭 내용 */}
      {currentTab === 'read' && (
        <ReadBooksTab books={readBooks} />
      )}

      {currentTab === 'wish' && (
        <WishBooksTab
          wishBooks={wishBooks}
          availableBooks={allBooks}
        />
      )}

      {currentTab === 'favorite' && (
        <FavoriteBooksTab
          favoriteBooks={favoriteBooks}
          availableBooks={availableFavorites}
        />
      )}
    </div>
  );
}
