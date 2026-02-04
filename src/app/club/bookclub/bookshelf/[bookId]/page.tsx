import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft, BookOpen, MessageSquare, Calendar } from 'lucide-react';
import { getBookDetail } from '@/lib/club/book-queries';

interface Props {
  params: { bookId: string };
}

export async function generateMetadata({ params }: Props) {
  const book = await getBookDetail(params.bookId);
  if (!book) return { title: '책을 찾을 수 없습니다' };

  return {
    title: book.title,
    description: `${book.author || '저자 미상'} | ${book._count.bookReports}개의 독후감`,
  };
}

export default async function BookDetailPage({ params }: Props) {
  const book = await getBookDetail(params.bookId);

  if (!book) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 뒤로가기 */}
      <Link
        href="/club/bookclub/bookshelf"
        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        책장으로
      </Link>

      {/* 책 정보 */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 표지 */}
          <div className="w-full md:w-48 flex-shrink-0">
            {book.image ? (
              <Image
                src={book.image}
                alt={book.title}
                width={192}
                height={256}
                className="w-full aspect-[3/4] object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-zinc-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-zinc-300" />
              </div>
            )}
          </div>

          {/* 상세 정보 */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              {book.title}
            </h1>
            {book.author && (
              <p className="text-lg text-zinc-600 mb-4">{book.author}</p>
            )}

            <div className="space-y-2 text-sm text-zinc-500 mb-6">
              {book.publisher && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">출판사</span>
                  {book.publisher}
                </div>
              )}
              {book.pubYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {book.pubYear}년 출간
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full font-medium">
                  {book.season}
                </span>
                {book.category && (
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded-full">
                    {book.category}
                  </span>
                )}
              </div>
            </div>

            {/* 통계 */}
            <div className="flex gap-6 pt-6 border-t border-zinc-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{book._count.bookReports}</p>
                <p className="text-xs text-zinc-500">독후감</p>
              </div>
              {book.sessionCount && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{book.sessionCount}</p>
                  <p className="text-xs text-zinc-500">모임 회차</p>
                </div>
              )}
              {book.participants && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{book.participants}</p>
                  <p className="text-xs text-zinc-500">참가자</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 독후감 */}
      {book.bookReports.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">최근 독후감</h2>
            <Link
              href={`/club/bookclub/reviews?book=${book.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              전체보기 &rarr;
            </Link>
          </div>
          <div className="space-y-4">
            {book.bookReports.map((report) => (
              <div key={report.id} className="p-4 bg-zinc-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200" />
                  <span className="text-sm font-medium text-zinc-700">
                    {report.author.name}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {format(new Date(report.createdAt), 'M.d', { locale: ko })}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-zinc-800 mb-1">{report.title}</h3>
                <p className="text-sm text-zinc-600 line-clamp-3">
                  {report.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 독후감 쓰기 버튼 */}
      <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 px-4 lg:relative lg:mt-6 lg:px-0">
        <Link
          href={`/club/bookclub/reviews/write?book=${book.id}`}
          className="block w-full max-w-md mx-auto py-3 bg-blue-600 text-white text-center rounded-xl hover:bg-blue-700 transition-colors shadow-lg lg:shadow-none"
        >
          <MessageSquare className="w-5 h-5 inline-block mr-2" />
          이 책 독후감 쓰기
        </Link>
      </div>
    </div>
  );
}
