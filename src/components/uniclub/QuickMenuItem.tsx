import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface QuickMenuItemProps {
  label: string
  href: string
  icon: LucideIcon
  color: string
  bg: string
}

export default function QuickMenuItem({ label, href, icon: Icon, color, bg }: QuickMenuItemProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl p-3"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color} transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md group-active:scale-95`}
      >
        <Icon className="w-6 h-6 transition-transform duration-200 group-hover:animate-[bounce_0.5s_ease-in-out]" />
      </div>
      <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors duration-200">
        {label}
      </span>
    </Link>
  )
}
