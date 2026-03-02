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
    gradient: 'from-teal-500 to-teal-600',
    shadowColor: 'rgba(13, 115, 119, 0.35)',
  },
  {
    label: '가이드',
    href: '/p/about-us',
    icon: BookOpen,
    gradient: 'from-amber-500 to-amber-600',
    shadowColor: 'rgba(245, 158, 11, 0.35)',
  },
  {
    label: '멤버십',
    href: '/club/my',
    icon: Ticket,
    gradient: 'from-rose-500 to-rose-600',
    shadowColor: 'rgba(244, 63, 94, 0.35)',
  },
  {
    label: '포인트',
    href: '/my/points',
    icon: Coins,
    gradient: 'from-yellow-500 to-amber-500',
    shadowColor: 'rgba(234, 179, 8, 0.35)',
  },
  {
    label: '모임장소',
    href: '/p/about-us',
    icon: MapPin,
    gradient: 'from-emerald-500 to-emerald-600',
    shadowColor: 'rgba(16, 185, 129, 0.35)',
  },
  {
    label: '문의',
    href: '/request',
    icon: MessageCircle,
    gradient: 'from-sky-500 to-sky-600',
    shadowColor: 'rgba(14, 165, 233, 0.35)',
  },
  {
    label: 'FAQ',
    href: '/suggest',
    icon: HelpCircle,
    gradient: 'from-violet-500 to-violet-600',
    shadowColor: 'rgba(139, 92, 246, 0.35)',
  },
  {
    label: '내 서재',
    href: '/club/bookclub/my-bookshelf',
    icon: Library,
    gradient: 'from-orange-500 to-orange-600',
    shadowColor: 'rgba(249, 115, 22, 0.35)',
  },
]

export default function QuickMenuGrid() {
  return (
    <section className="relative py-8 md:py-12 -mt-8 md:-mt-12 z-10 bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Warm glass card container */}
        <div
          className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-stone-200/50 p-6 md:p-10"
          style={{
            boxShadow: '0 20px 50px -15px rgba(120, 113, 108, 0.15), 0 8px 20px -8px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Decorative warm gradient */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-100/50 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
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
