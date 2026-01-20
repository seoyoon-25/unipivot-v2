'use client'

import { useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
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
import { Plus, ArrowLeft, FileText, Save, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuestionEditor } from '@/components/survey/QuestionEditor'
import {
  SurveyQuestion,
  SurveyTemplate,
  SURVEY_CATEGORIES,
  createDefaultQuestion,
  parseTemplateQuestions,
} from '@/types/survey'
import {
  getSurveyTemplates,
  createSurveyFromTemplate,
  publishSurvey,
} from '@/lib/actions/survey'
import { useToast } from '@/hooks/use-toast'

interface SortableQuestionProps {
  question: SurveyQuestion
  onChange: (question: SurveyQuestion) => void
  onDelete: () => void
}

function SortableQuestion({ question, onChange, onDelete }: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditor
        question={question}
        onChange={onChange}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

interface PageProps {
  params: Promise<{ programId: string }>
}

export default function CreateSurveyPage({ params }: PageProps) {
  const { programId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [templates, setTemplates] = useState<SurveyTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [surveyType, setSurveyType] = useState<'session' | 'program'>('program')
  const [deadline, setDeadline] = useState('')
  const [includeRefund, setIncludeRefund] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderDays, setReminderDays] = useState<number[]>([3, 1])

  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load templates on mount
  useState(() => {
    const loadTemplates = async () => {
      try {
        const data = await getSurveyTemplates()
        setTemplates(data as SurveyTemplate[])
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setIsLoadingTemplates(false)
      }
    }
    loadTemplates()
  })

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setQuestions(template.questions.questions)
      if (template.questions.settings?.includeRefund) {
        setIncludeRefund(true)
        setSurveyType('program')
      }
    }
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = questions.findIndex((q) => q.id === active.id)
        const newIndex = questions.findIndex((q) => q.id === over.id)

        const reorderedQuestions = arrayMove(questions, oldIndex, newIndex).map(
          (question, index) => ({
            ...question,
            order: index + 1,
          })
        )

        setQuestions(reorderedQuestions)
      }
    },
    [questions]
  )

  const handleQuestionChange = (index: number, updatedQuestion: SurveyQuestion) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? updatedQuestion : q))
    )
  }

  const handleQuestionDelete = (index: number) => {
    setQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i + 1 }))
    )
  }

  const handleAddQuestion = () => {
    const newQuestion = createDefaultQuestion(questions.length + 1)
    setQuestions((prev) => [...prev, newQuestion])
  }

  const validateForm = () => {
    if (!title.trim()) {
      toast({ title: '오류', description: '제목을 입력해주세요', variant: 'destructive' })
      return false
    }
    if (!deadline) {
      toast({ title: '오류', description: '마감일을 선택해주세요', variant: 'destructive' })
      return false
    }
    if (questions.length === 0) {
      toast({ title: '오류', description: '최소 1개 이상의 질문이 필요합니다', variant: 'destructive' })
      return false
    }
    const emptyQuestions = questions.filter((q) => !q.text.trim())
    if (emptyQuestions.length > 0) {
      toast({ title: '오류', description: '모든 질문에 내용을 입력해주세요', variant: 'destructive' })
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await createSurveyFromTemplate({
        programId,
        templateId: selectedTemplateId || undefined,
        title,
        description,
        deadline: new Date(deadline),
        surveyType,
        customQuestions: questions,
        includeRefund,
        reminderEnabled,
        reminderDays,
      })

      toast({ title: '성공', description: '조사가 저장되었습니다' })
      router.push(`/admin/programs/${programId}`)
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '저장에 실패했습니다',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!validateForm()) return

    setIsPublishing(true)
    try {
      const survey = await createSurveyFromTemplate({
        programId,
        templateId: selectedTemplateId || undefined,
        title,
        description,
        deadline: new Date(deadline),
        surveyType,
        customQuestions: questions,
        includeRefund,
        reminderEnabled,
        reminderDays,
      })

      await publishSurvey(survey.id)

      toast({ title: '성공', description: '조사가 발송되었습니다' })
      router.push(`/admin/programs/${programId}`)
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '발송에 실패했습니다',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로
          </Button>
          <h1 className="text-2xl font-bold">만족도 조사 만들기</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              템플릿 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <button
                  onClick={() => {
                    setSelectedTemplateId('')
                    setQuestions([createDefaultQuestion(1)])
                  }}
                  className={`rounded-lg border-2 p-4 text-center transition-colors ${
                    selectedTemplateId === ''
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2 text-2xl">📝</div>
                  <div className="font-medium">빈 템플릿</div>
                  <div className="mt-1 text-xs text-gray-500">처음부터 만들기</div>
                </button>

                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`rounded-lg border-2 p-4 text-center transition-colors ${
                      selectedTemplateId === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mb-2 text-2xl">
                      {template.category === 'reading_session' && '📖'}
                      {template.category === 'reading_program' && '📚'}
                      {template.category === 'lecture' && '🎤'}
                      {template.category === 'workshop' && '🛠️'}
                    </div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {template.questions.questions.length}개 질문
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>조사 제목 *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 1회차 만족도 조사"
              />
            </div>

            <div className="space-y-2">
              <Label>설명 (선택)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="조사에 대한 간단한 설명"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>조사 유형</Label>
                <Select
                  value={surveyType}
                  onValueChange={(v) => setSurveyType(v as 'session' | 'program')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">회차별 조사</SelectItem>
                    <SelectItem value="program">시즌 종료 조사</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>마감일 *</Label>
                <Input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            {surveyType === 'program' && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <Switch
                  id="includeRefund"
                  checked={includeRefund}
                  onCheckedChange={setIncludeRefund}
                />
                <Label htmlFor="includeRefund" className="flex-1">
                  <div className="font-medium">보증금 환급 정보 포함</div>
                  <div className="text-sm text-gray-500">
                    참가자의 환급 계좌 정보를 함께 수집합니다
                  </div>
                </Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>질문 편집</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                템플릿을 선택하거나 질문을 추가해주세요
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <SortableQuestion
                        key={question.id}
                        question={question}
                        onChange={(q) => handleQuestionChange(index, q)}
                        onDelete={() => handleQuestionDelete(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={handleAddQuestion}
            >
              <Plus className="mr-2 h-4 w-4" />
              질문 추가
            </Button>
          </CardContent>
        </Card>

        {/* Reminder Settings */}
        <Card>
          <CardHeader>
            <CardTitle>리마인더 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                id="reminderEnabled"
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
              <Label htmlFor="reminderEnabled">리마인더 자동 발송</Label>
            </div>

            {reminderEnabled && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">발송 시점</Label>
                <div className="flex gap-2">
                  {[3, 2, 1].map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        if (reminderDays.includes(day)) {
                          setReminderDays(reminderDays.filter((d) => d !== day))
                        } else {
                          setReminderDays([...reminderDays, day].sort((a, b) => b - a))
                        }
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm ${
                        reminderDays.includes(day)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      마감 {day}일 전
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving || isPublishing}
          >
            취소
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || isPublishing}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            임시저장
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSaving || isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            생성 및 발송
          </Button>
        </div>
      </div>
    </div>
  )
}
