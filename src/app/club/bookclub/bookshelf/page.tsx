import { Suspense } from 'react';
import { getAllBooks, getBookSeasons, getBookYears } from '@/lib/club/book-queries';
import BookshelfHeader from '@/components/club/bookclub/BookshelfHeader';
import BookshelfFilter from '@/components/club/bookclub/BookshelfFilter';
import BookGrid from '@/components/club/bookclub/BookGrid';

export const metadata = {
  title: '책장',
};

interface Props {
  searchParams: {
    season?: string;
    year?: string;
    search?: string;
  };
}

export default async function BookshelfPage({ searchParams }: Props) {
  const filter = {
    season: searchParams.season,
    year: searchParams.year ? parseInt(searchParams.year) : undefined,
    search: searchParams.search,
  };

  const [books, seasons, years] = await Promise.all([
    getAllBooks(filter),
    getBookSeasons(),
    getBookYears(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <BookshelfHeader
        totalCount={books.length}
        title="책장"
        description="함께 읽은 책들"
      />

      <Suspense fallback={<div className="text-sm text-gray-400">필터 로딩...</div>}>
        <BookshelfFilter seasons={seasons} years={years} />
      </Suspense>

      <BookGrid
        books={books}
        emptyMessage={
          searchParams.search
            ? `"${searchParams.search}" 검색 결과가 없습니다`
            : '아직 함께 읽은 책이 없어요'
        }
      />
    </div>
  );
}
