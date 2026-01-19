import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPageBySlug } from '@/lib/actions/pages';

interface PageAccessResult {
  canAccess: boolean;
  isPreview: boolean;
  page: Awaited<ReturnType<typeof getPageBySlug>> | null;
}

export async function checkPageAccess(
  slug: string,
  searchParams?: { preview?: string }
): Promise<PageAccessResult> {
  const page = await getPageBySlug(slug);

  if (!page) {
    return { canAccess: false, isPreview: false, page: null };
  }

  // 공개된 페이지는 접근 가능
  if (page.isPublished) {
    return { canAccess: true, isPreview: false, page };
  }

  // 비공개 페이지 - 미리보기 체크
  const isPreviewMode = searchParams?.preview === 'true';

  if (isPreviewMode) {
    // 관리자 로그인 확인
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    if (isAdmin) {
      return { canAccess: true, isPreview: true, page };
    }
  }

  // 비공개 + 미리보기 권한 없음
  return { canAccess: false, isPreview: false, page };
}
