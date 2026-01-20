'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Loader2, GripVertical, Save, ArrowUp, ArrowDown, RotateCcw, ArrowLeft, Trash2, Undo2, ArrowUpDown, Pencil, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Program {
  id: string
  title: string
  slug: string
  type: string
  status: string
  displayOrder: number
  createdAt: string
  image: string | null
  thumbnailSquare: string | null
}

const TYPE_LABELS: Record<string, string> = {
  BOOKCLUB: '독서모임',
  WORKSHOP: '워크숍',
  SEMINAR: '세미나',
  LECTURE: '강연',
  NETWORKING: '네트워킹',
  OTHER: '기타',
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: '임시저장', variant: 'secondary' },
  RECRUITING: { label: '모집중', variant: 'default' },
  RECRUIT_CLOSED: { label: '모집마감', variant: 'outline' },
  ONGOING: { label: '진행중', variant: 'default' },
  COMPLETED: { label: '완료', variant: 'secondary' },
  CANCELLED: { label: '취소', variant: 'destructive' },
}

interface ProgramEdit {
  title?: string
  status?: string
  type?: string
}

interface SortableItemProps {
  program: Program
  visibleIndex: number
  visiblePrograms: Program[]
  isMarkedForDelete: boolean
  onMoveToPosition: (fromIdx: number, toIdx: number) => void
  onMoveProgram: (index: number, direction: 'up' | 'down') => void
  onMarkForDelete: (id: string) => void
  onUnmarkForDelete: (id: string) => void
  programs: Program[]
  pendingEdit?: ProgramEdit
  onFieldChange: (programId: string, field: keyof ProgramEdit, value: string) => void
}

function SortableItem({
  program,
  visibleIndex,
  visiblePrograms,
  isMarkedForDelete,
  onMoveToPosition,
  onMoveProgram,
  onMarkForDelete,
  onUnmarkForDelete,
  programs,
  pendingEdit,
  onFieldChange,
}: SortableItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(program.title)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: program.id, disabled: isMarkedForDelete })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const currentTitle = pendingEdit?.title ?? program.title
  const currentType = pendingEdit?.type ?? program.type
  const currentStatus = pendingEdit?.status ?? program.status

  const handleTitleSave = () => {
    if (titleInput.trim() && titleInput !== program.title) {
      onFieldChange(program.id, 'title', titleInput.trim())
    }
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTitleInput(pendingEdit?.title ?? program.title)
    setIsEditingTitle(false)
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${
        isDragging
          ? 'opacity-50 shadow-lg z-50'
          : isMarkedForDelete
          ? 'border-red-300 bg-red-50/50 opacity-60'
          : pendingEdit
          ? 'border-blue-300 bg-blue-50/30'
          : 'hover:shadow-md'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle & Order Number */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <button
              {...attributes}
              {...listeners}
              className={`touch-none ${isMarkedForDelete ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
              disabled={isMarkedForDelete}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            {isMarkedForDelete ? (
              <span className="w-16 text-center font-mono text-sm text-red-500 line-through">
                삭제
              </span>
            ) : (
              <Select
                value={String(visibleIndex + 1)}
                onValueChange={(val) => {
                  const fromIdx = programs.findIndex(p => p.id === program.id)
                  const targetVisibleIdx = parseInt(val) - 1
                  const targetProgram = visiblePrograms[targetVisibleIdx]
                  const toIdx = programs.findIndex(p => p.id === targetProgram?.id)
                  if (toIdx !== -1) {
                    onMoveToPosition(fromIdx, toIdx)
                  }
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue>{visibleIndex + 1}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {visiblePrograms.map((_, i) => (
                    <SelectItem key={i} value={String(i + 1)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Thumbnail */}
          <div className={`w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ${isMarkedForDelete ? 'grayscale' : ''}`}>
            {program.thumbnailSquare || program.image ? (
              <Image
                src={program.thumbnailSquare || program.image || ''}
                alt={program.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>

          {/* Program Info */}
          <div className={`flex-1 min-w-0 ${isMarkedForDelete ? 'line-through text-muted-foreground' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              {/* Type Select */}
              <Select
                value={currentType}
                onValueChange={(val) => onFieldChange(program.id, 'type', val)}
                disabled={isMarkedForDelete}
              >
                <SelectTrigger className="h-6 w-auto px-2 text-xs">
                  <Badge variant="outline" className="pointer-events-none">
                    {TYPE_LABELS[currentType] || currentType}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Select */}
              <Select
                value={currentStatus}
                onValueChange={(val) => onFieldChange(program.id, 'status', val)}
                disabled={isMarkedForDelete}
              >
                <SelectTrigger className="h-6 w-auto px-2 text-xs">
                  <Badge variant={STATUS_LABELS[currentStatus]?.variant || 'secondary'} className="pointer-events-none">
                    {STATUS_LABELS[currentStatus]?.label || currentStatus}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Editable Title */}
            {isEditingTitle && !isMarkedForDelete ? (
              <div className="flex items-center gap-1">
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave()
                    if (e.key === 'Escape') handleTitleCancel()
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-green-600"
                  onClick={handleTitleSave}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500"
                  onClick={handleTitleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex items-center gap-1 group cursor-pointer"
                onClick={() => {
                  if (!isMarkedForDelete) {
                    setTitleInput(currentTitle)
                    setIsEditingTitle(true)
                  }
                }}
              >
                <h3 className="font-medium truncate">{currentTitle}</h3>
                {!isMarkedForDelete && (
                  <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(program.createdAt).toLocaleDateString('ko-KR')} 생성
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isMarkedForDelete ? (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => onUnmarkForDelete(program.id)}
              >
                <Undo2 className="h-4 w-4 mr-1" />
                취소
              </Button>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const fromIdx = programs.findIndex(p => p.id === program.id)
                      onMoveProgram(fromIdx, 'up')
                    }}
                    disabled={visibleIndex === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const fromIdx = programs.findIndex(p => p.id === program.id)
                      onMoveProgram(fromIdx, 'down')
                    }}
                    disabled={visibleIndex === visiblePrograms.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onMarkForDelete(program.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProgramOrderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reversing, setReversing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalPrograms, setOriginalPrograms] = useState<Program[]>([])
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set())
  const [pendingEdits, setPendingEdits] = useState<Map<string, ProgramEdit>>(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      router.push('/admin')
    }
  }, [session, status, router])

  // Fetch programs
  useEffect(() => {
    fetchPrograms()
  }, [selectedType])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const params = selectedType !== 'all' ? `?type=${selectedType}` : ''
      const response = await fetch(`/api/admin/programs/reorder${params}`)
      if (!response.ok) throw new Error('Failed to fetch programs')

      const data = await response.json()
      setPrograms(data.programs)
      setOriginalPrograms(data.programs)
      setTypes(data.types)
      setHasChanges(false)
      setPendingDeletes(new Set())
      setPendingEdits(new Map())
    } catch (error) {
      console.error('Error fetching programs:', error)
      toast({
        title: '오류',
        description: '프로그램 목록을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = programs.findIndex(p => p.id === active.id)
      const newIndex = programs.findIndex(p => p.id === over.id)

      setPrograms(arrayMove(programs, oldIndex, newIndex))
      setHasChanges(true)
    }
  }

  const moveProgram = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= programs.length) return

    const newPrograms = [...programs]
    const temp = newPrograms[index]
    newPrograms[index] = newPrograms[newIndex]
    newPrograms[newIndex] = temp

    setPrograms(newPrograms)
    setHasChanges(true)
  }

  const moveToPosition = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const newPrograms = [...programs]
    const [removed] = newPrograms.splice(fromIndex, 1)
    newPrograms.splice(toIndex, 0, removed)

    setPrograms(newPrograms)
    setHasChanges(true)
  }

  const markForDelete = (programId: string) => {
    setPendingDeletes(prev => {
      const next = new Set(prev)
      next.add(programId)
      return next
    })
    setHasChanges(true)
  }

  const unmarkForDelete = (programId: string) => {
    setPendingDeletes(prev => {
      const next = new Set(prev)
      next.delete(programId)
      return next
    })
    const stillHasOrderChanges = JSON.stringify(programs.map(p => p.id)) !== JSON.stringify(originalPrograms.map(p => p.id))
    const stillHasEdits = pendingEdits.size > 0
    if (!stillHasOrderChanges && !stillHasEdits && pendingDeletes.size <= 1) {
      setHasChanges(false)
    }
  }

  const resetChanges = () => {
    setPrograms(originalPrograms)
    setPendingDeletes(new Set())
    setPendingEdits(new Map())
    setHasChanges(false)
  }

  const handleFieldChange = (programId: string, field: keyof ProgramEdit, value: string) => {
    setPendingEdits(prev => {
      const next = new Map(prev)
      const current = next.get(programId) || {}
      next.set(programId, { ...current, [field]: value })
      return next
    })
    setHasChanges(true)
  }

  const reverseOrder = async () => {
    try {
      setReversing(true)
      const response = await fetch('/api/admin/programs/reorder/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType !== 'all' ? selectedType : undefined
        })
      })

      if (!response.ok) throw new Error('Failed to reverse order')

      const data = await response.json()
      toast({
        title: '성공',
        description: data.message,
      })

      await fetchPrograms()
    } catch (error) {
      console.error('Error reversing order:', error)
      toast({
        title: '오류',
        description: '순서 뒤집기 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setReversing(false)
    }
  }

  const saveChanges = async () => {
    try {
      setSaving(true)

      const deleteErrors: string[] = []
      const successfulDeletes: string[] = []
      const deleteIds = Array.from(pendingDeletes)

      for (const id of deleteIds) {
        const program = programs.find(p => p.id === id)
        try {
          const response = await fetch(`/api/admin/programs/${id}`, {
            method: 'DELETE'
          })
          if (!response.ok) {
            const data = await response.json()
            deleteErrors.push(`${program?.title || id}: ${data.error}`)
          } else {
            successfulDeletes.push(id)
          }
        } catch (error) {
          deleteErrors.push(`${program?.title || id}: 삭제 실패`)
        }
      }

      // 에러 토스트 표시
      if (deleteErrors.length > 0) {
        toast({
          title: deleteErrors.length === deleteIds.length ? '삭제 실패' : '일부 삭제 실패',
          description: deleteErrors.join('\n'),
          variant: 'destructive',
        })
      }

      // 모든 삭제 실패 시 pendingDeletes 초기화하고 중단
      if (successfulDeletes.length === 0 && deleteIds.length > 0) {
        setPendingDeletes(new Set())
        setSaving(false)
        return
      }

      // 성공적으로 삭제된 프로그램만 제외하고 순서 저장
      const successfulDeleteSet = new Set(successfulDeletes)
      const remainingPrograms = programs.filter(p => !successfulDeleteSet.has(p.id))

      if (remainingPrograms.length > 0) {
        // pendingEdits를 객체로 변환
        const edits: { [id: string]: ProgramEdit } = {}
        pendingEdits.forEach((edit, id) => {
          if (!successfulDeleteSet.has(id)) {
            edits[id] = edit
          }
        })

        const response = await fetch('/api/admin/programs/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programIds: remainingPrograms.map(p => p.id),
            type: selectedType !== 'all' ? selectedType : undefined,
            edits: Object.keys(edits).length > 0 ? edits : undefined
          })
        })

        if (!response.ok) throw new Error('Failed to save order')
      }

      toast({
        title: '성공',
        description: `변경사항이 저장되었습니다.${successfulDeletes.length > 0 ? ` (${successfulDeletes.length}개 삭제됨)` : ''}`,
      })

      await fetchPrograms()
    } catch (error) {
      console.error('Error saving changes:', error)
      toast({
        title: '오류',
        description: '변경사항 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const filteredPrograms = selectedType === 'all'
    ? programs
    : programs.filter(p => p.type === selectedType)

  const visiblePrograms = filteredPrograms.filter(p => !pendingDeletes.has(p.id))
  const deletedCount = pendingDeletes.size

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/programs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              프로그램 목록
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold">프로그램 순서 관리</h1>
        <p className="text-muted-foreground">
          프로그램의 표시 순서를 변경하고 삭제합니다. 변경 후 저장 버튼을 눌러야 적용됩니다.
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="프로그램 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TYPE_LABELS[type] || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {visiblePrograms.length}개 프로그램
              </Badge>
              {deletedCount > 0 && (
                <Badge variant="destructive">
                  {deletedCount}개 삭제 예정
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={reversing || hasChanges}
                  >
                    {reversing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                    )}
                    순서 뒤집기
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>순서 뒤집기</AlertDialogTitle>
                    <AlertDialogDescription>
                      {selectedType !== 'all'
                        ? `${TYPE_LABELS[selectedType] || selectedType} 프로그램의 순서를 완전히 뒤집습니다.`
                        : '모든 프로그램의 순서를 완전히 뒤집습니다.'}
                      <br />
                      현재 1번이 마지막으로, 마지막이 1번으로 변경됩니다.
                      <br /><br />
                      이 작업은 즉시 저장됩니다. 계속하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={reverseOrder}>
                      뒤집기
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                onClick={resetChanges}
                disabled={!hasChanges}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                초기화
              </Button>
              <Button
                onClick={saveChanges}
                disabled={!hasChanges || saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                변경사항 저장
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Program List with Drag and Drop */}
      <div className="space-y-2">
        {filteredPrograms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              등록된 프로그램이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredPrograms.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredPrograms.map((program) => {
                const isMarkedForDelete = pendingDeletes.has(program.id)
                const visibleIndex = visiblePrograms.findIndex(p => p.id === program.id)

                return (
                  <SortableItem
                    key={program.id}
                    program={program}
                    visibleIndex={visibleIndex}
                    visiblePrograms={visiblePrograms}
                    isMarkedForDelete={isMarkedForDelete}
                    onMoveToPosition={moveToPosition}
                    onMoveProgram={moveProgram}
                    onMarkForDelete={markForDelete}
                    onUnmarkForDelete={unmarkForDelete}
                    programs={programs}
                    pendingEdit={pendingEdits.get(program.id)}
                    onFieldChange={handleFieldChange}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Help Text */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">사용 방법</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>드래그 앤 드롭:</strong> 점 6개 아이콘을 클릭한 채로 끌어서 순서를 변경할 수 있습니다.</p>
          <p>• 순서 번호를 클릭하여 원하는 위치로 바로 이동할 수 있습니다.</p>
          <p>• 화살표 버튼으로 한 단계씩 순서를 변경할 수 있습니다.</p>
          <p>• <strong>인라인 수정:</strong> 제목을 클릭하여 직접 수정할 수 있습니다. 타입과 상태 배지를 클릭하여 변경할 수 있습니다.</p>
          <p>• <strong>순서 뒤집기:</strong> 전체 순서를 한 번에 역순으로 변경할 수 있습니다.</p>
          <p>• 휴지통 버튼을 클릭하면 삭제 예정으로 표시됩니다.</p>
          <p>• 모든 변경사항은 &quot;변경사항 저장&quot; 버튼을 클릭해야 적용됩니다.</p>
          <p>• 신청자가 있는 프로그램은 삭제할 수 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  )
}
