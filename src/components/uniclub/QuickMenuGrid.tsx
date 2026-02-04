import {
  Users,
  BookOpen,
  Ticket,
  Coins,
  MapPin,
  MessageCircle,
  HelpCircle,
  Library,
} from 'lucide-react'
import QuickMenuItem from './QuickMenuItem'

const QUICK_MENUS = [
  {
    label: '북클럽 참가',
    href: '/programs',
    icon: Users,
    bg: 'bg-blue-50',
    color: 'text-blue-600',
  },
  {
    label: '가이드',
    href: '/p/about-us',
    icon: BookOpen,
    bg: 'bg-indigo-50',
    color: 'text-indigo-600',
  },
  {
    label: '멤버십',
    href: '/club/my',
    icon: Ticket,
    bg: 'bg-violet-50',
    color: 'text-violet-600',
  },
  {
    label: '포인트',
    href: '/my/points',
    icon: Coins,
    bg: 'bg-amber-50',
    color: 'text-amber-600',
  },
  {
    label: '모임장소',
    href: '/p/about-us',
    icon: MapPin,
    bg: 'bg-rose-50',
    color: 'text-rose-600',
  },
  {
    label: '문의',
    href: '/request',
    icon: MessageCircle,
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
  },
  {
    label: 'FAQ',
    href: '/suggest',
    icon: HelpCircle,
    bg: 'bg-sky-50',
    color: 'text-sky-600',
  },
  {
    label: '내 서재',
    href: '/club/bookclub/my-bookshelf',
    icon: Library,
    bg: 'bg-teal-50',
    color: 'text-teal-600',
  },
]

export default function QuickMenuGrid() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {QUICK_MENUS.map((item) => (
            <QuickMenuItem
              key={item.label}
              label={item.label}
              href={item.href}
              icon={item.icon}
              bg={item.bg}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
