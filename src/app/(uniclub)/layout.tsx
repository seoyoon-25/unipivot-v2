import UniClubHeader from '@/components/uniclub/UniClubHeader'
import UniClubBottomNav from '@/components/uniclub/UniClubBottomNav'

export default function UniClubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#faf8f5] relative">
      {/* Ambient background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Warm gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-100/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-100/30 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-stone-100/20 to-transparent blur-3xl" />

        {/* Paper texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <UniClubHeader />

      {/* Main Content */}
      <main className="relative pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <UniClubBottomNav />
    </div>
  )
}
