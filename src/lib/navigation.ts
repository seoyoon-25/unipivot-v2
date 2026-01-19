import { getPublishedPages } from '@/lib/actions/pages';

// 기본 메뉴 구조 (DB와 무관한 고정 메뉴)
export const staticMenuItems = [
  {
    label: '프로그램',
    children: [
      { label: '전체 프로그램', href: '/programs', description: '모든 프로그램 보기' },
      { label: '독서모임', href: '/programs?type=BOOKCLUB', description: '남Book북한걸음' },
      { label: '강연 및 세미나', href: '/programs?type=SEMINAR', description: '정기 교육 세미나' },
      { label: 'K-Move', href: '/programs?type=KMOVE', description: '현장 탐방' },
      { label: '토론회', href: '/programs?type=DEBATE', description: '주제별 토론회' },
    ],
  },
  {
    label: '리서치랩',
    href: 'https://lab.bestcome.org',
    external: true,
  },
];

// DB 기반 동적 메뉴 (소개, 소통마당, 함께하기)
export const dynamicMenuGroups = ['소개', '소통마당', '함께하기'];

// 메뉴 그룹별 기본 순서 및 고정 항목
export const menuGroupConfig: Record<string, {
  order: number;
  staticItems?: { label: string; href: string; description?: string }[];
}> = {
  '소개': {
    order: 1,
    staticItems: [],
  },
  '프로그램': {
    order: 2,
    staticItems: [], // staticMenuItems에서 관리
  },
  '소통마당': {
    order: 3,
    staticItems: [
      { label: '공지사항', href: '/notice', description: '단체 소식' },
      { label: '활동 블로그', href: '/blog', description: '모임 기록, 후기' },
      // '읽고 싶은 책'은 DB에서
      { label: '한반도이슈', href: '/korea-issue', description: 'AI 피봇이와 함께' },
    ],
  },
  '함께하기': {
    order: 4,
    staticItems: [
      { label: '후원하기', href: '/donate', description: '유니피벗 후원' },
      { label: '프로그램 제안', href: '/suggest', description: '새로운 아이디어' },
      { label: '협조 요청', href: '/cooperation', description: '자문/강사/설문 요청' },
      { label: '재능나눔', href: '/talent', description: '재능 기부' },
    ],
  },
};

// 전체 메뉴 조합 함수
export async function getNavigationMenu() {
  const publishedPages = await getPublishedPages();

  // 소개 메뉴 구성
  const introMenu = {
    label: '소개',
    children: [
      // 고정 항목
      { label: '유니피벗 소개', href: '/about', description: '미션과 핵심 가치' },
      { label: '연혁', href: '/history', description: '유니피벗 히스토리' },
      // DB에서 가져온 항목 (함께하는 사람들 - 공개된 경우만)
      ...publishedPages
        .filter(p => p.menuGroup === '소개' && p.slug === 'people')
        .map(p => ({ label: p.title, href: `/${p.slug}`, description: p.description || undefined })),
    ],
  };

  // 소통마당 메뉴 구성
  const communityMenu = {
    label: '소통마당',
    children: [
      { label: '공지사항', href: '/notice', description: '단체 소식' },
      { label: '활동 블로그', href: '/blog', description: '모임 기록, 후기' },
      // DB에서 가져온 항목 (읽고 싶은 책 - 공개된 경우만)
      ...publishedPages
        .filter(p => p.menuGroup === '소통마당' && p.slug === 'books')
        .map(p => ({ label: p.title, href: `/${p.slug}`, description: p.description || undefined })),
      { label: '한반도이슈', href: '/korea-issue', description: 'AI 피봇이와 함께' },
    ],
  };

  // 함께하기 메뉴
  const participateMenu = {
    label: '함께하기',
    children: [
      { label: '후원하기', href: '/donate', description: '유니피벗 후원' },
      { label: '프로그램 제안', href: '/suggest', description: '새로운 아이디어' },
      { label: '협조 요청', href: '/cooperation', description: '자문/강사/설문 요청' },
      { label: '재능나눔', href: '/talent', description: '재능 기부' },
    ],
  };

  // 프로그램 메뉴
  const programMenu = {
    label: '프로그램',
    children: [
      { label: '전체 프로그램', href: '/programs', description: '모든 프로그램 보기' },
      { label: '독서모임', href: '/programs?type=BOOKCLUB', description: '남Book북한걸음' },
      { label: '강연 및 세미나', href: '/programs?type=SEMINAR', description: '정기 교육 세미나' },
      { label: 'K-Move', href: '/programs?type=KMOVE', description: '현장 탐방' },
      { label: '토론회', href: '/programs?type=DEBATE', description: '주제별 토론회' },
    ],
  };

  // 리서치랩 (외부 링크)
  const researchLabMenu = {
    label: '리서치랩',
    href: 'https://lab.bestcome.org',
    external: true,
  };

  return [
    introMenu,
    programMenu,
    communityMenu,
    participateMenu,
    researchLabMenu,
  ];
}

// 푸터용 메뉴 (동일 구조)
export async function getFooterMenu() {
  return await getNavigationMenu();
}
