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
import { Loader2, GripVertical, Save, ArrowUp, ArrowDown, RotateCcw, ArrowLeft, Trash2 } from 'lucide-react'

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

export default function ProgramOrderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalOrder, setOriginalOrder] = useState<string[]>([])

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
      setTypes(data.types)
      setOriginalOrder(data.programs.map((p: Program) => p.id))
      setHasChanges(false)
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

  const resetOrder = () => {
    fetchPrograms()
    setHasChanges(false)
  }

  const saveOrder = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/programs/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programIds: programs.map(p => p.id),
          type: selectedType !== 'all' ? selectedType : undefined
        })
      })

      if (!response.ok) throw new Error('Failed to save order')

      const data = await response.json()
      toast({
        title: '성공',
        description: data.message,
      })

      setOriginalOrder(programs.map(p => p.id))
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving order:', error)
      toast({
        title: '오류',
        description: '순서 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (programId: string, programTitle: string) => {
    if (!confirm(`"${programTitle}" 프로그램을 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      setDeleting(programId)
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '삭제 실패')
      }

      // 목록에서 제거
      setPrograms(prev => prev.filter(p => p.id !== programId))

      toast({
        title: '성공',
        description: `"${programTitle}" 프로그램이 삭제되었습니다.`,
      })
    } catch (error: any) {
      console.error('Error deleting program:', error)
      toast({
        title: '삭제 실패',
        description: error.message || '프로그램 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
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
          프로그램의 표시 순서를 변경합니다. 낮은 순서가 먼저 표시됩니다.
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
                {filteredPrograms.length}개 프로그램
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={resetOrder}
                disabled={!hasChanges}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                초기화
              </Button>
              <Button
                onClick={saveOrder}
                disabled={!hasChanges || saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                순서 저장
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Program List */}
      <div className="space-y-2">
        {filteredPrograms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              등록된 프로그램이 없습니다.
            </CardContent>
          </Card>
        ) : (
          filteredPrograms.map((program, index) => (
            <Card key={program.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Drag Handle & Order */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                    <span className="w-8 text-center font-mono text-sm">
                      {index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
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

                  {/* Move Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveProgram(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveProgram(index, 'down')}
                        disabled={index === filteredPrograms.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(program.id, program.title)}
                      disabled={deleting === program.id}
                    >
                      {deleting === program.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Help Text */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">사용 방법</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• 화살표 버튼을 클릭하여 프로그램 순서를 변경합니다.</p>
          <p>• 유형별로 필터링하여 해당 유형의 프로그램만 순서를 변경할 수 있습니다.</p>
          <p>• 변경 후 &quot;순서 저장&quot; 버튼을 클릭해야 변경사항이 적용됩니다.</p>
          <p>• 순서가 낮은 프로그램이 목록에서 먼저 표시됩니다.</p>
          <p>• 휴지통 버튼으로 프로그램을 삭제할 수 있습니다. (신청자가 있는 프로그램은 삭제 불가)</p>
        </CardContent>
      </Card>
    </div>
  )
}
