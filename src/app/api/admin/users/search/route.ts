import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/check-role';
import { searchUsersForProgram } from '@/lib/club/program-admin-queries';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const programId = searchParams.get('programId') || '';

  if (!programId || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await searchUsersForProgram(programId, query);
  return NextResponse.json({ users });
}
