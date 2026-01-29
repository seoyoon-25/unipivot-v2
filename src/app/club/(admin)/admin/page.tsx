import { LayoutDashboard, Users, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '관리자',
};

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">유니클럽 관리</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/club/admin/dashboard"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
        >
          <LayoutDashboard className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900">대시보드</h3>
          <p className="text-sm text-gray-500">전체 현황</p>
        </Link>

        <Link
          href="/club/admin/members"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
        >
          <Users className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900">회원 관리</h3>
          <p className="text-sm text-gray-500">회원 목록, 권한</p>
        </Link>

        <Link
          href="/club/admin/programs"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
        >
          <BookOpen className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900">프로그램</h3>
          <p className="text-sm text-gray-500">프로그램 관리</p>
        </Link>

        <Link
          href="/club/admin/settings"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
        >
          <Settings className="w-8 h-8 text-gray-600 mb-3" />
          <h3 className="font-semibold text-gray-900">설정</h3>
          <p className="text-sm text-gray-500">시스템 설정</p>
        </Link>
      </div>
    </div>
  );
}
