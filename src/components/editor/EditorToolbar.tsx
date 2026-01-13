'use client'

import { useState, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image,
  Table,
  Youtube,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Type,
  MoreHorizontal,
} from 'lucide-react'
import { EditorFontSelect } from './EditorFontSelect'
import { ColorPicker } from './ColorPicker'
import { LinkInsert } from './LinkInsert'
import { ImageUpload } from './ImageUpload'
import { TableInsert } from './TableInsert'
import { YoutubeInsert } from './YoutubeInsert'

interface EditorToolbarProps {
  editor: Editor
  showFontSelect?: boolean
}

export function EditorToolbar({ editor, showFontSelect = true }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [showYoutubeModal, setShowYoutubeModal] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const setLink = useCallback(
    (url: string) => {
      if (url) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      } else {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
      }
      setShowLinkModal(false)
    },
    [editor]
  )

  const addImage = useCallback(
    (url: string) => {
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
      setShowImageModal(false)
    },
    [editor]
  )

  const addTable = useCallback(
    (rows: number, cols: number) => {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
      setShowTableModal(false)
    },
    [editor]
  )

  const addYoutube = useCallback(
    (url: string) => {
      if (url) {
        editor.chain().focus().setYoutubeVideo({ src: url }).run()
      }
      setShowYoutubeModal(false)
    },
    [editor]
  )

  const ToolButton = ({
    onClick,
    isActive,
    disabled,
    title,
    children,
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2">
      <div className="flex flex-wrap items-center gap-0.5">
        {/* 폰트 선택 */}
        {showFontSelect && (
          <>
            <EditorFontSelect editor={editor} />
            <Divider />
          </>
        )}

        {/* 텍스트 스타일 */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="굵게 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="기울임 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="밑줄 (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="취소선"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolButton>

        <Divider />

        {/* 제목 */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="제목 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="제목 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="제목 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolButton>

        <Divider />

        {/* 색상 */}
        <div className="relative">
          <ToolButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            isActive={showColorPicker}
            title="텍스트 색상"
          >
            <Palette className="w-4 h-4" />
          </ToolButton>
          {showColorPicker && (
            <ColorPicker
              onSelect={(color) => {
                editor.chain().focus().setColor(color).run()
                setShowColorPicker(false)
              }}
              onClose={() => setShowColorPicker(false)}
            />
          )}
        </div>
        <div className="relative">
          <ToolButton
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            isActive={showHighlightPicker}
            title="하이라이트"
          >
            <Highlighter className="w-4 h-4" />
          </ToolButton>
          {showHighlightPicker && (
            <ColorPicker
              onSelect={(color) => {
                editor.chain().focus().toggleHighlight({ color }).run()
                setShowHighlightPicker(false)
              }}
              onClose={() => setShowHighlightPicker(false)}
              showClear
              onClear={() => {
                editor.chain().focus().unsetHighlight().run()
                setShowHighlightPicker(false)
              }}
            />
          )}
        </div>

        <Divider />

        {/* 정렬 */}
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="왼쪽 정렬"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="가운데 정렬"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="오른쪽 정렬"
        >
          <AlignRight className="w-4 h-4" />
        </ToolButton>

        <Divider />

        {/* 목록 */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="글머리 기호"
        >
          <List className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="번호 목록"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="체크리스트"
        >
          <CheckSquare className="w-4 h-4" />
        </ToolButton>

        <Divider />

        {/* 삽입 */}
        <div className="relative">
          <ToolButton
            onClick={() => setShowLinkModal(true)}
            isActive={editor.isActive('link')}
            title="링크 삽입"
          >
            <Link className="w-4 h-4" />
          </ToolButton>
          {showLinkModal && (
            <LinkInsert
              initialUrl={editor.getAttributes('link').href || ''}
              onSubmit={setLink}
              onClose={() => setShowLinkModal(false)}
            />
          )}
        </div>
        <div className="relative">
          <ToolButton onClick={() => setShowImageModal(true)} title="이미지 삽입">
            <Image className="w-4 h-4" />
          </ToolButton>
          {showImageModal && (
            <ImageUpload onSubmit={addImage} onClose={() => setShowImageModal(false)} />
          )}
        </div>
        <div className="relative">
          <ToolButton onClick={() => setShowTableModal(true)} title="표 삽입">
            <Table className="w-4 h-4" />
          </ToolButton>
          {showTableModal && (
            <TableInsert onSubmit={addTable} onClose={() => setShowTableModal(false)} />
          )}
        </div>
        <div className="relative">
          <ToolButton onClick={() => setShowYoutubeModal(true)} title="유튜브 삽입">
            <Youtube className="w-4 h-4" />
          </ToolButton>
          {showYoutubeModal && (
            <YoutubeInsert onSubmit={addYoutube} onClose={() => setShowYoutubeModal(false)} />
          )}
        </div>

        <Divider />

        {/* 기타 */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="인용구"
        >
          <Quote className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="코드 블록"
        >
          <Code className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus className="w-4 h-4" />
        </ToolButton>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <ToolButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="되돌리기 (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="다시하기 (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolButton>
      </div>
    </div>
  )
}
