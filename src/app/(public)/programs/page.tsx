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
  const [session, header, params] = await Promise.all([
    getServerSession(authOptions),
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
          {/* 관리자 전용 글쓰기 버튼 */}
          {isAdmin && (
            <Link
              href="/programs/write"
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-primary rounded-xl font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">프로그램 등록</span>
            </Link>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* 필터 */}
          <ProgramTypeFilters currentType={type} />

          {/* 모집중 */}
          <ProgramSection
            title="모집중"
            emoji="🔥"
            programs={recruiting}
            emptyMessage="현재 모집중인 프로그램이 없습니다."
            showAll
            userLikes={userLikes}
            userApplications={userApplications}
          />

          {/* 진행중 */}
          <ProgramSection
            title="진행중"
            emoji="🔄"
            programs={ongoing}
            emptyMessage="현재 진행중인 프로그램이 없습니다."
            showAll
            userLikes={userLikes}
            userApplications={userApplications}
          />

          {/* 완료 */}
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl" />}>
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
