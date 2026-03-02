'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronRight } from 'lucide-react';
import { sidebarMenuItems } from '@/lib/club/navigation';
import { cn } from '@/lib/utils';

export default function ClubSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const menuItems = sidebarMenuItems.member;

  return (
    <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-white/50 backdrop-blur-sm border-r border-stone-100">
      <nav className="sticky top-16 p-4 space-y-6" aria-label="클럽 메뉴">
        {menuItems.map((section, sectionIdx) => (
          <div key={section.title}>
            {/* Section header with gradient underline */}
            <div className="px-3 mb-3">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="mt-2 h-px bg-gradient-to-r from-indigo-200 via-stone-200 to-transparent" />
            </div>

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
                        'group relative flex items-center gap-3 px-3 h-11 rounded-xl text-sm transition-all duration-200',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      )}
                    >
                      {/* Active indicator with gradient */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600" />
                      )}

                      {/* Icon with background box */}
                      <span
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200 group-hover:text-stone-700'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </span>

                      <span className="flex-1">{item.name}</span>

                      {/* Hover arrow animation */}
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200',
                          'group-hover:opacity-100 group-hover:translate-x-0',
                          isActive ? 'text-indigo-400' : 'text-stone-400'
                        )}
                      />
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
