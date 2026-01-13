'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CharacterCount } from '@tiptap/extension-character-count'
import { FontFamily } from '@tiptap/extension-font-family'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Youtube } from '@tiptap/extension-youtube'
import { EditorToolbar } from './EditorToolbar'
import { MarkdownShortcuts } from './extensions/MarkdownShortcuts'
import { useAutoSave, formatTimeAgo } from '@/lib/hooks/useAutoSave'
import { useState, useEffect, useCallback } from 'react'
import { Save, RotateCcw, X } from 'lucide-react'
import './editor.css'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  editable?: boolean
  minHeight?: string
  maxCharacters?: number
  showCharacterCount?: boolean
  showFontSelect?: boolean
  className?: string
  // 자동 저장 관련
  autoSaveKey?: string // 자동 저장 키 (없으면 자동 저장 비활성화)
  autoSaveDelay?: number // 저장 딜레이 (기본 3초)
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  editable = true,
  minHeight = '300px',
  maxCharacters,
  showCharacterCount = false,
  showFontSelect = true,
  className = '',
  autoSaveKey,
  autoSaveDelay = 3000,
}: RichTextEditorProps) {
  const [currentContent, setCurrentContent] = useState(content)
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)

  // 자동 저장 훅
  const autoSave = useAutoSave({
    key: autoSaveKey || 'default',
    value: currentContent,
    delay: autoSaveDelay,
    enabled: !!autoSaveKey,
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline hover:text-primary-dark' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-4' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxCharacters }),
      FontFamily,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: { class: 'w-full aspect-video my-4' },
      }),
      MarkdownShortcuts,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setCurrentContent(html)
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none',
        style: `min-height: ${minHeight}`,
      },
    },
  })

  // 초기 로드 시 저장된 데이터 확인
  useEffect(() => {
    if (autoSaveKey && autoSave.hasSavedData() && !content) {
      setShowRestorePrompt(true)
    }
  }, [autoSaveKey])

  // 복원 처리
  const handleRestore = useCallback(() => {
    const saved = autoSave.restore()
    if (saved && editor) {
      editor.commands.setContent(saved)
      setCurrentContent(saved)
      onChange(saved)
    }
    setShowRestorePrompt(false)
  }, [autoSave, editor, onChange])

  // 복원 거부
  const handleDismissRestore = useCallback(() => {
    autoSave.clear()
    setShowRestorePrompt(false)
  }, [autoSave])

  if (!editor) return null

  const savedInfo = autoSaveKey ? autoSave.getSavedInfo() : null

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white ${className}`}>
      {/* 복원 프롬프트 */}
      {showRestorePrompt && savedInfo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                저장된 내용이 있습니다
              </p>
              <p className="text-xs text-amber-600 mt-1 truncate">
                {formatTimeAgo(savedInfo.savedAt)} - {savedInfo.preview}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleRestore}
                className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                복원
              </button>
              <button
                type="button"
                onClick={handleDismissRestore}
                className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorToolbar editor={editor} showFontSelect={showFontSelect} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>

      {/* 하단 상태 바 */}
      <div className="border-t border-gray-100 px-4 py-2 text-sm text-gray-500 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showCharacterCount && (
            <>
              <span>
                {editor.storage.characterCount.characters()}
                {maxCharacters && ` / ${maxCharacters}`} 글자
              </span>
              <span>{editor.storage.characterCount.words()} 단어</span>
            </>
          )}
        </div>

        {/* 자동 저장 상태 */}
        {autoSaveKey && (
          <div className="flex items-center gap-2 text-xs">
            {autoSave.isSaving ? (
              <span className="text-gray-400">저장 중...</span>
            ) : autoSave.lastSaved ? (
              <span className="flex items-center gap-1 text-green-600">
                <Save className="w-3 h-3" />
                {formatTimeAgo(autoSave.lastSaved)} 저장됨
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

// 읽기 전용 렌더러
interface RichTextViewerProps {
  content: string
  className?: string
}

export function RichTextViewer({ content, className = '' }: RichTextViewerProps) {
  return (
    <div
      className={`prose prose-sm sm:prose max-w-none rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
