import UniClubHeader from '@/components/uniclub/UniClubHeader'
import UniClubBottomNav from '@/components/uniclub/UniClubBottomNav'

export default function UniClubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orb - top */}
        <div
          className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
          }}
        />
        {/* Warm accent orb - right */}
        <div
          className="absolute top-1/3 -right-[200px] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 70%)',
          }}
        />
        {/* Bottom accent */}
        <div
          className="absolute -bottom-[200px] left-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
          }}
        />
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative">
        <UniClubHeader />
        <main className="pt-16 pb-24 md:pb-0">{children}</main>
        <UniClubBottomNav />
      </div>
    </div>
  )
}
