import Link from 'next/link'
import {
  Book,
  BookOpen,
  Users,
  CheckSquare,
  MessageSquare,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'
import { faqItems } from '@/data/help-content'

export const metadata = { title: '도움말 | 유니클럽' }

const quickLinks: { href: string; icon: LucideIcon; title: string; desc: string }[] = [
  { href: '/club/help/getting-started', icon: Book, title: '시작하기', desc: '기본 사용법 안내' },
  { href: '/club/help/guides/bookclub', icon: BookOpen, title: '책장', desc: '독후감, 명문장 관리' },
  { href: '/club/help/guides/programs', icon: Users, title: '프로그램', desc: '독서모임 참여' },
  {
    href: '/club/help/guides/attendance',
    icon: CheckSquare,
    title: '출석',
    desc: 'QR 출석체크',
  },
  {
    href: '/club/help/guides/community',
    icon: MessageSquare,
    title: '커뮤니티',
    desc: '게시판 이용',
  },
  { href: '/club/help/faq', icon: HelpCircle, title: 'FAQ', desc: '자주 묻는 질문' },
]

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">도움말</h1>
      <p className="text-gray-500 mb-8">유니클럽 사용에 필요한 모든 안내</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <Icon className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">{link.title}</h3>
              <p className="text-sm text-gray-500">{link.desc}</p>
            </Link>
          )
        })}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqItems
            .slice(0, 3)
            .flatMap((cat) =>
              cat.questions.slice(0, 2).map((q, i) => (
                <details
                  key={`${cat.category}-${i}`}
                  className="bg-white rounded-xl border border-gray-200"
                >
                  <summary className="p-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50 rounded-xl">
                    {q.q}
                  </summary>
                  <p className="px-4 pb-4 text-gray-600">{q.a}</p>
                </details>
              ))
            )}
        </div>
        <Link
          href="/club/help/faq"
          className="inline-block mt-4 text-blue-600 hover:underline text-sm"
        >
          모든 FAQ 보기 &rarr;
        </Link>
      </section>
    </div>
  )
}
