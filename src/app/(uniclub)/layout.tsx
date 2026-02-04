import UniClubHeader from '@/components/uniclub/UniClubHeader'
import UniClubBottomNav from '@/components/uniclub/UniClubBottomNav'

export default function UniClubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <UniClubHeader />
      <main className="pt-16 pb-20 md:pb-0">{children}</main>
      <UniClubBottomNav />
    </div>
  )
}
