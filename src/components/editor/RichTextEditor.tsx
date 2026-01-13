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
}: RichTextEditorProps) {
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
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none',
        style: `min-height: ${minHeight}`,
      },
    },
  })

  if (!editor) return null

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white ${className}`}>
      <EditorToolbar editor={editor} showFontSelect={showFontSelect} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
      {showCharacterCount && (
        <div className="border-t border-gray-100 px-4 py-2 text-sm text-gray-500 bg-gray-50">
          {editor.storage.characterCount.characters()}
          {maxCharacters && ` / ${maxCharacters}`} 글자
          <span className="ml-4">
            {editor.storage.characterCount.words()} 단어
          </span>
        </div>
      )}
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
