import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkPageAccess } from '@/lib/page-utils';
import UnpublishedPage from '@/components/public/UnpublishedPage';
import { getBookSuggestions, getMyVotes } from '@/lib/actions/books';
import BookCard from './BookCard';
import BookSuggestionForm from './BookSuggestionForm';
import { BookOpen, TrendingUp, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: '읽고 싶은 책 | 유니피벗',
  description: '함께 읽고 싶은 책을 공유하고 투표해보세요.',
};

interface PageProps {
  searchParams: Promise<{ preview?: string; sort?: string }>;
}

export default async function BooksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);

  // 페이지 접근 권한 확인
  const { canAccess, isPreview, page } = await checkPageAccess('books', params);

  // 비공개 페이지 처리
  if (!canAccess) {
    return (
      <UnpublishedPage
        title={page?.title || '읽고 싶은 책'}
        message={page?.unpublishedMessage || '페이지 준비 중입니다.'}
      />
    );
  }

  const sortBy = (params.sort as 'votes' | 'recent') || 'votes';
  const [suggestions, myVotes] = await Promise.all([
    getBookSuggestions({ sortBy }),
    session ? getMyVotes() : [],
  ]);

  const myVotesSet = new Set(myVotes);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 미리보기 배너 */}
      {isPreview && (
        <div className="bg-yellow-500 text-yellow-900 text-center py-2 text-sm font-medium">
          미리보기 모드 - 이 페이지는 아직 공개되지 않았습니다.
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Book Suggestion</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            읽고 싶은 책
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            함께 읽고 싶은 책을 등록하고 투표해보세요!
            <br />
            <span className="text-primary">투표가 많은 책</span>이 다음 독서모임 책 후보가 됩니다.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* 책 등록 폼 */}
          <div className="mb-12">
            <BookSuggestionForm isLoggedIn={!!session} />
          </div>

          {/* 정렬 옵션 */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              📚 추천 도서 목록
              <span className="text-gray-500 text-lg font-normal ml-2">
                ({suggestions.length}권)
              </span>
            </h2>
            <div className="flex gap-2">
              <SortButton
                href="/books?sort=votes"
                active={sortBy === 'votes'}
                icon={<TrendingUp className="w-4 h-4" />}
                label="인기순"
              />
              <SortButton
                href="/books?sort=recent"
                active={sortBy === 'recent'}
                icon={<Clock className="w-4 h-4" />}
                label="최신순"
              />
            </div>
          </div>

          {/* 책 목록 */}
          {suggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion, index) => (
                <BookCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  rank={sortBy === 'votes' ? index + 1 : undefined}
                  isVoted={myVotesSet.has(suggestion.id)}
                  isLoggedIn={!!session}
                  isOwner={suggestion.userId === session?.user?.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                아직 등록된 책이 없습니다
              </h3>
              <p className="text-gray-500">
                첫 번째로 읽고 싶은 책을 등록해보세요!
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SortButton({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
        ${active
          ? 'bg-primary text-white'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }
      `}
    >
      {icon}
      {label}
    </a>
  );
}
