'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';
import { sidebarMenuItems } from '@/lib/club/navigation';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ClubMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClubMobileMenu({ isOpen, onClose }: ClubMobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = sidebarMenuItems.member;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={menuRef}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="네비게이션 메뉴"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-100">
          <span className="text-lg font-bold text-zinc-900">메뉴</span>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors duration-200"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-4rem)] pb-20">
          {menuItems.map((section) => (
            <div key={section.title} className="py-4">
              <h3 className="px-4 mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'relative flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200',
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-blue-600" />
                        )}
                        <Icon className="w-5 h-5" />
                        <span className="flex-1">{item.name}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
