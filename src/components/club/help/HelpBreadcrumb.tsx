import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Props {
  current: string
  parentLabel?: string
}

export default function HelpBreadcrumb({ current, parentLabel }: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
      <Link href="/club/help" className="hover:text-blue-600 transition-colors">
        도움말
      </Link>
      {parentLabel && (
        <>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>{parentLabel}</span>
        </>
      )}
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-gray-900 font-medium">{current}</span>
    </nav>
  )
}
