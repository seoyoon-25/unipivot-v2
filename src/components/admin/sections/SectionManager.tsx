'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Save,
  RotateCcw,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'

interface SiteSection {
  id: string
  sectionKey: string
  sectionName: string
  content: any
  isVisible: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface SectionManagerProps {
  sections: SiteSection[]
  onReorder: (sectionKeys: string[]) => Promise<void>
  onToggleVisibility: (sectionKey: string, isVisible: boolean) => Promise<void>
  className?: string
}

export const SectionManager = React.memo(function SectionManager({
  sections = [],
  onReorder,
  onToggleVisibility,
  className
}: SectionManagerProps) {
  const [localSections, setLocalSections] = useState(sections || [])
  const [reordering, setReordering] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Update local state when props change
  React.useEffect(() => {
    setLocalSections(sections || [])
    setHasChanges(false)
  }, [sections])

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...localSections]
    const [movedSection] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, movedSection)

    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1
    }))

    setLocalSections(updatedSections)
    setHasChanges(true)
  }

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      moveSection(index, index - 1)
    }
  }

  const moveSectionDown = (index: number) => {
    if (index < localSections.length - 1) {
      moveSection(index, index + 1)
    }
  }

  const handleSaveOrder = async () => {
    try {
      setReordering(true)
      const sectionKeys = localSections.map(section => section.sectionKey)
      await onReorder(sectionKeys)
      setHasChanges(false)
      toast({
        title: '성공',
        description: '섹션 순서가 저장되었습니다.',
      })
    } catch (error) {
      toast({
        title: '오류',
        description: '순서 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setReordering(false)
    }
  }

  const handleResetOrder = () => {
    setLocalSections(sections)
    setHasChanges(false)
    toast({
      title: '초기화',
      description: '변경사항이 초기화되었습니다.',
    })
  }

  const toggleAllVisibility = async (visible: boolean) => {
    try {
      await Promise.all(
        (sections || []).map(section =>
          onToggleVisibility(section.sectionKey, visible)
        )
      )
      toast({
        title: '성공',
        description: `모든 섹션이 ${visible ? '표시' : '숨김'}로 설정되었습니다.`,
      })
    } catch (error) {
      toast({
        title: '오류',
        description: '일괄 설정 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const visibleCount = sections.filter(s => s.isVisible).length
  const totalCount = sections.length

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">섹션 관리</CardTitle>
            <CardDescription>
              섹션의 순서와 표시 설정을 관리합니다.
              ({visibleCount}/{totalCount}개 표시 중)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleAllVisibility(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  모두 표시
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleAllVisibility(false)}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  모두 숨김
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetOrder}
                  disabled={reordering}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  초기화
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveOrder}
                  disabled={reordering}
                >
                  {reordering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      저장 중
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      순서 저장
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {localSections.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
            >
              {/* Drag Handle */}
              <div className="flex items-center cursor-move text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Order Number */}
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                {section.order}
              </div>

              {/* Section Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{section.sectionName}</span>
                  <Badge variant="outline" className="text-xs">
                    {section.sectionKey}
                  </Badge>
                  {!section.isVisible && (
                    <Badge variant="secondary" className="text-xs">
                      숨김
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  마지막 수정: {new Date(section.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Visibility Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={section.isVisible}
                    onCheckedChange={(checked) =>
                      onToggleVisibility(section.sectionKey, checked)
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {section.isVisible ? '표시' : '숨김'}
                  </span>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Move Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSectionUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSectionDown(index)}
                    disabled={index === localSections.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 dark:text-blue-300">
                순서가 변경되었습니다. 저장하시겠습니까?
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetOrder}
                  className="text-blue-600 hover:text-blue-700"
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveOrder}
                  disabled={reordering}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})