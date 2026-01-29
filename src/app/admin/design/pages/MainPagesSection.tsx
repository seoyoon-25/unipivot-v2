'use client'

import Link from 'next/link'
import {
  Home,
  Info,
  Heart,
  BookOpen,
  Newspaper,
  Users,
  Calendar,
  FileText,
  Briefcase,
  MessageSquare,
  Building2,
  History,
  ExternalLink,
  Pencil,
  CheckCircle,
  AlertCircle,
  Layout,
  GraduationCap,
  Mic,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageToggleButton from '@/components/admin/PageToggleButton'

interface SiteSection {
  id: string
  sectionKey: string
  sectionName: string
  isVisible: boolean
}

interface Page {
  id: string
  slug: string
  title: string
  description: string | null
  isPublished: boolean
  menuGroup: string | null
  menuOrder: number | null
}

interface MainPagesSectionProps {
  sections: SiteSection[]
  pages: Page[]
}

// Define all main pages with their routes and edit locations
const mainPages = [
  {
    category: '메인',
    pages: [
      {
        name: '홈페이지',
        path: '/',
        editPath: '/admin/design/sections',
        icon: Home,
        description: '메인 페이지 섹션들',
        sectionKey: null, // Uses multiple sections
      },
    ]
  },
  {
    category: '소개',
    pages: [
      {
        name: '소개 페이지',
        path: '/about',
        editPath: '/admin/design/about',
        icon: Info,
        description: '유니피벗 소개 (한/영)',
        sectionKey: 'page.about',
      },
      {
        name: '단체 소개',
        path: '/p/about-us',
        editPath: '/admin/design/sections',
        icon: Building2,
        description: '단체 상세 소개',
        sectionKey: 'page.about-us',
      },
      {
        name: '연혁',
        path: '/p/history',
        editPath: '/admin/design/sections',
        icon: History,
        description: '유니피벗 연혁',
        sectionKey: 'page.history',
      },
    ]
  },
  {
    category: '프로그램',
    pages: [
      {
        name: '프로그램 목록',
        path: '/programs',
        editPath: '/admin/design/sections',
        icon: Calendar,
        description: '전체 프로그램 목록',
        sectionKey: 'page.programs',
      },
      {
        name: '북클럽',
        path: '/bookclub',
        editPath: null,
        icon: BookOpen,
        description: '북클럽 프로그램',
        sectionKey: null,
      },
      {
        name: '세미나',
        path: '/seminar',
        editPath: null,
        icon: Mic,
        description: '세미나 프로그램',
        sectionKey: null,
      },
      {
        name: 'K-MOVE',
        path: '/kmove',
        editPath: null,
        icon: Globe,
        description: 'K-MOVE 프로그램',
        sectionKey: null,
      },
    ]
  },
  {
    category: '커뮤니티',
    pages: [
      {
        name: '블로그',
        path: '/blog',
        editPath: '/admin/design/sections',
        icon: Newspaper,
        description: '블로그 게시판',
        sectionKey: 'page.blog',
      },
      {
        name: '공지사항',
        path: '/notice',
        editPath: '/admin/design/sections',
        icon: FileText,
        description: '공지사항 게시판',
        sectionKey: 'page.notice',
      },
      {
        name: '독후감',
        path: '/reports',
        editPath: null,
        icon: BookOpen,
        description: '독후감 게시판',
        sectionKey: null,
      },
    ]
  },
  {
    category: '사람들',
    pages: [
      {
        name: '우리가 읽은 책',
        path: '/books',
        editPath: null,
        icon: BookOpen,
        description: '읽은 책 목록',
        sectionKey: null,
      },
      {
        name: '책장',
        path: '/bookshelf',
        editPath: null,
        icon: BookOpen,
        description: '책장 페이지',
        sectionKey: null,
      },
      {
        name: '전문가 네트워크',
        path: '/experts',
        editPath: null,
        icon: GraduationCap,
        description: '전문가 목록',
        sectionKey: null,
      },
    ]
  },
  {
    category: '후원 & 협력',
    pages: [
      {
        name: '후원하기',
        path: '/donate',
        editPath: '/admin/design/sections',
        icon: Heart,
        description: '후원 페이지',
        sectionKey: 'page.donate',
      },
      {
        name: '협력 제안',
        path: '/cooperation',
        editPath: null,
        icon: Briefcase,
        description: '협력 제안 페이지',
        sectionKey: null,
      },
      {
        name: '인재 등록',
        path: '/talent',
        editPath: null,
        icon: Users,
        description: '인재 등록 페이지',
        sectionKey: null,
      },
    ]
  },
  {
    category: '기타',
    pages: [
      {
        name: '건의하기',
        path: '/suggest',
        editPath: null,
        icon: MessageSquare,
        description: '건의사항 페이지',
        sectionKey: null,
      },
      {
        name: '요청하기',
        path: '/request',
        editPath: null,
        icon: FileText,
        description: '요청 페이지',
        sectionKey: null,
      },
      {
        name: '한반도 이슈',
        path: '/korea-issue',
        editPath: null,
        icon: Globe,
        description: '한반도 이슈 페이지',
        sectionKey: null,
      },
      {
        name: '이용약관',
        path: '/terms',
        editPath: null,
        icon: FileText,
        description: '이용약관',
        sectionKey: null,
      },
      {
        name: '개인정보처리방침',
        path: '/privacy',
        editPath: null,
        icon: FileText,
        description: '개인정보처리방침',
        sectionKey: null,
      },
    ]
  },
]

export function MainPagesSection({ sections, pages }: MainPagesSectionProps) {
  const sectionMap = new Map(sections.map(s => [s.sectionKey, s]))
  // Map pages by their slug (with leading slash for matching)
  const pageMap = new Map(pages.map(p => [`/${p.slug}`, p]))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">메인 페이지</h2>
          <p className="text-gray-600 text-sm">
            사이트의 주요 페이지들입니다. 편집 버튼을 클릭하여 디자인을 수정하세요.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {mainPages.map((category) => (
          <Card key={category.category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {category.pages.map((page) => {
                  const section = page.sectionKey ? sectionMap.get(page.sectionKey) : null
                  const hasEditor = !!page.editPath
                  const isConfigured = section !== null || page.sectionKey === null
                  const pageData = pageMap.get(page.path)

                  return (
                    <div
                      key={page.path}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <page.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{page.name}</span>
                            {hasEditor ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                편집 가능
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                고정
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                              {page.path}
                            </code>
                            <span>·</span>
                            <span>{page.description}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {pageData && (
                          <PageToggleButton
                            pageId={pageData.id}
                            isPublished={pageData.isPublished}
                          />
                        )}
                        <Link href={page.path} target="_blank">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        {hasEditor ? (
                          <Link href={page.editPath!}>
                            <Button variant="outline" size="sm">
                              <Pencil className="w-4 h-4 mr-1" />
                              편집
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <Layout className="w-4 h-4 mr-1" />
                            코드 수정 필요
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              편집 가능
            </Badge>
            <span>관리자 페이지에서 콘텐츠를 편집할 수 있습니다.</span>
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              고정
            </Badge>
            <span>코드 수정이 필요한 페이지입니다. 편집 기능 추가를 요청하세요.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
