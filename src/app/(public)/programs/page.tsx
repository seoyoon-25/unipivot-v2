export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getFilteredProgramsByStatus, ProgramType } from '@/lib/actions/programs';
import ProgramTypeFilters from './ProgramTypeFilters';
import ProgramSection from './ProgramSection';
import CompletedProgramsSection from './CompletedProgramsSection';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ClubBanner } from '@/components/public/ClubBanner';

export const metadata: Metadata = {
  title: '전체 프로그램 | 유니피벗',
  description: '유니피벗의 다양한 프로그램을 확인하고 참여해보세요.',
};

// Default header content
const defaultHeader = {
  hero: {
    badge: 'Programs',
    title: '전체 프로그램',
    subtitle: '유니피벗의 다양한 프로그램을 확인하고 참여해보세요',
  },
};

async function getHeaderContent() {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'page.programs' },
    });
    if (section?.content && typeof section.content === 'string') {
      return JSON.parse(section.content) as typeof defaultHeader;
    }
  } catch (error) {
    console.error('Failed to load programs header:', error);
  }
  return defaultHeader;
}

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ProgramsPage({ searchParams }: PageProps) {
  // 세션 조회 실패 시에도 페이지 렌더링 가능하도록 try-catch
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // NextAuth 설정 오류 시에도 페이지는 렌더링
  }

  const [header, params] = await Promise.all([
    getHeaderContent(),
    searchParams,
  ]);

  const type = (params.type as ProgramType) || 'ALL';
  const { recruiting, ongoing, completed } = await getFilteredProgramsByStatus(type);

  // 완료는 처음 6개만
  const initialCompleted = completed.slice(0, 6);
  const hasMoreCompleted = completed.length > 6;
  const remainingCount = Math.max(0, completed.length - 6);

  // Get user's likes and applications if logged in
  let userLikes: Set<string> = new Set();
  let userApplications: Set<string> = new Set();

  if (session?.user?.id) {
    try {
      const [likes, applications] = await Promise.all([
        prisma.programLike.findMany({
          where: { userId: session.user.id },
          select: { programId: true },
        }),
        prisma.programApplication.findMany({
          where: { userId: session.user.id },
          select: { programId: true },
        }),
      ]);

      userLikes = new Set(likes.map((l) => l.programId));
      userApplications = new Set(applications.map((a) => a.programId));
    } catch {
      // 좋아요/신청 조회 실패 시 빈 Set 유지
    }
  }

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            {header.hero.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            {header.hero.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {header.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* 유니클럽 배너 */}
          <ClubBanner />

          {/* 필터 + 등록 버튼 */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <ProgramTypeFilters currentType={type} />
            {isAdmin && (
              <Link
                href="/admin/programs/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors shadow-lg shrink-0"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">프로그램 등록</span>
              </Link>
            )}
          </div>

          {/* 모집중 + 진행중 */}
          <ProgramSection
            title="모집 또는 진행중인 프로그램"
            emoji="🔥"
            programs={[...recruiting, ...ongoing]}
            emptyMessage="현재 진행중인 프로그램이 없습니다."
            showAll
            userLikes={userLikes}
            userApplications={userApplications}
          />

          {/* 완료 */}
          <Suspense fallback={
            <div className="space-y-6 min-h-[384px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }>
            <CompletedProgramsSection
              initialPrograms={initialCompleted}
              totalCount={completed.length}
              hasMore={hasMoreCompleted}
              remainingCount={remainingCount}
              type={type}
              userLikes={userLikes}
              userApplications={userApplications}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
