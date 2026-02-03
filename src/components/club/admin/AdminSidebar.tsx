'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CheckSquare,
  FolderOpen,
  BarChart3,
} from 'lucide-react';

const menuItems = [
  { href: '/club/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/club/admin/programs', label: '프로그램 관리', icon: BookOpen },
  { href: '/club/admin/members', label: '회원 관리', icon: Users },
  { href: '/club/admin/attendance', label: '출석 관리', icon: CheckSquare },
  { href: '/club/admin/resources', label: '자료 관리', icon: FolderOpen },
  { href: '/club/admin/analytics', label: '분석', icon: BarChart3 },
];

interface Props {
  userRole: string;
}

export default function AdminSidebar({ userRole }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
      {/* 로고 */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/club/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">유니클럽</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
            Admin
          </span>
        </Link>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/club/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
      </nav>

      {/* 하단 */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/club"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; 유니클럽으로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
