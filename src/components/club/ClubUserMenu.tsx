'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface ClubUserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ClubUserMenu({ user }: ClubUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || '사용자'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || '사용자'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/club/my"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              내 프로필
            </Link>
            <Link
              href="/club/my/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              설정
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
