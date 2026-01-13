import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { createElement, useState, useRef, useCallback } from 'react'

// 이미지 리사이즈 컴포넌트
function ResizableImageComponent({ node, updateAttributes, selected }: NodeViewProps) {
  const [isResizing, setIsResizing] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent, direction: 'left' | 'right') => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = imageRef.current?.offsetWidth || 0

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = direction === 'right'
        ? moveEvent.clientX - startXRef.current
        : startXRef.current - moveEvent.clientX

      const newWidth = Math.max(100, startWidthRef.current + diff)
      updateAttributes({ width: newWidth })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [updateAttributes])

  const { src, alt, title, width, align } = node.attrs

  return createElement(
    NodeViewWrapper,
    { className: `resizable-image-wrapper ${align || 'center'}` },
    createElement(
      'div',
      {
        className: `resizable-image-container ${selected ? 'selected' : ''} ${isResizing ? 'resizing' : ''}`,
        style: { width: width ? `${width}px` : 'auto' },
      },
      // 왼쪽 리사이즈 핸들
      createElement('div', {
        className: 'resize-handle resize-handle-left',
        onMouseDown: (e: React.MouseEvent) => handleMouseDown(e, 'left'),
      }),
      // 이미지
      createElement('img', {
        ref: imageRef,
        src,
        alt: alt || '',
        title: title || '',
        draggable: false,
        className: 'resizable-image',
      }),
      // 오른쪽 리사이즈 핸들
      createElement('div', {
        className: 'resize-handle resize-handle-right',
        onMouseDown: (e: React.MouseEvent) => handleMouseDown(e, 'right'),
      }),
      // 크기 표시
      selected && width && createElement(
        'div',
        { className: 'image-size-indicator' },
        `${Math.round(width)}px`
      )
    )
  )
}

// 리사이즈 가능한 이미지 확장
export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      align: {
        default: 'center',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          const dom = element as HTMLElement
          return {
            src: dom.getAttribute('src'),
            alt: dom.getAttribute('alt'),
            title: dom.getAttribute('title'),
            width: dom.getAttribute('width') ? parseInt(dom.getAttribute('width')!) : null,
            align: dom.getAttribute('data-align') || 'center',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      { class: `image-figure align-${HTMLAttributes.align || 'center'}` },
      [
        'img',
        mergeAttributes(HTMLAttributes, {
          'data-align': HTMLAttributes.align,
          style: HTMLAttributes.width ? `width: ${HTMLAttributes.width}px` : undefined,
        }),
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },

  addCommands() {
    return {
      setResizableImage:
        (options: { src: string; alt?: string; title?: string; width?: number; align?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
      updateImageSize:
        (width: number) =>
        ({ commands, state }) => {
          const { selection } = state
          const node = selection.$anchor.node()
          if (node.type.name === this.name) {
            return commands.updateAttributes(this.name, { width })
          }
          return false
        },
      setImageAlign:
        (align: 'left' | 'center' | 'right') =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { align })
        },
    }
  },
})

// TypeScript 확장 선언
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: {
        src: string
        alt?: string
        title?: string
        width?: number
        align?: string
      }) => ReturnType
      updateImageSize: (width: number) => ReturnType
      setImageAlign: (align: 'left' | 'center' | 'right') => ReturnType
    }
  }
}
