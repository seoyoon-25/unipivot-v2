import { Metadata } from 'next';
import ClubHeader from '@/components/club/ClubHeader';
import ClubSidebar from '@/components/club/ClubSidebar';
import ClubBottomNav from '@/components/club/ClubBottomNav';

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
    <div className="min-h-screen bg-gray-50">
      <ClubHeader />
      <div className="flex">
        <ClubSidebar />
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <ClubBottomNav />
    </div>
  );
}
