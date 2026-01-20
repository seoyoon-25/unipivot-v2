'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  RotateCcw,
  BookOpen,
  FileText,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  saveChecklistTemplate,
  loadDefaultTemplate,
  getProgramChecklistTemplate,
  deleteChecklistTemplate,
} from '@/lib/actions/facilitator-checklist'
import type { ChecklistItem, DefaultChecklistType, ChecklistCategory } from '@/types/facilitator'
import { useSession } from 'next-auth/react'

const CATEGORIES = [
  { value: 'preparation', label: '사전 준비', icon: BookOpen },
  { value: 'content', label: '콘텐츠', icon: FileText },
  { value: 'planning', label: '진행 계획', icon: Clock },
  { value: 'materials', label: '자료', icon: MessageSquare },
]

const TEMPLATES: { value: DefaultChecklistType; label: string; description: string }[] = [
  { value: 'simple', label: '간단형', description: '핵심 3개 항목' },
  { value: 'basic', label: '기본형', description: '필수 6개 항목' },
  { value: 'detailed', label: '상세형', description: '10개 항목 + 선택' },
]

export default function FacilitatorChecklistEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const programId = params.id as string

  const [items, setItems] = useState<ChecklistItem[]>([])
  const [isRequired, setIsRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // 기존 템플릿 로드
  useEffect(() => {
    async function loadTemplate() {
      try {
        const template = await getProgramChecklistTemplate(programId)
        if (template) {
          setItems(template.items)
          setIsRequired(template.isRequired)
        }
      } catch (err) {
        console.error('Failed to load template:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTemplate()
  }, [programId])

  // 기본 템플릿 로드
  const handleLoadTemplate = async (type: DefaultChecklistType) => {
    try {
      const templateItems = await loadDefaultTemplate(type)
      setItems(templateItems)
      setSuccess('템플릿을 불러왔습니다.')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError('템플릿을 불러오는데 실패했습니다.')
    }
  }

  // 항목 추가
  const handleAddItem = () => {
    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      text: '',
      category: 'preparation',
      order: items.length + 1,
      optional: false,
    }
    setItems([...items, newItem])
  }

  // 항목 삭제
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    // 순서 재정렬
    setItems(newItems.map((item, i) => ({ ...item, order: i + 1 })))
  }

  // 항목 수정
  const handleUpdateItem = (index: number, updates: Partial<ChecklistItem>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates }
    setItems(newItems)
  }

  // 드래그 앤 드롭
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)

    // 순서 재정렬
    setItems(newItems.map((item, i) => ({ ...item, order: i + 1 })))
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // 저장
  const handleSave = async () => {
    if (!session?.user?.id) {
      setError('로그인이 필요합니다.')
      return
    }

    // 빈 항목 체크
    const emptyItems = items.filter(item => !item.text.trim())
    if (emptyItems.length > 0) {
      setError('모든 항목의 내용을 입력해주세요.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await saveChecklistTemplate(programId, items, isRequired, session.user.id)
      setSuccess('저장되었습니다.')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 초기화
  const handleReset = async () => {
    if (!session?.user?.id) return

    if (!confirm('체크리스트 템플릿을 삭제하시겠습니까?')) return

    try {
      await deleteChecklistTemplate(programId, session.user.id)
      setItems([])
      setIsRequired(false)
      setSuccess('삭제되었습니다.')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">진행자 체크리스트 편집</h1>
          <p className="text-gray-500">진행자가 모임 전에 확인할 체크리스트를 설정합니다</p>
        </div>
      </div>

      {/* 알림 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* 템플릿 선택 */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">기본 템플릿</h2>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.value}
              onClick={() => handleLoadTemplate(template.value)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="font-medium text-gray-900">{template.label}</div>
              <div className="text-sm text-gray-500">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 체크리스트 편집 */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">체크리스트 항목</h2>
          <Button onClick={handleAddItem} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            항목 추가
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>아직 항목이 없습니다.</p>
            <p className="text-sm">위에서 템플릿을 선택하거나 새 항목을 추가하세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex items-center gap-3 p-4 bg-gray-50 rounded-lg border',
                  draggedIndex === index && 'opacity-50 border-blue-500'
                )}
              >
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                  {/* 순서 */}
                  <div className="col-span-1 text-center">
                    <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                  </div>

                  {/* 내용 */}
                  <div className="col-span-5">
                    <Input
                      value={item.text}
                      onChange={(e) => handleUpdateItem(index, { text: e.target.value })}
                      placeholder="체크리스트 항목 내용"
                    />
                  </div>

                  {/* 카테고리 */}
                  <div className="col-span-3">
                    <Select
                      value={item.category}
                      onValueChange={(value) => handleUpdateItem(index, { category: value as ChecklistCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 선택 여부 */}
                  <div className="col-span-2 flex items-center gap-2">
                    <Switch
                      checked={item.optional || false}
                      onCheckedChange={(checked) => handleUpdateItem(index, { optional: checked })}
                    />
                    <span className="text-xs text-gray-500">선택</span>
                  </div>

                  {/* 삭제 */}
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 설정 */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">설정</h2>
        <div className="flex items-center gap-4">
          <Switch
            id="required"
            checked={isRequired}
            onCheckedChange={setIsRequired}
          />
          <Label htmlFor="required" className="flex flex-col">
            <span className="font-medium">필수 완료</span>
            <span className="text-sm text-gray-500">
              진행자가 체크리스트를 모두 완료해야 모임을 진행할 수 있습니다
            </span>
          </Label>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={items.length === 0}
          className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <RotateCcw className="w-4 h-4" />
          초기화
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || items.length === 0}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          저장하기
        </Button>
      </div>
    </div>
  )
}
