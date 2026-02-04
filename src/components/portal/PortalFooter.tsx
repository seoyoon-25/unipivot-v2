interface PortalFooterProps {
  members: number
  programs: number
}

export default function PortalFooter({ members, programs }: PortalFooterProps) {
  const stats = [
    { label: 'ESTABLISHED', value: '2015' },
    { label: 'MEMBERS', value: String(members) },
    { label: 'PROGRAMS', value: String(programs) },
    { label: 'LOCATION', value: 'SEOUL' },
  ]

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-white/40 text-xs tracking-wider mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 하단 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} UniPivot. 남북청년이 함께
            만들어가는 하나된 미래
          </p>
          <div className="flex gap-6 text-white/40 text-sm">
            <a
              href="https://www.instagram.com/unipivot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/unipivot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Facebook
            </a>
            <a
              href="/home"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
