'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, BookOpen } from 'lucide-react';
import { useState, useMemo } from 'react';
import ClubUserMenu from './ClubUserMenu';
import ClubMobileMenu from './ClubMobileMenu';
import NotificationBell from './notifications/NotificationBell';
import SearchBar from './search/SearchBar';
import LanguageSwitch from '@/components/LanguageSwitch';
import { defaultLocale, isValidLocale, type Locale } from '@/i18n/config';

export default function ClubHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locale = useMemo<Locale>(() => {
    if (typeof document === 'undefined') return defaultLocale;
    const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/);
    const val = match?.[1];
    return val && isValidLocale(val) ? val : defaultLocale;
  }, []);

  return (
    <>
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500" />

      <header className="sticky top-0 z-40 h-16 bg-white/70 backdrop-blur-xl border-b border-stone-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-all duration-200"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="메뉴 열기"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/club" className="flex items-center gap-2.5 group">
                {/* Logo icon with gradient background */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-200">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  유니클럽
                </span>
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <SearchBar />
              </div>
              <LanguageSwitch currentLocale={locale} />
              {session ? (
                <>
                  <NotificationBell />
                  <ClubUserMenu user={session.user} />
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <ClubMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
