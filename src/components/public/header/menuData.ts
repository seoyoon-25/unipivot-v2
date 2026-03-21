import type { MenuItem } from './types'
import type { LucideIcon } from 'lucide-react'
import { Info, BookOpen, MessageSquare, Heart, FlaskConical } from 'lucide-react'

export const LAB_DOMAIN = process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'

// 카테고리별 아이콘 매핑
export const ICON_MAP: Record<string, LucideIcon> = {
  '소개': Info,
  '프로그램': BookOpen,
  '소통마당': MessageSquare,
  '함께하기': Heart,
  '리서치랩': FlaskConical,
}

// 기본 메뉴 데이터
export const defaultMenuItems: MenuItem[] = [
  {
    label: '소개',
    children: [
      { label: '유니피벗 소개', href: '/about', description: '미션과 핵심 가치' },
      { label: '연혁', href: '/history', description: '유니피벗 히스토리' },
    ],
  },
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
    label: '소통마당',
    children: [
      { label: '공지사항', href: '/notice', description: '단체 소식' },
      { label: '활동 블로그', href: '/blog', description: '모임 기록, 후기' },
      { label: '읽고 싶은 책', href: '/books', description: '함께 읽고 싶은 책 공유' },
      { label: '한반도이슈', href: '/korea-issue', description: 'AI 피봇이와 함께' },
    ],
  },
  {
    label: '함께하기',
    children: [
      { label: '후원하기', href: '/donate', description: '유니피벗 후원' },
      { label: '프로그램 제안', href: '/suggest', description: '새로운 아이디어' },
      { label: '협조 요청', href: '/cooperation', description: '자문/강사/설문 요청' },
      { label: '재능나눔', href: '/talent', description: '재능 기부' },
    ],
  },
]
