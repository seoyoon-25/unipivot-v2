'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Loader2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { ReportForm } from '@/components/reports/ReportForm'

interface TemplateSection {
  id: string
  emoji: string
  label: string
  description?: string
  type: 'textarea' | 'text' | 'rating' | 'list' | 'qa_list'
  placeholder?: string
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  minValue?: number
  maxValue?: number
  required: boolean
  estimatedMinutes?: number
  guide?: string
  itemType?: string
  fields?: Array<{
    id: string
    label: string
    type: string
    placeholder?: string
    minLength?: number
    maxLength?: number
    required: boolean
  }>
}

interface Template {
  id: string
  name: string
  code: string
  description: string | null
  icon: string | null
  estimatedMinutes: number
  fields: string | null
  structure: string
}

interface SessionReport {
  id: string
  content: string
  status: string
  submittedAt: string | null
}

interface SessionInfo {
  id: string
  title: string | null
  sessionNo: number
  bookTitle: string | null
  bookRange: string | null
  date: string
  program: {
    id: string
    title: string
  }
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ programId: string; sessionId: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [existingReport, setExistingReport] = useState<SessionReport | null>(null)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [programId, setProgramId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params
      setProgramId(resolvedParams.programId)
      setSessionId(resolvedParams.sessionId)
      await loadData(resolvedParams.programId, resolvedParams.sessionId)
    }
    init()
  }, [params])

  const loadData = async (pId: string, sId: string) => {
    try {
      setLoading(true)

      // 세션 정보, 템플릿, 기존 독후감 로드
      const [sessionRes, templatesRes, reportRes] = await Promise.all([
        fetch(`/api/reports/session?sessionId=${sId}`),
        fetch('/api/reports/templates'),
        fetch(`/api/reports?sessionId=${sId}`),
      ])

      if (!sessionRes.ok) {
        throw new Error('세션 정보를 불러올 수 없습니다.')
      }

      const sessionData = await sessionRes.json()
      setSession(sessionData)

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData)

        // 기본 템플릿 선택
        const defaultTemplate = templatesData.find((t: Template) => t.code === 'BONGAE')
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate)
        }
      }

      if (reportRes.ok) {
        const reportData = await reportRes.json()
        if (reportData) {
          setExistingReport(reportData)
          // 기존 독후감의 템플릿 선택
          if (reportData.templateId) {
            const usedTemplate = templates.find((t: Template) => t.id === reportData.templateId)
            if (usedTemplate) {
              setSelectedTemplate(usedTemplate)
            }
          }
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error)
      toast({ title: '데이터를 불러오는데 실패했습니다.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const parseTemplateFields = (template: Template): TemplateSection[] => {
    try {
      const parsed = JSON.parse(template.fields || template.structure)
      return parsed.sections || []
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-gray-500">세션 정보를 찾을 수 없습니다.</p>
          <Link href={`/mypage/programs/${programId}`}>
            <Button variant="outline" className="mt-4">
              돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* 헤더 */}
      <div className="mb-8">
        <Link href={`/mypage/programs/${programId}/sessions/${sessionId}`}>
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </Link>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{session.program.title}</p>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.title || `${session.sessionNo}회차`} 독후감
              </h1>
              {session.bookTitle && (
                <p className="text-gray-600 mt-1">
                  {session.bookTitle}
                  {session.bookRange && ` - ${session.bookRange}`}
                </p>
              )}
            </div>
          </div>

          {/* 제출 상태 */}
          {existingReport && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                {existingReport.status === 'SUBMITTED' ? (
                  <>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      제출완료
                    </span>
                    <span className="text-sm text-gray-500">
                      {existingReport.submittedAt &&
                        new Date(existingReport.submittedAt).toLocaleString('ko-KR')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                      임시저장
                    </span>
                    <span className="text-sm text-gray-500">작성 중인 독후감이 있습니다</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 템플릿 선택 */}
      {!existingReport && templates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">템플릿 선택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{template.icon || '📝'}</span>
                  <span className="font-medium text-gray-900">{template.name}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>약 {template.estimatedMinutes}분</span>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-500 mt-2">{template.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 독후감 폼 */}
      {selectedTemplate && (
        <ReportForm
          sessionId={sessionId}
          template={selectedTemplate}
          sections={parseTemplateFields(selectedTemplate)}
          existingReport={existingReport}
          onSuccess={() => {
            router.push(`/mypage/programs/${programId}/sessions/${sessionId}`)
          }}
        />
      )}
    </div>
  )
}
