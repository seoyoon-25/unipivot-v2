import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCurrentUserRole, hasMinimumRole } from '@/lib/auth/check-role';

export default async function FacilitatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/facilitator'));
  }

  const role = await getCurrentUserRole();

  if (!hasMinimumRole(role, 'facilitator')) {
    redirect('/club/unauthorized?required=facilitator');
  }

  return <>{children}</>;
}
