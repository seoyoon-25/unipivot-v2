'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: '프로그램', href: '/programs' },
  { label: '책목록', href: '/books' },
  { label: '멤버', href: '/members' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-neutral-500/20">
      <div className="h-full max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          Uniclub
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-900 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="px-4 py-2 rounded-sm border border-primary text-primary hover:bg-primary-light transition-colors"
          >
            로그인
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          <span
            className={`block w-6 h-0.5 bg-neutral-900 transition-transform ${
              isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-neutral-900 transition-opacity ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-neutral-900 transition-transform ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white border-b border-neutral-500/20 px-4 py-4">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-neutral-900 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-sm border border-primary text-primary hover:bg-primary-light transition-colors text-center"
            >
              로그인
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
