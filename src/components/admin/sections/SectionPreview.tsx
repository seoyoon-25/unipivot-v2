'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  Eye,
  Code,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SiteSection {
  id: string
  sectionKey: string
  sectionName: string
  content: any
  isVisible: boolean
  order: number
}

interface SectionPreviewProps {
  section: SiteSection
  className?: string
}

type DeviceType = 'desktop' | 'tablet' | 'mobile'
type ViewMode = 'visual' | 'code'

export function SectionPreview({ section, className }: SectionPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [viewMode, setViewMode] = useState<ViewMode>('visual')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto'
  }

  const refresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const renderSectionPreview = () => {
    switch (section.sectionKey) {
      case 'hero':
        return renderHeroPreview()
      case 'footer':
        return renderFooterPreview()
      case 'uni':
      case 'pivot':
      case 'interests':
        return renderTextSectionPreview()
      case 'lab':
        return renderLabPreview()
      case 'story':
        return renderStoryPreview()
      case 'programs':
      case 'recent':
        return renderProgramPreview()
      case 'instagram':
        return renderInstagramPreview()
      default:
        return renderDefaultPreview()
    }
  }

  const renderHeroPreview = () => {
    const content = section.content
    return (
      <section className="relative min-h-[500px] bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden">
        {content.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${content.backgroundImage})` }}
          />
        )}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {content.title || '제목을 입력하세요'}
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
            {content.subtitle || '부제목을 입력하세요'}
          </p>

          {/* Stats */}
          {content.stats?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {content.stats.map((stat: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  <div className="text-lg opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          {content.ctaButtons?.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {content.ctaButtons.map((button: any, index: number) => (
                <button
                  key={index}
                  className={cn(
                    'px-8 py-3 rounded-lg font-medium transition-colors',
                    button.variant === 'primary'
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'border-2 border-white text-white hover:bg-white hover:text-blue-600'
                  )}
                >
                  {button.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  const renderFooterPreview = () => {
    const content = section.content
    return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Organization Info */}
            <div>
              <h3 className="text-lg font-bold mb-4">조직 정보</h3>
              <div className="space-y-2 text-gray-300">
                <p>{content.organizationName}</p>
                <p>대표자: {content.representative}</p>
                <p>사업자번호: {content.businessNumber}</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">연락처</h3>
              <div className="space-y-2 text-gray-300">
                <p>{content.address}</p>
                <p>{content.phone}</p>
                <p>{content.email}</p>
                <p>{content.businessHours}</p>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">소셜 미디어</h3>
              <div className="space-y-2">
                {Object.entries(content.socialLinks || {}).map(([platform, link]: [string, any]) => (
                  link && (
                    <div key={platform} className="text-gray-300">
                      <span className="capitalize">{platform}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  const renderTextSectionPreview = () => {
    const content = section.content
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            {content.title || '제목을 입력하세요'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {content.description || '설명을 입력하세요'}
          </p>
        </div>
      </section>
    )
  }

  const renderLabPreview = () => {
    const content = section.content
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            {content.title || '제목을 입력하세요'}
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            {content.description || '설명을 입력하세요'}
          </p>

          {/* Stats */}
          {content.stats?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {content.stats.map((stat: any, index: number) => (
                <div key={index} className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{stat.value.toLocaleString()}</div>
                  <div className="text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {content.link && (
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
              자세히 보기
            </button>
          )}
        </div>
      </section>
    )
  }

  const renderStoryPreview = () => {
    const content = section.content
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {content.title || '제목을 입력하세요'}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {content.content || '본문을 입력하세요'}
              </p>

              {/* Stats */}
              {content.stats?.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                  {content.stats.map((stat: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-primary">{stat.value.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              {content.image ? (
                <img
                  src={content.image}
                  alt="Story"
                  className="w-full max-w-md rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full max-w-md aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">이미지를 업로드하세요</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderProgramPreview = () => {
    const content = section.content
    const isRecentPrograms = section.sectionKey === 'recent'

    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {content.title || '제목을 입력하세요'}
          </h2>

          {isRecentPrograms ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
              {Array.from({ length: content.displayCount || 6 }, (_, i) => (
                <div key={i} className="border rounded-lg p-6 bg-background">
                  <div className="h-32 bg-muted rounded mb-4"></div>
                  <h3 className="font-bold mb-2">프로그램 {i + 1}</h3>
                  <p className="text-sm text-muted-foreground">프로그램 설명...</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.programTypes?.map((type: string, index: number) => (
                <div key={index} className="text-center p-8 border rounded-lg bg-background">
                  <h3 className="text-xl font-bold mb-2">{type}</h3>
                  <p className="text-muted-foreground">프로그램 설명...</p>
                </div>
              )) || (
                <div className="col-span-full text-center text-muted-foreground">
                  프로그램 타입을 선택해주세요
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    )
  }

  const renderInstagramPreview = () => {
    const content = section.content
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg"></div>
            <h2 className="text-3xl font-bold">Instagram</h2>
          </div>

          {content.account && content.link ? (
            <div>
              <p className="text-lg mb-8">
                팔로우하세요: <span className="font-bold">@{content.account.replace('@', '')}</span>
              </p>

              {/* Mock Instagram Grid */}
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-8">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-purple-400 to-pink-600 rounded"></div>
                ))}
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium">
                Instagram에서 보기
              </button>
            </div>
          ) : (
            <p className="text-muted-foreground">계정 정보를 입력하세요</p>
          )}
        </div>
      </section>
    )
  }

  const renderDefaultPreview = () => (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">{section.sectionName} 섹션</h2>
        <p className="text-muted-foreground">
          이 섹션의 미리보기는 아직 구현되지 않았습니다.
        </p>
      </div>
    </section>
  )

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              실시간 미리보기
              {!section.isVisible && (
                <Badge variant="secondary">숨김</Badge>
              )}
            </CardTitle>
            <CardDescription>
              편집 중인 {section.sectionName} 섹션의 실시간 미리보기입니다.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={device === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDevice('desktop')}
                className="rounded-r-none"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={device === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDevice('tablet')}
                className="rounded-none"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={device === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDevice('mobile')}
                className="rounded-l-none"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'visual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('visual')}
                className="rounded-r-none"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'code' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('code')}
                className="rounded-l-none"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {viewMode === 'visual' ? (
          <div className="border-t bg-background min-h-96">
            <div className={cn('transition-all duration-200', deviceSizes[device])}>
              <div key={refreshKey} className="w-full">
                {renderSectionPreview()}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t">
            <pre className="p-4 text-xs bg-muted overflow-auto max-h-96">
              {JSON.stringify(section.content, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}