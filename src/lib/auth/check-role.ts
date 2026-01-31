import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type ClubRole = 'member' | 'facilitator' | 'admin';

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

/**
 * 현재 로그인한 사용자 정보 반환
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return {
    id: (session.user as { id?: string }).id || '',
    name: session.user.name ?? null,
    email: session.user.email,
    image: session.user.image ?? null,
    role: (session.user as { role?: string }).role || 'USER',
  };
}

/**
 * 현재 세션의 사용자 역할을 ClubRole로 변환
 */
export async function getCurrentUserRole(): Promise<ClubRole | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const role = session.user.role || 'USER';

  switch (role.toUpperCase()) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return 'admin';
    case 'STAFF':
    case 'FACILITATOR':
      return 'facilitator';
    default:
      return 'member';
  }
}

/**
 * 특정 역할 이상인지 확인
 */
export function hasMinimumRole(
  currentRole: ClubRole | null,
  requiredRole: ClubRole
): boolean {
  if (!currentRole) return false;

  const roleHierarchy: Record<ClubRole, number> = {
    member: 1,
    facilitator: 2,
    admin: 3,
  };

  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}
