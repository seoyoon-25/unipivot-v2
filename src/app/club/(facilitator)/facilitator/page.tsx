import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Users, Timer, MessageSquare, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '운영진 도구',
};

export default async function FacilitatorPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">운영진 도구</h1>
      <p className="text-gray-500 mb-6">
        {session?.user?.name}님, 오늘 모임 진행 준비되셨나요?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/club/facilitator/participants"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">참가자 관리</h3>
              <p className="text-sm text-gray-500">출석 현황, 연락처</p>
            </div>
          </div>
        </Link>

        <Link
          href="/club/facilitator/timer"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Timer className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">발언 타이머</h3>
              <p className="text-sm text-gray-500">공평한 발언 시간</p>
            </div>
          </div>
        </Link>

        <Link
          href="/club/facilitator/questions"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI 토론 질문</h3>
              <p className="text-sm text-gray-500">독후감 기반 질문 추천</p>
            </div>
          </div>
        </Link>

        <Link
          href="/club/facilitator/resources"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <FolderOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">자료실</h3>
              <p className="text-sm text-gray-500">진행 스크립트, 가이드</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
