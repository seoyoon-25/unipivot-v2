import Link from 'next/link'
import { SocialIcons } from './SocialIcons'
import { getFooterMenu } from '@/lib/navigation'

const LAB_DOMAIN = process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

type FooterSection = {
  title: string
  links: FooterLink[]
}

// 기본 푸터 링크 (DB 조회 실패 시 폴백)
const defaultFooterLinks: FooterSection[] = [
  {
    title: '소개',
    links: [
      { label: '유니피벗 소개', href: '/about' },
      { label: '연혁', href: '/history' },
    ],
  },
  {
    title: '프로그램',
    links: [
      { label: '전체 프로그램', href: '/programs' },
      { label: '독서모임', href: '/programs?type=BOOKCLUB' },
      { label: '강연 및 세미나', href: '/programs?type=SEMINAR' },
      { label: 'K-Move', href: '/programs?type=KMOVE' },
      { label: '토론회', href: '/programs?type=DEBATE' },
    ],
  },
  {
    title: '소통마당',
    links: [
      { label: '공지사항', href: '/notice' },
      { label: '활동 블로그', href: '/blog' },
      { label: '한반도이슈', href: '/korea-issue' },
    ],
  },
  {
    title: '함께하기',
    links: [
      { label: '후원하기', href: '/donate' },
      { label: '프로그램 제안', href: '/suggest' },
      { label: '협조 요청', href: '/cooperation' },
      { label: '재능나눔', href: '/talent' },
      { label: '리서치랩', href: `https://${LAB_DOMAIN}`, external: true },
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

// 네비게이션 메뉴를 푸터 형식으로 변환
function convertMenuToFooterLinks(menuItems: Awaited<ReturnType<typeof getFooterMenu>>): FooterSection[] {
  const footerSections: FooterSection[] = []

  for (const item of menuItems) {
    if ('children' in item && item.children) {
      footerSections.push({
        title: item.label,
        links: item.children.map((child: { label: string; href: string; description?: string; external?: boolean }) => ({
          label: child.label,
          href: child.href,
          external: child.external,
        })),
      })
    }
  }

  // 단체 섹션 추가
  footerSections.push({
    title: '단체',
    links: [
      { label: '소개', href: '/about' },
      { label: '개인정보처리방침', href: '/privacy' },
      { label: '이용약관', href: '/terms' },
    ],
  })

  return footerSections
}

export async function Footer() {
  let footerLinks: FooterSection[] = defaultFooterLinks

  try {
    const menuItems = await getFooterMenu()
    footerLinks = convertMenuToFooterLinks(menuItems)
  } catch (error) {
    console.error('Failed to fetch footer menu:', error)
  }
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Logo & Info */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
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
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {link.label}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-primary transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
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
