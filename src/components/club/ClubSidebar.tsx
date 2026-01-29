'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { sidebarMenuItems } from '@/lib/club/navigation';
import { cn } from '@/lib/utils';

export default function ClubSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const menuItems = sidebarMenuItems.member;

  return (
    <aside className="hidden lg:block w-64 min-h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200">
      <nav className="sticky top-14 p-4 space-y-6">
        {menuItems.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
