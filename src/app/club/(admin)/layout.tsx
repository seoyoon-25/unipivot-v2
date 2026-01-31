import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/check-role';
import AdminSidebar from '@/components/club/admin/AdminSidebar';
import AdminHeader from '@/components/club/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/admin'));
  }

  // ADMIN, SUPER_ADMIN, FACILITATOR 접근 허용
  if (!['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    redirect('/club/unauthorized?required=admin');
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <AdminSidebar userRole={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
