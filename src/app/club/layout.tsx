import { Metadata } from 'next';
import ClubHeader from '@/components/club/ClubHeader';
import ClubSidebar from '@/components/club/ClubSidebar';
import ClubBottomNav from '@/components/club/ClubBottomNav';
import SkipLink from '@/components/a11y/SkipLink';

export const metadata: Metadata = {
  title: { default: '유니클럽', template: '%s | 유니클럽' },
  description: '유니피벗 독서모임 플랫폼',
};

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-stone-50 to-stone-100/50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow - top left */}
        <div
          className="club-glow club-glow-primary w-[500px] h-[500px] -top-48 -left-48"
          style={{ opacity: 0.15 }}
        />
        {/* Amber glow - bottom right */}
        <div
          className="club-glow club-glow-amber w-[400px] h-[400px] -bottom-32 -right-32"
          style={{ opacity: 0.1 }}
        />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative">
        <SkipLink />
        <ClubHeader />
        <div className="flex">
          <ClubSidebar />
          <main
            id="main-content"
            className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-8 pb-24 lg:pb-8"
          >
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        <ClubBottomNav />
      </div>
    </div>
  );
}
