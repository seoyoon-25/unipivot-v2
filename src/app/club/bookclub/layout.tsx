import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '독서모임',
    template: '%s | 독서모임 | 유니클럽',
  },
};

export default function BookclubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
