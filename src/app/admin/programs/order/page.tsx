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
import { Loader2, GripVertical, Save, ArrowUp, ArrowDown, RotateCcw, ArrowLeft, Trash2, Undo2 } from 'lucide-react'
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
}: SortableItemProps) {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${
        isDragging
          ? 'opacity-50 shadow-lg z-50'
          : isMarkedForDelete
          ? 'border-red-300 bg-red-50/50 opacity-60'
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
              <Badge variant="outline">
                {TYPE_LABELS[program.type] || program.type}
              </Badge>
              <Badge variant={STATUS_LABELS[program.status]?.variant || 'secondary'}>
                {STATUS_LABELS[program.status]?.label || program.status}
              </Badge>
            </div>
            <h3 className="font-medium truncate">{program.title}</h3>
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
  const [hasChanges, setHasChanges] = useState(false)
  const [originalPrograms, setOriginalPrograms] = useState<Program[]>([])
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set())

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
    if (!stillHasOrderChanges && pendingDeletes.size <= 1) {
      setHasChanges(false)
    }
  }

  const resetChanges = () => {
    setPrograms(originalPrograms)
    setPendingDeletes(new Set())
    setHasChanges(false)
  }

  const saveChanges = async () => {
    try {
      setSaving(true)

      const deleteErrors: string[] = []
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
          }
        } catch (error) {
          deleteErrors.push(`${program?.title || id}: 삭제 실패`)
        }
      }

      if (deleteErrors.length > 0) {
        toast({
          title: '일부 삭제 실패',
          description: deleteErrors.join('\n'),
          variant: 'destructive',
        })
      }

      const remainingPrograms = programs.filter(p => !pendingDeletes.has(p.id))
      if (remainingPrograms.length > 0) {
        const response = await fetch('/api/admin/programs/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programIds: remainingPrograms.map(p => p.id),
            type: selectedType !== 'all' ? selectedType : undefined
          })
        })

        if (!response.ok) throw new Error('Failed to save order')
      }

      toast({
        title: '성공',
        description: `변경사항이 저장되었습니다.${pendingDeletes.size > 0 ? ` (${pendingDeletes.size - deleteErrors.length}개 삭제됨)` : ''}`,
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
          <p>• 휴지통 버튼을 클릭하면 삭제 예정으로 표시됩니다.</p>
          <p>• 모든 변경사항은 &quot;변경사항 저장&quot; 버튼을 클릭해야 적용됩니다.</p>
          <p>• 신청자가 있는 프로그램은 삭제할 수 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  )
}
