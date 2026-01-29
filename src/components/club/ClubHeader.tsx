'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, Bell } from 'lucide-react';
import { useState } from 'react';
import ClubUserMenu from './ClubUserMenu';
import ClubMobileMenu from './ClubMobileMenu';

export default function ClubHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/club" className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">유니클럽</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {session ? (
                <>
                  <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                    <Bell className="w-5 h-5" />
                  </button>
                  <ClubUserMenu user={session.user} />
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
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
