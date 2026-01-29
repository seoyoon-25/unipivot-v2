'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  SelectRoot as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TextField, TextAreaField } from './FormField'
import { ImageUploader } from './ImageUploader'
import { Save, Loader2, RotateCcw, Eye, Plus, Trash2, GripVertical, BookOpen, Mic, MapPin, MessageSquare, Users, Lightbulb, Heart, Star, Zap, Globe } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAutoSave } from '@/hooks/use-auto-save'

// Available icons for programs
const AVAILABLE_ICONS = [
  { value: 'BookOpen', label: '책', icon: BookOpen },
  { value: 'Mic', label: '마이크', icon: Mic },
  { value: 'MapPin', label: '지도핀', icon: MapPin },
  { value: 'MessageSquare', label: '대화', icon: MessageSquare },
  { value: 'Users', label: '사람들', icon: Users },
  { value: 'Lightbulb', label: '아이디어', icon: Lightbulb },
  { value: 'Heart', label: '하트', icon: Heart },
  { value: 'Star', label: '별', icon: Star },
  { value: 'Zap', label: '번개', icon: Zap },
  { value: 'Globe', label: '지구', icon: Globe },
]

// Available gradient colors
const AVAILABLE_GRADIENTS = [
  { value: 'from-blue-500 to-indigo-600', label: '블루-인디고', preview: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  { value: 'from-purple-500 to-pink-600', label: '퍼플-핑크', preview: 'bg-gradient-to-br from-purple-500 to-pink-600' },
  { value: 'from-orange-500 to-red-600', label: '오렌지-레드', preview: 'bg-gradient-to-br from-orange-500 to-red-600' },
  { value: 'from-green-500 to-teal-600', label: '그린-틸', preview: 'bg-gradient-to-br from-green-500 to-teal-600' },
  { value: 'from-yellow-500 to-orange-600', label: '옐로우-오렌지', preview: 'bg-gradient-to-br from-yellow-500 to-orange-600' },
  { value: 'from-pink-500 to-rose-600', label: '핑크-로즈', preview: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  { value: 'from-cyan-500 to-blue-600', label: '시안-블루', preview: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
  { value: 'from-emerald-500 to-green-600', label: '에메랄드-그린', preview: 'bg-gradient-to-br from-emerald-500 to-green-600' },
]

// Program types based on existing system
const PROGRAM_TYPES = [
  { value: 'BOOKCLUB', label: '독서모임' },
  { value: 'SEMINAR', label: '세미나' },
  { value: 'KMOVE', label: 'K-move' },
  { value: 'DEBATE', label: '토론' },
  { value: 'WORKSHOP', label: '워크샵' },
  { value: 'OTHER', label: '기타' }
]

interface ProgramItem {
  id: string
  title: string
  description: string
  href: string
  badge: string
  icon: string
  gradient: string
  image?: string
  programType?: string
}

interface ProgramSectionContent {
  title: string
  subtitle?: string
  sectionLabel?: string
  programs: ProgramItem[]
  // Legacy fields
  programTypes?: string[]
  displayCount?: number
}

interface ProgramEditorProps {
  section: {
    id: string
    sectionKey: string
    sectionName: string
    content: ProgramSectionContent
    isVisible: boolean
    order: number
  }
  onUpdate: (sectionKey: string, content: ProgramSectionContent) => void
  onSave: (sectionKey: string) => void
}

const defaultPrograms: ProgramItem[] = [
  {
    id: '1',
    title: '남Book북한걸음',
    description: '책을 통해 남북을 이해하는 독서모임. 매 시즌 8주간 진행되며, 남북 청년들이 함께 책을 읽고 토론합니다.',
    href: '/programs?type=BOOKCLUB',
    badge: '격주 1회 총 8회',
    icon: 'BookOpen',
    gradient: 'from-blue-500 to-indigo-600',
    programType: 'BOOKCLUB'
  },
  {
    id: '2',
    title: '강연 및 세미나',
    description: '분단과 통일, 한반도 평화에 대한 다양한 주제의 전문가 강연과 토론을 진행합니다.',
    href: '/programs?type=SEMINAR',
    badge: '월 1회',
    icon: 'Mic',
    gradient: 'from-purple-500 to-pink-600',
    programType: 'SEMINAR'
  },
  {
    id: '3',
    title: 'K-Move',
    description: '한반도 관련 역사적 장소를 탐방하며 현장에서 배우는 체험 프로그램입니다.',
    href: '/programs?type=KMOVE',
    badge: '분기 1회',
    icon: 'MapPin',
    gradient: 'from-orange-500 to-red-600',
    programType: 'KMOVE'
  },
  {
    id: '4',
    title: '토론회',
    description: '남북한 관련 주제에 대해 다양한 관점으로 토론하며 생각을 나누는 프로그램입니다.',
    href: '/programs?type=DEBATE',
    badge: '월 1회',
    icon: 'MessageSquare',
    gradient: 'from-green-500 to-teal-600',
    programType: 'DEBATE'
  },
]

export const ProgramEditor = React.memo(function ProgramEditor({ section, onUpdate, onSave }: ProgramEditorProps) {
  // Initialize content with defaults if programs array doesn't exist
  const initialContent: ProgramSectionContent = {
    title: section.content.title || '핵심 프로그램',
    subtitle: section.content.subtitle || '남북청년이 함께 성장하고 소통하는 다양한 프로그램을 운영합니다',
    sectionLabel: section.content.sectionLabel || 'Programs',
    programs: section.content.programs || defaultPrograms,
    programTypes: section.content.programTypes,
    displayCount: section.content.displayCount,
  }

  const [content, setContent] = useState<ProgramSectionContent>(initialContent)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)

  // Auto-save hook
  const { isAutoSaving, lastSaved } = useAutoSave({
    key: `${section.sectionKey}-section-${section.id}`,
    value: JSON.stringify(content),
    onSave: async (data) => {
      const parsedContent = JSON.parse(data)
      onUpdate(section.sectionKey, parsedContent)
      await handleSave(false)
    },
    delay: 5000,
    enabled: hasChanges
  })

  // Track changes
  useEffect(() => {
    const currentContent = {
      ...section.content,
      programs: section.content.programs || defaultPrograms
    }
    const hasContentChanged = JSON.stringify(content) !== JSON.stringify(currentContent)
    setHasChanges(hasContentChanged)
  }, [content, section.content])

  const handleSave = async (showToast = true) => {
    try {
      setSaving(true)
      onUpdate(section.sectionKey, content)
      await new Promise(resolve => setTimeout(resolve, 0))
      await onSave(section.sectionKey)
      setHasChanges(false)

      if (showToast) {
        toast({
          title: '성공',
          description: `${section.sectionName} 섹션이 저장되었습니다.`,
        })
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: '오류',
          description: '저장 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setContent(initialContent)
    setHasChanges(false)
    toast({
      title: '초기화',
      description: '변경사항이 초기화되었습니다.',
    })
  }

  const handleContentChange = (field: keyof ProgramSectionContent, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProgramChange = (programId: string, field: keyof ProgramItem, value: any) => {
    setContent(prev => ({
      ...prev,
      programs: prev.programs.map(p =>
        p.id === programId ? { ...p, [field]: value } : p
      )
    }))
  }

  const addProgram = () => {
    const newProgram: ProgramItem = {
      id: Date.now().toString(),
      title: '새 프로그램',
      description: '프로그램 설명을 입력하세요.',
      href: '/programs',
      badge: '일정',
      icon: 'Star',
      gradient: 'from-blue-500 to-indigo-600',
    }
    setContent(prev => ({
      ...prev,
      programs: [...prev.programs, newProgram]
    }))
    setExpandedProgram(newProgram.id)
  }

  const removeProgram = (programId: string) => {
    setContent(prev => ({
      ...prev,
      programs: prev.programs.filter(p => p.id !== programId)
    }))
  }

  const moveProgram = (programId: string, direction: 'up' | 'down') => {
    setContent(prev => {
      const index = prev.programs.findIndex(p => p.id === programId)
      if (index === -1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.programs.length) return prev

      const newPrograms = [...prev.programs]
      const [movedProgram] = newPrograms.splice(index, 1)
      newPrograms.splice(newIndex, 0, movedProgram)

      return { ...prev, programs: newPrograms }
    })
  }

  const getIconComponent = (iconName: string) => {
    const iconConfig = AVAILABLE_ICONS.find(i => i.value === iconName)
    return iconConfig?.icon || Star
  }

  const isRecentProgramsSection = section.sectionKey === 'recent'

  // For recent programs section, show simplified editor
  if (isRecentProgramsSection) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {section.sectionName} 섹션 편집
                  {hasChanges && <Badge variant="outline">변경됨</Badge>}
                </CardTitle>
                <CardDescription>
                  진행중인 프로그램 표시 설정을 관리합니다.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges || saving}>
                  <RotateCcw className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">초기화</span>
                </Button>
                <Button onClick={() => handleSave(true)} disabled={!hasChanges || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Save className="h-4 w-4 sm:mr-2" />}
                  <span className="hidden sm:inline">{saving ? '저장 중' : '저장'}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField
              label="제목"
              value={content.title}
              onChange={(value) => handleContentChange('title', value)}
              placeholder="진행중인 프로그램"
            />
            <TextField
              label="표시 개수"
              type="number"
              value={content.displayCount?.toString() || '6'}
              onChange={(value) => handleContentChange('displayCount', parseInt(value) || 6)}
              placeholder="6"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {section.sectionName} 섹션 편집
                {hasChanges && <Badge variant="outline">변경됨</Badge>}
                {isAutoSaving && (
                  <Badge variant="secondary" className="animate-pulse">
                    자동 저장 중...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                핵심 프로그램 섹션의 제목, 설명, 각 프로그램 카드를 편집합니다.
                {lastSaved && (
                  <span className="text-xs text-muted-foreground block mt-1">
                    마지막 저장: {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges || saving}>
                <RotateCcw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">초기화</span>
              </Button>
              <Button onClick={() => handleSave(true)} disabled={!hasChanges || saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Save className="h-4 w-4 sm:mr-2" />}
                <span className="hidden sm:inline">{saving ? '저장 중' : '저장'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Section Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">섹션 설정</CardTitle>
          <CardDescription>섹션의 제목과 부제목을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextField
            label="섹션 라벨"
            description="섹션 상단에 표시되는 작은 라벨 (예: Programs)"
            value={content.sectionLabel || ''}
            onChange={(value) => handleContentChange('sectionLabel', value)}
            placeholder="Programs"
          />
          <TextField
            label="제목"
            description="섹션의 메인 제목"
            value={content.title}
            onChange={(value) => handleContentChange('title', value)}
            placeholder="핵심 프로그램"
            required
          />
          <TextAreaField
            label="부제목"
            description="제목 아래에 표시되는 설명"
            value={content.subtitle || ''}
            onChange={(value) => handleContentChange('subtitle', value)}
            placeholder="남북청년이 함께 성장하고 소통하는 다양한 프로그램을 운영합니다"
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">프로그램 카드</CardTitle>
              <CardDescription>각 프로그램 카드의 내용을 편집합니다. ({content.programs.length}개)</CardDescription>
            </div>
            <Button onClick={addProgram} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              프로그램 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.programs.map((program, index) => {
              const IconComponent = getIconComponent(program.icon)
              const isExpanded = expandedProgram === program.id

              return (
                <div
                  key={program.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Program Header (Collapsed View) */}
                  <div
                    className="flex items-center gap-3 p-4 bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setExpandedProgram(isExpanded ? null : program.id)}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-sm font-medium w-6">{index + 1}</span>
                    </div>

                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${program.gradient}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{program.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{program.description}</div>
                    </div>

                    {program.badge && (
                      <Badge variant="secondary" className="hidden sm:flex">{program.badge}</Badge>
                    )}

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); moveProgram(program.id, 'up') }}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); moveProgram(program.id, 'down') }}
                        disabled={index === content.programs.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); removeProgram(program.id) }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Program Editor (Expanded View) */}
                  {isExpanded && (
                    <div className="p-4 border-t space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">프로그램 제목</Label>
                            <Input
                              value={program.title}
                              onChange={(e) => handleProgramChange(program.id, 'title', e.target.value)}
                              placeholder="프로그램 제목"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">설명</Label>
                            <Textarea
                              value={program.description}
                              onChange={(e) => handleProgramChange(program.id, 'description', e.target.value)}
                              placeholder="프로그램 설명"
                              rows={3}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">배지 텍스트</Label>
                            <Input
                              value={program.badge}
                              onChange={(e) => handleProgramChange(program.id, 'badge', e.target.value)}
                              placeholder="예: 월 1회, 격주 진행"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">링크 URL</Label>
                            <Input
                              value={program.href}
                              onChange={(e) => handleProgramChange(program.id, 'href', e.target.value)}
                              placeholder="/programs?type=BOOKCLUB"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium">프로그램 타입</Label>
                            <Select
                              value={program.programType || ''}
                              onValueChange={(value) => handleProgramChange(program.id, 'programType', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="타입 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {PROGRAM_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">아이콘</Label>
                            <div className="grid grid-cols-5 gap-2 mt-2">
                              {AVAILABLE_ICONS.map((iconOption) => {
                                const Icon = iconOption.icon
                                return (
                                  <button
                                    key={iconOption.value}
                                    type="button"
                                    onClick={() => handleProgramChange(program.id, 'icon', iconOption.value)}
                                    className={`p-2 rounded-lg border-2 transition-all ${
                                      program.icon === iconOption.value
                                        ? 'border-primary bg-primary/10'
                                        : 'border-transparent hover:border-muted-foreground/30'
                                    }`}
                                    title={iconOption.label}
                                  >
                                    <Icon className="h-5 w-5 mx-auto" />
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">그라데이션 색상</Label>
                            <div className="grid grid-cols-4 gap-2 mt-2">
                              {AVAILABLE_GRADIENTS.map((gradient) => (
                                <button
                                  key={gradient.value}
                                  type="button"
                                  onClick={() => handleProgramChange(program.id, 'gradient', gradient.value)}
                                  className={`h-10 rounded-lg ${gradient.preview} border-2 transition-all ${
                                    program.gradient === gradient.value
                                      ? 'border-foreground ring-2 ring-primary'
                                      : 'border-transparent hover:border-foreground/30'
                                  }`}
                                  title={gradient.label}
                                />
                              ))}
                            </div>
                          </div>

                          <ImageUploader
                            label="프로그램 이미지 (선택사항)"
                            description="이미지를 업로드하면 그라데이션 대신 표시됩니다"
                            value={program.image || ''}
                            onChange={(value) => handleProgramChange(program.id, 'image', value)}
                            aspectRatio="video"
                            maxSizeMB={5}
                          />

                          {/* Preview */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">미리보기</Label>
                            <div className="border rounded-lg overflow-hidden max-w-xs">
                              <div className={`relative h-32 overflow-hidden ${program.image ? '' : `bg-gradient-to-br ${program.gradient}`}`}>
                                {program.image ? (
                                  <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <IconComponent className="w-12 h-12 text-white/30" strokeWidth={1} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                {program.badge && (
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                                    {program.badge}
                                  </span>
                                )}
                              </div>
                              <div className="p-3">
                                <h3 className="font-bold text-sm">{program.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{program.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {content.programs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                프로그램이 없습니다. 위의 버튼을 클릭하여 프로그램을 추가하세요.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">전체 미리보기</CardTitle>
          <CardDescription>섹션이 실제로 표시되는 모습입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="text-center mb-8">
              {content.sectionLabel && (
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                  {content.sectionLabel}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-3">
                {content.title || '제목을 입력하세요'}
              </h2>
              {content.subtitle && (
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {content.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {content.programs.map((program) => {
                const IconComponent = getIconComponent(program.icon)
                return (
                  <div key={program.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <div className={`relative h-32 overflow-hidden ${program.image ? '' : `bg-gradient-to-br ${program.gradient}`}`}>
                      {program.image ? (
                        <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <IconComponent className="w-12 h-12 text-white/30" strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {program.badge && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                          {program.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">{program.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{program.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
