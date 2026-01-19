import { Metadata } from 'next';
import { checkPageAccess } from '@/lib/page-utils';
import UnpublishedPage from '@/components/public/UnpublishedPage';

export const metadata: Metadata = {
  title: '읽고 싶은 책 | 유니피벗',
  description: '함께 읽고 싶은 책을 공유하고 투표해보세요.',
};

interface PageProps {
  searchParams: Promise<{ preview?: string }>;
}

export default async function BooksPage({ searchParams }: PageProps) {
  const params = await searchParams;

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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 미리보기 배너 */}
      {isPreview && (
        <div className="bg-yellow-500 text-yellow-900 text-center py-2 text-sm font-medium">
          미리보기 모드 - 이 페이지는 아직 공개되지 않았습니다.
        </div>
      )}

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              읽고 싶은 책
            </h1>
            <p className="text-xl text-gray-600">
              함께 읽고 싶은 책을 공유하고 투표해보세요!
              <br />
              투표가 많은 책은 다음 독서모임 책 후보가 됩니다.
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-12 text-center">
            <p className="text-orange-600 font-medium text-lg">
              기능 준비 중입니다.
            </p>
            <p className="text-gray-500 mt-4">
              곧 책을 검색하고, 등록하고, 투표할 수 있어요!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
