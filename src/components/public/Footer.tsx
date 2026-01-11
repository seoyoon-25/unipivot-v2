import Link from 'next/link'
import { SocialIcons } from './SocialIcons'

const footerLinks = [
  {
    title: '프로그램',
    links: [
      { label: '독서모임', href: '/bookclub' },
      { label: '세미나', href: '/seminar' },
      { label: 'K-Move', href: '/kmove' },
    ],
  },
  {
    title: '소통마당',
    links: [
      { label: '제안하기', href: '/suggest' },
      { label: '공지사항', href: '/notice' },
      { label: '한반도이슈', href: '/korea-issue' },
    ],
  },
  {
    title: '연대하기',
    links: [
      { label: '강연요청', href: '/request' },
      { label: '전문가 풀', href: '/experts' },
      { label: '재능나눔', href: '/talent' },
      { label: '후원하기', href: '/donate' },
    ],
  },
  {
    title: '단체',
    links: [
      { label: '소개', href: '/about' },
      { label: '개인정보처리방침', href: '/privacy' },
      { label: '이용약관', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Logo & Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="font-bold text-xl">유니피벗</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              남북청년이 함께<br />
              새로운 한반도를 만들어갑니다.
            </p>
            <SocialIcons />
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <p>사단법인 유니피벗 | 대표: 홍길동</p>
              <p>사업자등록번호: 000-00-00000</p>
              <p>서울특별시 마포구 양화로 00길 00, 0층</p>
            </div>
            <div className="md:text-right">
              <p>대표전화: 02-000-0000</p>
              <p>이메일: contact@unipivot.org</p>
              <p>업무시간: 평일 09:00 - 18:00</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} UniPivot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
