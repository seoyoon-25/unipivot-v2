import {
  Home,
  BookOpen,
  CheckSquare,
  User,
  Users,
  Timer,
  MessageSquare,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Megaphone,
  MessagesSquare,
  Star,
  Sparkles,
  Flame,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

// 일반 회원용 네비게이션
export const memberNavItems: NavItem[] = [
  { name: '홈', href: '/club', icon: Home },
  { name: '프로그램', href: '/club/programs', icon: BookOpen },
  { name: '출석', href: '/club/attendance', icon: CheckSquare },
  { name: '독서모임', href: '/club/bookclub', icon: BookOpen },
  { name: 'MY', href: '/club/my', icon: User },
];

// 운영진용 네비게이션
export const facilitatorNavItems: NavItem[] = [
  { name: '홈', href: '/club', icon: Home },
  { name: '참가자', href: '/club/facilitator/participants', icon: Users },
  { name: '타이머', href: '/club/facilitator/timer', icon: Timer },
  { name: '질문', href: '/club/facilitator/questions', icon: MessageSquare },
  { name: '자료실', href: '/club/facilitator/resources', icon: FolderOpen },
];

// 관리자용 네비게이션
export const adminNavItems: NavItem[] = [
  { name: '홈', href: '/club', icon: Home },
  { name: '대시보드', href: '/club/admin/dashboard', icon: LayoutDashboard },
  { name: '회원', href: '/club/admin/members', icon: Users },
  { name: '프로그램', href: '/club/admin/programs', icon: BookOpen },
  { name: '설정', href: '/club/admin/settings', icon: Settings },
];

// 사이드바 메뉴 (PC용 - 더 상세한 메뉴)
export const sidebarMenuItems = {
  member: [
    {
      title: '홈',
      items: [
        { name: '대시보드', href: '/club', icon: Home },
        { name: '공지사항', href: '/club/notices', icon: Megaphone },
      ],
    },
    {
      title: '독서모임',
      items: [
        { name: '책장', href: '/club/bookclub/bookshelf', icon: BookOpen },
        { name: '내 책장', href: '/club/bookclub/my-bookshelf', icon: BookOpen },
        { name: '소감나눔', href: '/club/bookclub/reviews', icon: MessageSquare },
        { name: '평점 높은 책', href: '/club/bookclub/top-rated', icon: Star },
        { name: '명문장', href: '/club/bookclub/quotes', icon: BookOpen },
        { name: '스탬프', href: '/club/bookclub/stamps', icon: CheckSquare },
        { name: 'AI 책 추천', href: '/club/recommendations', icon: Sparkles },
      ],
    },
    {
      title: '참여',
      items: [
        { name: '내 프로그램', href: '/club/programs', icon: BookOpen },
        { name: '출석 현황', href: '/club/attendance', icon: CheckSquare },
        { name: '독서 챌린지', href: '/club/challenges', icon: Flame },
        { name: '활동 피드', href: '/club/social/feed', icon: Users },
        { name: '커뮤니티', href: '/club/community', icon: MessagesSquare },
        { name: '도움말', href: '/club/help', icon: HelpCircle },
      ],
    },
  ],
  facilitator: [
    {
      title: '진행 도구',
      items: [
        { name: '참가자 관리', href: '/club/facilitator/participants', icon: Users },
        { name: '발언 타이머', href: '/club/facilitator/timer', icon: Timer },
        { name: 'AI 질문', href: '/club/facilitator/questions', icon: MessageSquare },
        { name: '자료실', href: '/club/facilitator/resources', icon: FolderOpen },
      ],
    },
  ],
};

// 역할에 따른 네비게이션 반환
export function getNavItemsByRole(role: 'member' | 'facilitator' | 'admin'): NavItem[] {
  switch (role) {
    case 'admin':
      return adminNavItems;
    case 'facilitator':
      return facilitatorNavItems;
    default:
      return memberNavItems;
  }
}
