import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import { User, Mail } from 'lucide-react';

export const metadata = {
  title: 'MY',
};

export default async function MyPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">MY</h1>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || '프로필'}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.name || '이름 없음'}
            </h2>
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              역할: {user?.role || 'USER'}
            </p>
          </div>
        </div>
      </div>

      {/* 활동 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">0</p>
          <p className="text-sm text-gray-500">참여 프로그램</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-500">출석 횟수</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">0</p>
          <p className="text-sm text-gray-500">독후감</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">0</p>
          <p className="text-sm text-gray-500">스탬프</p>
        </div>
      </div>

      {/* 메뉴 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <a href="/club/my/bookshelf" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <span className="text-gray-700">내 책장</span>
          <span className="text-gray-400">&rarr;</span>
        </a>
        <a href="/club/my/reviews" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <span className="text-gray-700">내 독후감</span>
          <span className="text-gray-400">&rarr;</span>
        </a>
        <a href="/club/my/attendance" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <span className="text-gray-700">출석 현황</span>
          <span className="text-gray-400">&rarr;</span>
        </a>
        <a href="/club/my/settings" className="flex items-center justify-between p-4 hover:bg-gray-50">
          <span className="text-gray-700">설정</span>
          <span className="text-gray-400">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
