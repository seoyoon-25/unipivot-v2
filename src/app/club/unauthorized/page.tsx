import Link from 'next/link';
import { ShieldX } from 'lucide-react';

interface Props {
  searchParams: { required?: string };
}

export const metadata = {
  title: '접근 권한 없음',
};

export default function UnauthorizedPage({ searchParams }: Props) {
  const required = searchParams.required;

  const roleNames: Record<string, string> = {
    facilitator: '운영진',
    admin: '관리자',
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          접근 권한이 없습니다
        </h1>

        <p className="text-gray-500 mb-6">
          {required && roleNames[required]
            ? `이 페이지는 ${roleNames[required]} 이상만 접근할 수 있습니다.`
            : '이 페이지에 접근할 권한이 없습니다.'}
        </p>

        <div className="space-y-3">
          <Link
            href="/club"
            className="block w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>

          <p className="text-sm text-gray-400">
            권한이 필요하신 경우 관리자에게 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
