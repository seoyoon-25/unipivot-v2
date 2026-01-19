import Link from 'next/link';
import { Construction } from 'lucide-react';

interface UnpublishedPageProps {
  title?: string;
  message?: string;
}

export default function UnpublishedPage({
  title = '페이지 준비 중',
  message = '페이지 준비 중입니다. 더 좋은 콘텐츠로 곧 찾아뵙겠습니다.',
}: UnpublishedPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-orange-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
