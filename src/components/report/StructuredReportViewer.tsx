'use client'

import { Quote, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ReportStructureCode,
  ReportSection,
  ReportTemplateStructure,
  SectionData,
  StructuredReportData,
  REPORT_STRUCTURES,
} from '@/types/report'

interface StructuredReportViewerProps {
  structure: ReportStructureCode
  template: ReportTemplateStructure
  data: StructuredReportData
  className?: string
}

export function StructuredReportViewer({
  structure,
  template,
  data,
  className,
}: StructuredReportViewerProps) {
  const structureInfo = REPORT_STRUCTURES[structure]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Structure Badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border',
            structureInfo.color
          )}
        >
          <span>{structureInfo.icon}</span>
          <span>{structureInfo.name} 형식</span>
        </span>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {template.sections.map((section) => {
          const sectionData = data.sections[section.id]
          if (!sectionData) return null

          return (
            <SectionViewer
              key={section.id}
              section={section}
              data={sectionData}
            />
          )
        })}
      </div>
    </div>
  )
}

function SectionViewer({
  section,
  data,
}: {
  section: ReportSection
  data: SectionData
}) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <span>{section.emoji}</span>
        <span>{section.title}</span>
      </h3>

      <div className="pl-8">
        {section.type === 'textarea' && (
          <TextContent content={data as string} />
        )}

        {section.type === 'quote' && (
          <QuoteContent data={data as { quote?: string; page?: string; reason?: string; explanation?: string }} />
        )}

        {section.type === 'list' && (
          <ListContent data={data as { items?: string[] }} />
        )}

        {section.type === 'emotion' && (
          <EmotionContent data={data as { emotions?: string[]; description?: string }} />
        )}

        {section.type === 'questions' && (
          <QuestionsContent data={data as { questions?: string[] }} />
        )}
      </div>
    </div>
  )
}

function TextContent({ content }: { content: string }) {
  if (!content) return null

  return (
    <div className="prose prose-gray max-w-none">
      {content.split('\n').map((paragraph, i) => (
        <p key={i} className="text-gray-700 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function QuoteContent({
  data,
}: {
  data: { quote?: string; page?: string; reason?: string; explanation?: string }
}) {
  if (!data.quote) return null

  return (
    <div className="space-y-4">
      <blockquote className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg">
        <Quote className="w-5 h-5 text-primary mb-2" />
        <p className="text-gray-800 italic">&ldquo;{data.quote}&rdquo;</p>
        {data.page && (
          <cite className="text-sm text-gray-500 not-italic">{data.page}</cite>
        )}
      </blockquote>

      {data.reason && (
        <div className="text-gray-700">
          <span className="font-medium text-gray-900">선택 이유: </span>
          {data.reason}
        </div>
      )}

      {data.explanation && (
        <div className="text-gray-700">
          <span className="font-medium text-gray-900">설명: </span>
          {data.explanation}
        </div>
      )}
    </div>
  )
}

function ListContent({ data }: { data: { items?: string[] } }) {
  const items = data.items?.filter((item) => item.trim()) || []
  if (items.length === 0) return null

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
            {index + 1}
          </span>
          <span className="text-gray-700">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function EmotionContent({
  data,
}: {
  data: { emotions?: string[]; description?: string }
}) {
  const emotions = data.emotions || []
  if (emotions.length === 0) return null

  const emotionEmojis: Record<string, string> = {
    감동: '🥹',
    슬픔: '😢',
    기쁨: '😊',
    분노: '😠',
    불안: '😰',
    희망: '🌈',
    공감: '🤝',
    놀라움: '😲',
    그리움: '💭',
    평온: '😌',
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {emotions.map((emotion) => (
          <span
            key={emotion}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-800 text-sm"
          >
            <span>{emotionEmojis[emotion] || '❤️'}</span>
            <span>{emotion}</span>
          </span>
        ))}
      </div>

      {data.description && (
        <p className="text-gray-700">{data.description}</p>
      )}
    </div>
  )
}

function QuestionsContent({ data }: { data: { questions?: string[] } }) {
  const questions = data.questions?.filter((q) => q.trim()) || []
  if (questions.length === 0) return null

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <div
          key={index}
          className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <MessageCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <span className="text-gray-800">{question}</span>
        </div>
      ))}
    </div>
  )
}
