import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { ChatbotButton } from '@/components/public/ChatbotButton'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 lg:pt-20">{children}</main>
        <Footer />
        <ChatbotButton />
      </div>
    </Providers>
  )
}
