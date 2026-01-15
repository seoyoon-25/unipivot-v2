'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface SiteSection {
  id: string
  sectionKey: string
  sectionName: string
  content: any
  isVisible: boolean
  order: number
}

interface PageSectionEditorProps {
  section: SiteSection
  onUpdate: (sectionKey: string, content: any) => void
  onSave: (sectionKey: string) => void
}

// About Page Editor
export function AboutPageEditor({ section, onUpdate, onSave }: PageSectionEditorProps) {
  const content = section.content || {}
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    hero: true,
    stats: false,
    mission: false,
    values: false,
    cta: false,
  })

  const handleChange = (path: string[], value: any) => {
    const newContent = JSON.parse(JSON.stringify(content))
    let current = newContent
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
    onUpdate(section.sectionKey, newContent)
  }

  const toggleSection = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>소개 페이지 콘텐츠</CardTitle>
        <CardDescription>/about 페이지의 모든 섹션을 편집합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('hero')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-semibold">히어로 섹션</h3>
            {expanded.hero ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expanded.hero && (
            <div className="p-4 border-t space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>뱃지 텍스트</Label>
                  <Input
                    value={content.hero?.badge || ''}
                    onChange={(e) => handleChange(['hero', 'badge'], e.target.value)}
                    placeholder="About Us"
                  />
                </div>
                <div>
                  <Label>제목</Label>
                  <Input
                    value={content.hero?.title || ''}
                    onChange={(e) => handleChange(['hero', 'title'], e.target.value)}
                    placeholder="유니피벗 소개"
                  />
                </div>
                <div>
                  <Label>부제목</Label>
                  <Input
                    value={content.hero?.subtitle || ''}
                    onChange={(e) => handleChange(['hero', 'subtitle'], e.target.value)}
                    placeholder="남북청년이 함께 새로운 한반도를 만들어갑니다"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('stats')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-semibold">통계 섹션</h3>
            {expanded.stats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expanded.stats && (
            <div className="p-4 border-t space-y-4">
              {(content.stats || []).map((stat: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      value={stat.label || ''}
                      onChange={(e) => {
                        const newStats = [...(content.stats || [])]
                        newStats[index] = { ...newStats[index], label: e.target.value }
                        handleChange(['stats'], newStats)
                      }}
                      placeholder="레이블"
                    />
                    <Input
                      value={stat.value || ''}
                      onChange={(e) => {
                        const newStats = [...(content.stats || [])]
                        newStats[index] = { ...newStats[index], value: e.target.value }
                        handleChange(['stats'], newStats)
                      }}
                      placeholder="값"
                    />
                    <select
                      value={stat.icon || 'Calendar'}
                      onChange={(e) => {
                        const newStats = [...(content.stats || [])]
                        newStats[index] = { ...newStats[index], icon: e.target.value }
                        handleChange(['stats'], newStats)
                      }}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="Calendar">달력</option>
                      <option value="Users">사람들</option>
                      <option value="Target">타겟</option>
                      <option value="Heart">하트</option>
                    </select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newStats = (content.stats || []).filter((_: any, i: number) => i !== index)
                      handleChange(['stats'], newStats)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newStats = [...(content.stats || []), { label: '', value: '', icon: 'Calendar' }]
                  handleChange(['stats'], newStats)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                통계 추가
              </Button>
            </div>
          )}
        </div>

        {/* Mission Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('mission')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-semibold">미션 섹션</h3>
            {expanded.mission ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expanded.mission && (
            <div className="p-4 border-t space-y-4">
              <div>
                <Label>뱃지 텍스트</Label>
                <Input
                  value={content.mission?.badge || ''}
                  onChange={(e) => handleChange(['mission', 'badge'], e.target.value)}
                  placeholder="Our Mission"
                />
              </div>
              <div>
                <Label>제목</Label>
                <Input
                  value={content.mission?.title || ''}
                  onChange={(e) => handleChange(['mission', 'title'], e.target.value)}
                  placeholder="우리의 미션"
                />
              </div>
              <div>
                <Label>본문 (HTML 지원, 줄바꿈으로 문단 구분)</Label>
                <Textarea
                  value={(content.mission?.paragraphs || []).join('\n')}
                  onChange={(e) => handleChange(['mission', 'paragraphs'], e.target.value.split('\n'))}
                  rows={6}
                  placeholder="각 줄이 하나의 문단이 됩니다. <strong>굵은글씨</strong> 사용 가능"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>로고 텍스트</Label>
                  <Input
                    value={content.mission?.logoText || ''}
                    onChange={(e) => handleChange(['mission', 'logoText'], e.target.value)}
                    placeholder="UNITE + PIVOT"
                  />
                </div>
                <div>
                  <Label>로고 부제</Label>
                  <Input
                    value={content.mission?.logoSubtext || ''}
                    onChange={(e) => handleChange(['mission', 'logoSubtext'], e.target.value)}
                    placeholder="하나됨 + 전환"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Values Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('values')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-semibold">핵심 가치 섹션</h3>
            {expanded.values ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expanded.values && (
            <div className="p-4 border-t space-y-4">
              <div>
                <Label>뱃지 텍스트</Label>
                <Input
                  value={content.values?.badge || ''}
                  onChange={(e) => handleChange(['values', 'badge'], e.target.value)}
                  placeholder="Our Values"
                />
              </div>
              <div>
                <Label>제목</Label>
                <Input
                  value={content.values?.title || ''}
                  onChange={(e) => handleChange(['values', 'title'], e.target.value)}
                  placeholder="핵심 가치"
                />
              </div>
              <Label>가치 항목</Label>
              {(content.values?.items || []).map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                  <GripVertical className="w-4 h-4 text-gray-400 mt-3" />
                  <div className="flex-1 grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={item.title || ''}
                        onChange={(e) => {
                          const newItems = [...(content.values?.items || [])]
                          newItems[index] = { ...newItems[index], title: e.target.value }
                          handleChange(['values', 'items'], newItems)
                        }}
                        placeholder="제목"
                      />
                      <Input
                        value={item.icon || ''}
                        onChange={(e) => {
                          const newItems = [...(content.values?.items || [])]
                          newItems[index] = { ...newItems[index], icon: e.target.value }
                          handleChange(['values', 'items'], newItems)
                        }}
                        placeholder="이모지 (예: 🤝)"
                      />
                    </div>
                    <Textarea
                      value={item.description || ''}
                      onChange={(e) => {
                        const newItems = [...(content.values?.items || [])]
                        newItems[index] = { ...newItems[index], description: e.target.value }
                        handleChange(['values', 'items'], newItems)
                      }}
                      placeholder="설명"
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newItems = (content.values?.items || []).filter((_: any, i: number) => i !== index)
                      handleChange(['values', 'items'], newItems)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newItems = [...(content.values?.items || []), { title: '', description: '', icon: '' }]
                  handleChange(['values', 'items'], newItems)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                가치 추가
              </Button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('cta')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-semibold">CTA 섹션</h3>
            {expanded.cta ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expanded.cta && (
            <div className="p-4 border-t space-y-4">
              <div>
                <Label>제목</Label>
                <Input
                  value={content.cta?.title || ''}
                  onChange={(e) => handleChange(['cta', 'title'], e.target.value)}
                  placeholder="함께 만들어가는 한반도"
                />
              </div>
              <div>
                <Label>부제목</Label>
                <Input
                  value={content.cta?.subtitle || ''}
                  onChange={(e) => handleChange(['cta', 'subtitle'], e.target.value)}
                  placeholder="유니피벗과 함께 새로운 한반도의 미래를 준비하세요"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>주요 버튼 텍스트</Label>
                  <Input
                    value={content.cta?.primaryButton?.text || ''}
                    onChange={(e) => handleChange(['cta', 'primaryButton', 'text'], e.target.value)}
                    placeholder="회원가입"
                  />
                </div>
                <div>
                  <Label>주요 버튼 링크</Label>
                  <Input
                    value={content.cta?.primaryButton?.link || ''}
                    onChange={(e) => handleChange(['cta', 'primaryButton', 'link'], e.target.value)}
                    placeholder="/register"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>보조 버튼 텍스트</Label>
                  <Input
                    value={content.cta?.secondaryButton?.text || ''}
                    onChange={(e) => handleChange(['cta', 'secondaryButton', 'text'], e.target.value)}
                    placeholder="후원하기"
                  />
                </div>
                <div>
                  <Label>보조 버튼 링크</Label>
                  <Input
                    value={content.cta?.secondaryButton?.link || ''}
                    onChange={(e) => handleChange(['cta', 'secondaryButton', 'link'], e.target.value)}
                    placeholder="/donate"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Button onClick={() => onSave(section.sectionKey)} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          저장
        </Button>
      </CardContent>
    </Card>
  )
}

// Donate Page Editor
export function DonatePageEditor({ section, onUpdate, onSave }: PageSectionEditorProps) {
  const content = section.content || {}

  const handleChange = (path: string[], value: any) => {
    const newContent = JSON.parse(JSON.stringify(content))
    let current = newContent
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {}
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
    onUpdate(section.sectionKey, newContent)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>후원 페이지 콘텐츠</CardTitle>
        <CardDescription>/donate 페이지의 모든 섹션을 편집합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">히어로 섹션</h3>
          <div className="grid gap-4">
            <div>
              <Label>뱃지 텍스트</Label>
              <Input
                value={content.hero?.badge || ''}
                onChange={(e) => handleChange(['hero', 'badge'], e.target.value)}
                placeholder="Donate"
              />
            </div>
            <div>
              <Label>제목</Label>
              <Input
                value={content.hero?.title || ''}
                onChange={(e) => handleChange(['hero', 'title'], e.target.value)}
                placeholder="후원하기"
              />
            </div>
            <div>
              <Label>부제목</Label>
              <Input
                value={content.hero?.subtitle || ''}
                onChange={(e) => handleChange(['hero', 'subtitle'], e.target.value)}
                placeholder="여러분의 후원이 남북청년의 만남을 가능하게 합니다"
              />
            </div>
          </div>
        </div>

        {/* Monthly Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">정기 후원 섹션</h3>
          <div className="grid gap-4">
            <div>
              <Label>제목</Label>
              <Input
                value={content.monthly?.title || ''}
                onChange={(e) => handleChange(['monthly', 'title'], e.target.value)}
                placeholder="정기 후원"
              />
            </div>
            <div>
              <Label>설명</Label>
              <Textarea
                value={content.monthly?.description || ''}
                onChange={(e) => handleChange(['monthly', 'description'], e.target.value)}
                placeholder="매월 정기적인 후원으로..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>버튼 텍스트</Label>
                <Input
                  value={content.monthly?.buttonText || ''}
                  onChange={(e) => handleChange(['monthly', 'buttonText'], e.target.value)}
                  placeholder="정기 후원 문의하기"
                />
              </div>
              <div>
                <Label>버튼 링크</Label>
                <Input
                  value={content.monthly?.buttonLink || ''}
                  onChange={(e) => handleChange(['monthly', 'buttonLink'], e.target.value)}
                  placeholder="/contact"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tax Info Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">세액공제 안내</h3>
          <div className="grid gap-4">
            <div>
              <Label>제목</Label>
              <Input
                value={content.taxInfo?.title || ''}
                onChange={(e) => handleChange(['taxInfo', 'title'], e.target.value)}
                placeholder="세액공제 안내"
              />
            </div>
            <div>
              <Label>설명</Label>
              <Textarea
                value={content.taxInfo?.description || ''}
                onChange={(e) => handleChange(['taxInfo', 'description'], e.target.value)}
                placeholder="사단법인 유니피벗에 대한 후원금은..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>연락처 레이블</Label>
                <Input
                  value={content.taxInfo?.contactLabel || ''}
                  onChange={(e) => handleChange(['taxInfo', 'contactLabel'], e.target.value)}
                  placeholder="기부금 영수증 문의"
                />
              </div>
              <div>
                <Label>이메일</Label>
                <Input
                  value={content.taxInfo?.contactEmail || ''}
                  onChange={(e) => handleChange(['taxInfo', 'contactEmail'], e.target.value)}
                  placeholder="unipivot@unipivot.org"
                />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => onSave(section.sectionKey)} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          저장
        </Button>
      </CardContent>
    </Card>
  )
}

// Simple Header Editor (for programs, blog, notice)
export function PageHeaderEditor({ section, onUpdate, onSave }: PageSectionEditorProps) {
  const content = section.content || {}

  const handleChange = (path: string[], value: any) => {
    const newContent = JSON.parse(JSON.stringify(content))
    let current = newContent
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {}
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
    onUpdate(section.sectionKey, newContent)
  }

  const pageNames: Record<string, string> = {
    'page.programs': '프로그램',
    'page.blog': '블로그',
    'page.notice': '공지사항',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{pageNames[section.sectionKey] || section.sectionName} 헤더</CardTitle>
        <CardDescription>페이지 상단 히어로 섹션을 편집합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>뱃지 텍스트</Label>
          <Input
            value={content.hero?.badge || ''}
            onChange={(e) => handleChange(['hero', 'badge'], e.target.value)}
            placeholder="Programs"
          />
        </div>
        <div>
          <Label>제목</Label>
          <Input
            value={content.hero?.title || ''}
            onChange={(e) => handleChange(['hero', 'title'], e.target.value)}
            placeholder="프로그램"
          />
        </div>
        <div>
          <Label>부제목</Label>
          <Input
            value={content.hero?.subtitle || ''}
            onChange={(e) => handleChange(['hero', 'subtitle'], e.target.value)}
            placeholder="유니피벗과 함께하는 다양한 프로그램을 만나보세요"
          />
        </div>

        <Button onClick={() => onSave(section.sectionKey)} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          저장
        </Button>
      </CardContent>
    </Card>
  )
}
