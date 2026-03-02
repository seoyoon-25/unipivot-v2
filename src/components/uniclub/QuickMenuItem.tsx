'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface QuickMenuItemProps {
  label: string
  href: string
  icon: LucideIcon
  gradient: string
  shadowColor: string
  index: number
}

export default function QuickMenuItem({
  label,
  href,
  icon: Icon,
  gradient,
  shadowColor,
  index,
}: QuickMenuItemProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-3 p-2 rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Icon container with gradient */}
      <div
        className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
        style={{
          boxShadow: `0 8px 24px -4px ${shadowColor}`,
        }}
      >
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={1.8} />

        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Label */}
      <span className="text-xs md:text-sm font-medium text-stone-600 group-hover:text-stone-900 transition-colors duration-200 text-center leading-tight">
        {label}
      </span>
    </Link>
  )
}
