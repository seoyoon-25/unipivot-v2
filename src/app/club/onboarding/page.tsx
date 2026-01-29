import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OnboardingFlow from '@/components/club/onboarding/OnboardingFlow';

export const metadata = { title: '시작하기 - 유니클럽' };

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=' + encodeURIComponent('/club/onboarding'));

  return <OnboardingFlow />;
}
