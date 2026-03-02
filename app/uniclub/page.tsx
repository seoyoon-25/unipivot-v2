'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import HeroSection from '../../components/HeroSection'
import CategoryFilter from '../../components/CategoryFilter'
import BookCard from '../../components/BookCard'

// 더미 데이터
const BOOKS = [
  { title: '채식주의자', author: '한강', date: '2026.03.15', coverImage: '/placeholder.jpg', category: '소설' },
  { title: '사피엔스', author: '유발 하라리', date: '2026.04.05', coverImage: '/placeholder.jpg', category: '인문' },
  { title: '코스모스', author: '칼 세이건', date: '2026.04.20', coverImage: '/placeholder.jpg', category: '과학' },
]

const CATEGORIES = ['전체', '소설', '인문', '과학', '자기계발', '에세이']

const FOOTER_LINKS = [
  { label: '프로그램', href: '/programs' },
  { label: '책목록', href: '/books' },
  { label: '멤버', href: '/members' },
  { label: '에세이', href: '/essays' },
]

export default function UniclubPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체')

  const filteredBooks =
    selectedCategory === '전체'
      ? BOOKS
      : BOOKS.filter((book) => book.category === selectedCategory)

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* 이번 달 책 Section */}
        <section>
          <h2>이번 달 책</h2>

          {/* Category Filter */}
          <div className="mt-6">
            <CategoryFilter
              categories={CATEGORIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {/* Book Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.title}
                title={book.title}
                author={book.author}
                date={book.date}
                coverImage={book.coverImage}
                category={book.category}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-500 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Logo + Intro */}
            <div>
              <span className="text-xl font-bold text-white">Uniclub</span>
              <p className="mt-2 text-sm">
                함께 읽고, 함께 성장하는 독서모임입니다.
              </p>
            </div>

            {/* Column 2: Links */}
            <div>
              <span className="text-white font-semibold">바로가기</span>
              <ul className="mt-2 space-y-2">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <span className="text-white font-semibold">문의</span>
              <p className="mt-2 text-sm">contact@uniclub.kr</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-neutral-500/20 mt-8 pt-6 text-sm text-center">
            © 2026 Uniclub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
