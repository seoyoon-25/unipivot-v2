'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, BookOpen, Users, CheckSquare, FolderOpen } from 'lucide-react';

interface Props {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
}

const mobileMenuItems = [
  { href: '/club/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/club/admin/programs', label: '프로그램 관리', icon: BookOpen },
  { href: '/club/admin/members', label: '회원 관리', icon: Users },
  { href: '/club/admin/attendance', label: '출석 관리', icon: CheckSquare },
  { href: '/club/admin/resources', label: '자료 관리', icon: FolderOpen },
];

const roleLabels: Record<string, string> = {
  ADMIN: '관리자',
  SUPER_ADMIN: '최고관리자',
  FACILITATOR: '운영진',
};

export default function AdminHeader({ user }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* 모바일 메뉴 버튼 */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex-1" />

        {/* 사용자 정보 */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
            <p className="text-xs text-gray-500">{roleLabels[user.role] || user.role}</p>
          </div>
          {user.image ? (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <nav className="lg:hidden mt-3 pt-3 border-t border-gray-200">
          <ul className="space-y-1">
            {mobileMenuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/club/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/club"
            className="block mt-3 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; 유니클럽으로 돌아가기
          </Link>
        </nav>
      )}
    </header>
  );
}
