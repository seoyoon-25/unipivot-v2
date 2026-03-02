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
    gradient: 'from-indigo-500 to-indigo-600',
    shadowColor: 'rgba(99, 102, 241, 0.3)',
  },
  {
    label: '가이드',
    href: '/p/about-us',
    icon: BookOpen,
    gradient: 'from-purple-500 to-purple-600',
    shadowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    label: '멤버십',
    href: '/club/my',
    icon: Ticket,
    gradient: 'from-violet-500 to-violet-600',
    shadowColor: 'rgba(124, 58, 237, 0.3)',
  },
  {
    label: '포인트',
    href: '/my/points',
    icon: Coins,
    gradient: 'from-amber-500 to-amber-600',
    shadowColor: 'rgba(245, 158, 11, 0.3)',
  },
  {
    label: '모임장소',
    href: '/p/about-us',
    icon: MapPin,
    gradient: 'from-rose-500 to-rose-600',
    shadowColor: 'rgba(244, 63, 94, 0.3)',
  },
  {
    label: '문의',
    href: '/request',
    icon: MessageCircle,
    gradient: 'from-emerald-500 to-emerald-600',
    shadowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    label: 'FAQ',
    href: '/suggest',
    icon: HelpCircle,
    gradient: 'from-sky-500 to-sky-600',
    shadowColor: 'rgba(14, 165, 233, 0.3)',
  },
  {
    label: '내 서재',
    href: '/club/bookclub/my-bookshelf',
    icon: Library,
    gradient: 'from-teal-500 to-teal-600',
    shadowColor: 'rgba(20, 184, 166, 0.3)',
  },
]

export default function QuickMenuGrid() {
  return (
    <section className="relative py-8 md:py-12 -mt-8 md:-mt-10 z-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Glass card container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-stone-200/50 p-6 md:p-8">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
            {QUICK_MENUS.map((item, index) => (
              <QuickMenuItem
                key={item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                gradient={item.gradient}
                shadowColor={item.shadowColor}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
