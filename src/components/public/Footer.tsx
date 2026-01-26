import Link from 'next/link'
import { SocialIcons } from './SocialIcons'
import { getFooterMenu } from '@/lib/navigation'
import { ArrowUpRight } from 'lucide-react'

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
    ],
  },
  {
    title: '소통',
    links: [
      { label: '공지사항', href: '/notice' },
      { label: '활동 블로그', href: '/blog' },
      { label: '한반도이슈', href: '/korea-issue' },
    ],
  },
  {
    title: '참여',
    links: [
      { label: '후원하기', href: '/donate' },
      { label: '재능나눔', href: '/talent' },
      { label: '리서치랩', href: `https://${LAB_DOMAIN}`, external: true },
    ],
  },
]

function convertMenuToFooterLinks(menuItems: Awaited<ReturnType<typeof getFooterMenu>>): FooterSection[] {
  const footerSections: FooterSection[] = []

  for (const item of menuItems) {
    if ('children' in item && item.children) {
      footerSections.push({
        title: item.label,
        links: item.children.slice(0, 3).map((child: { label: string; href: string; description?: string; external?: boolean }) => ({
          label: child.label,
          href: child.href,
          external: child.external,
        })),
      })
    }
  }

  return footerSections.slice(0, 4)
}

export async function Footer() {
  let footerLinks: FooterSection[] = defaultFooterLinks

  try {
    const menuItems = await getFooterMenu()
    const converted = convertMenuToFooterLinks(menuItems)
    if (converted.length > 0) {
      footerLinks = converted
    }
  } catch (error) {
    console.error('Failed to fetch footer menu:', error)
  }

  return (
    <footer className="bg-dark text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 lg:gap-16">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <span className="font-bold text-2xl">유니피벗</span>
            </Link>
            <p className="text-white/60 leading-relaxed mb-8 max-w-sm">
              남북청년이 함께 새로운 한반도를 만들어갑니다.
              분단의 경계를 넘어 함께 소통하고, 이해하며,
              미래를 함께 그려갑니다.
            </p>
            <SocialIcons />
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-white text-lg mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-white/60 hover:text-primary transition-colors"
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
      </div>

      {/* Divider */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-white/60 transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="hover:text-white/60 transition-colors">
                이용약관
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} UniPivot. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info - Minimal */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-white/30">
            <span>사단법인 유니피벗</span>
            <span className="hidden md:inline">|</span>
            <span>contact@unipivot.org</span>
            <span className="hidden md:inline">|</span>
            <span>서울특별시 마포구</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
