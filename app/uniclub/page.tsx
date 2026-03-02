import Link from 'next/link'
import Navbar from '../../components/Navbar'
import HeroSection from '../../components/HeroSection'
import BooksSection from '../../components/BooksSection'
import ScheduleSection from '../../components/ScheduleSection'
import EventsSection from '../../components/EventsSection'
import {
  getRecommendedBooks,
  getUpcomingSessions,
  getEventPrograms,
} from '../../src/lib/actions/uniclub'

const FOOTER_LINKS = [
  { label: '프로그램', href: '/programs' },
  { label: '책목록', href: '/books' },
  { label: '멤버', href: '/members' },
  { label: '에세이', href: '/essays' },
]

export default async function UniclubPage() {
  const [books, sessions, programs] = await Promise.all([
    getRecommendedBooks(),
    getUpcomingSessions(),
    getEventPrograms(),
  ])

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Books Section */}
        <BooksSection books={books} />

        {/* Schedule Section */}
        <ScheduleSection sessions={sessions} />

        {/* Events Section */}
        <EventsSection programs={programs} />
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
