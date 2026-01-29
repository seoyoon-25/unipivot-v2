'use client'

import Link from 'next/link'
import {
  Layout,
  Bell,
  MousePointer2,
  Search,
  Eye,
  MessageSquare,
  History,
  Moon,
  Code,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Menu,
  Type,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoEditor } from '@/components/admin/LogoEditor'

const designModules = [
  {
    title: '섹션별 편집',
    description: '메인 페이지의 각 섹션 콘텐츠를 편집합니다.',
    href: '/admin/design/sections',
    icon: Layout,
    status: 'active',
    features: ['Hero', 'UNI', 'PIVOT', '관심사', '프로그램', '리서치랩', '스토리', '푸터'],
  },
  {
    title: '공지 띠배너',
    description: '사이트 상단에 표시되는 공지 배너를 관리합니다.',
    href: '/admin/design/announcement-banner',
    icon: Bell,
    status: 'active',
    features: ['여러 개 등록', '기간 설정', '색상 커스터마이징'],
  },
  {
    title: '플로팅 버튼',
    description: '화면 하단에 고정되는 플로팅 버튼을 관리합니다.',
    href: '/admin/design/floating-buttons',
    icon: MousePointer2,
    status: 'active',
    features: ['카카오톡', '전화', '커스텀 링크'],
  },
  {
    title: 'SEO 설정',
    description: '검색 엔진 최적화 및 메타 태그를 설정합니다.',
    href: '/admin/design/seo',
    icon: Search,
    status: 'active',
    features: ['메타 태그', 'OG 이미지', '파비콘'],
  },
  {
    title: '팝업 관리',
    description: '페이지 진입 시 표시되는 팝업을 관리합니다.',
    href: '/admin/design/popups',
    icon: MessageSquare,
    status: 'active',
    features: ['이미지 팝업', 'HTML 팝업', '표시 빈도'],
  },
  {
    title: '테마 & 다크모드',
    description: '사이트 색상 테마와 다크모드를 설정합니다.',
    href: '/admin/design/theme',
    icon: Moon,
    status: 'active',
    features: ['프라이머리 색상', '다크모드', '폰트'],
  },
  {
    title: '커스텀 코드',
    description: '분석 스크립트와 커스텀 CSS를 삽입합니다.',
    href: '/admin/design/custom-code',
    icon: Code,
    status: 'active',
    features: ['Google Analytics', 'Meta Pixel', '채널톡'],
  },
  {
    title: '변경 히스토리',
    description: '디자인 변경 내역을 확인하고 복원합니다.',
    href: '/admin/design/history',
    icon: History,
    status: 'active',
    features: ['변경 내역', '이전 버전 복원', '30일 보관'],
  },
  {
    title: '페이지 관리',
    description: '사이트 페이지 구조와 콘텐츠를 관리합니다.',
    href: '/admin/design/pages',
    icon: FileText,
    status: 'active',
    features: ['페이지 계층', '콘텐츠 편집', 'URL 관리'],
  },
  {
    title: '메뉴 관리',
    description: '헤더와 푸터 메뉴를 구성합니다.',
    href: '/admin/design/menus',
    icon: Menu,
    status: 'active',
    features: ['헤더 메뉴', '푸터 메뉴', '드롭다운'],
  },
  {
    title: '폰트 설정',
    description: '사이트 전체 폰트 스타일을 설정합니다.',
    href: '/admin/design/fonts',
    icon: Type,
    status: 'active',
    features: ['본문 폰트', '제목 폰트', '글자 크기'],
  },
  {
    title: '소개 페이지',
    description: '회사 소개 페이지의 내용을 편집합니다.',
    href: '/admin/design/about',
    icon: Info,
    status: 'active',
    features: ['제목', '본문 단락', '이미지 3장'],
  },
]

export default function AdminDesignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">디자인 관리</h1>
        <p className="text-gray-500 mt-1">
          사이트의 디자인과 콘텐츠를 관리합니다.
        </p>
      </div>

      {/* Logo & Branding Section */}
      <LogoEditor />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 섹션</p>
                <p className="text-2xl font-bold">10</p>
              </div>
              <Layout className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 배너</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 팝업</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">최근 변경</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {designModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <module.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                    {module.status === 'active' ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> 활성</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 mr-1" /> 준비중</>
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-3 flex items-center justify-between">
                  {module.title}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription className="text-sm">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {module.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs font-normal">
                      {feature}
                    </Badge>
                  ))}
                  {module.features.length > 3 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{module.features.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            실시간 미리보기
          </CardTitle>
          <CardDescription>
            변경사항을 실시간으로 미리보기 할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <Link
              href="/admin/preview"
              className="p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <div className="text-base sm:text-lg font-medium">🖥️ 데스크톱</div>
              <div className="text-xs sm:text-sm text-muted-foreground">1920 x 1080</div>
            </Link>
            <Link
              href="/admin/preview?device=tablet"
              className="p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <div className="text-base sm:text-lg font-medium">📱 태블릿</div>
              <div className="text-xs sm:text-sm text-muted-foreground">768 x 1024</div>
            </Link>
            <Link
              href="/admin/preview?device=mobile"
              className="p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <div className="text-base sm:text-lg font-medium">📱 모바일</div>
              <div className="text-xs sm:text-sm text-muted-foreground">375 x 812</div>
            </Link>
          </div>

          {/* Live Preview Iframe */}
          <div className="border rounded-lg overflow-hidden bg-gray-100">
            <div className="bg-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between border-b gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 text-center truncate">
                  bestcome.org
                </div>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span className="hidden sm:inline">새 탭에서 열기</span>
                <span className="sm:hidden">열기</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            <iframe
              src="/"
              className="w-full h-[300px] sm:h-[500px] bg-white"
              title="사이트 미리보기"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
