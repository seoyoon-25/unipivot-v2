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
    <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-zinc-100">
      <nav className="sticky top-16 p-4 space-y-6" aria-label="클럽 메뉴">
        {menuItems.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors duration-200',
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-blue-600" />
                      )}
                      <Icon className={cn('w-5 h-5', isActive ? 'text-blue-600' : 'text-zinc-400')} />
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
