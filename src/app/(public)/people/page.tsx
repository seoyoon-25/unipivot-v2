import { Metadata } from 'next';
import { checkPageAccess } from '@/lib/page-utils';
import { getVisibleTeamMembers } from '@/lib/actions/team-members';
import UnpublishedPage from '@/components/public/UnpublishedPage';
import TeamMemberCard from '@/components/public/TeamMemberCard';

export const metadata: Metadata = {
  title: '함께하는 사람들 | 유니피벗',
  description: '유니피벗과 함께하는 운영진, 자문위원을 소개합니다.',
};

interface PageProps {
  searchParams: Promise<{ preview?: string }>;
}

export default async function PeoplePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 페이지 접근 권한 확인
  const { canAccess, isPreview, page } = await checkPageAccess('people', params);

  // 비공개 페이지 처리
  if (!canAccess) {
    return (
      <UnpublishedPage
        title={page?.title || '함께하는 사람들'}
        message={page?.unpublishedMessage || '페이지 준비 중입니다.'}
      />
    );
  }

  // 팀 멤버 조회
  const { staff, advisors, alumni } = await getVisibleTeamMembers();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 미리보기 배너 */}
      {isPreview && (
        <div className="bg-yellow-500 text-yellow-900 text-center py-2 text-sm font-medium">
          미리보기 모드 - 이 페이지는 아직 공개되지 않았습니다.
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            함께하는 사람들
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            유니피벗과 함께 새로운 한반도를 만들어가는 사람들입니다.
          </p>
        </div>

        {/* 운영진 섹션 */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            운영진
          </h2>
          {staff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {staff.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">등록된 운영진이 없습니다.</p>
          )}
        </section>

        {/* 자문위원 섹션 */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            자문위원
          </h2>
          {advisors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advisors.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">등록된 자문위원이 없습니다.</p>
          )}
        </section>

        {/* 역대 운영진 섹션 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            함께해온 사람들
          </h2>
          {alumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {alumni.map((member) => (
                <TeamMemberCard key={member.id} member={member} compact />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">등록된 역대 운영진이 없습니다.</p>
          )}
        </section>
      </div>
    </main>
  );
}
