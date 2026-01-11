'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Upload, Settings, Undo, Redo, Monitor, Tablet, Smartphone } from 'lucide-react'
import type { Editor } from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'

interface VisualEditorProps {
  pageId: string
  pageTitle: string
  pageSlug: string
  initialContent: string
  initialStyles: string
  initialComponents: string
  isPublished: boolean
  metaTitle: string
  metaDesc: string
}

export default function VisualEditor({
  pageId,
  pageTitle,
  pageSlug,
  initialContent,
  initialStyles,
  initialComponents,
  isPublished: initialPublished,
  metaTitle: initialMetaTitle,
  metaDesc: initialMetaDesc,
}: VisualEditorProps) {
  const router = useRouter()
  const editorRef = useRef<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublished, setIsPublished] = useState(initialPublished)
  const [showSettings, setShowSettings] = useState(false)
  const [title, setTitle] = useState(pageTitle)
  const [slug, setSlug] = useState(pageSlug)
  const [metaTitle, setMetaTitle] = useState(initialMetaTitle)
  const [metaDesc, setMetaDesc] = useState(initialMetaDesc)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const saveContent = useCallback(async (publish = false) => {
    if (!editorRef.current) return

    setIsSaving(true)
    try {
      const editor = editorRef.current
      const html = editor.getHtml()
      const css = editor.getCss()
      const components = JSON.stringify(editor.getComponents())

      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content: html,
          styles: css,
          components,
          metaTitle,
          metaDesc,
          ...(publish !== undefined && { isPublished: publish }),
        }),
      })

      if (res.ok) {
        setLastSaved(new Date())
        if (publish !== undefined) {
          setIsPublished(publish)
        }
      } else {
        const data = await res.json()
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      alert('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }, [pageId, title, slug, metaTitle, metaDesc])

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return

    const initEditor = async () => {
      const grapesjs = (await import('grapesjs')).default
      const gjsPresetWebpage = (await import('grapesjs-preset-webpage')).default
      const gjsBlocksBasic = (await import('grapesjs-blocks-basic')).default
      const gjsPluginForms = (await import('grapesjs-plugin-forms')).default
      const { customBlocks } = await import('@/lib/editor-blocks')

      const editor = grapesjs.init({
        container: containerRef.current!,
        height: '100%',
        width: 'auto',
        storageManager: false,
        plugins: [gjsPresetWebpage, gjsBlocksBasic, gjsPluginForms],
        pluginsOpts: {
          [gjsPresetWebpage as unknown as string]: {
            blocksBasicOpts: {
              blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video'],
              flexGrid: true,
            },
            formsOpts: false,
          },
        },
        assetManager: {
          upload: '/api/upload',
          uploadName: 'files',
          multiUpload: true,
          autoAdd: true,
          headers: {},
          params: {},
          credentials: 'same-origin',
          dropzone: true,
          openAssetsOnDrop: true,
          dropzoneContent: '<div class="dropzone-inner">이미지를 여기에 드래그하거나 클릭하여 업로드</div>',
        },
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap',
          ],
        },
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Tablet', width: '768px', widthMedia: '768px' },
            { name: 'Mobile', width: '375px', widthMedia: '375px' },
          ],
        },
        panels: {
          defaults: [],
        },
        blockManager: {
          appendTo: '#blocks-container',
        },
        styleManager: {
          appendTo: '#styles-container',
          sectors: [
            {
              name: '레이아웃',
              open: true,
              properties: [
                'display',
                'flex-direction',
                'justify-content',
                'align-items',
                'flex-wrap',
                'gap',
              ],
            },
            {
              name: '크기',
              open: false,
              properties: [
                'width',
                'height',
                'max-width',
                'min-height',
                'padding',
                'margin',
              ],
            },
            {
              name: '타이포그래피',
              open: false,
              properties: [
                'font-family',
                'font-size',
                'font-weight',
                'line-height',
                'letter-spacing',
                'text-align',
                'color',
              ],
            },
            {
              name: '배경',
              open: false,
              properties: [
                'background-color',
                'background-image',
                'background-size',
                'background-position',
              ],
            },
            {
              name: '테두리',
              open: false,
              properties: [
                'border',
                'border-radius',
                'box-shadow',
              ],
            },
          ],
        },
        layerManager: {
          appendTo: '#layers-container',
        },
        traitManager: {
          appendTo: '#traits-container',
        },
        selectorManager: {
          appendTo: '#selectors-container',
        },
      })

      // Add custom blocks
      const blockManager = editor.BlockManager
      customBlocks.forEach((block) => {
        blockManager.add(block.id, {
          label: block.label,
          category: block.category,
          content: block.content,
          media: block.media,
        })
      })

      // Load initial content
      if (initialComponents && initialComponents !== '[]') {
        try {
          editor.setComponents(JSON.parse(initialComponents))
        } catch {
          if (initialContent) {
            editor.setComponents(initialContent)
          }
        }
      } else if (initialContent) {
        editor.setComponents(initialContent)
      }

      if (initialStyles) {
        editor.setStyle(initialStyles)
      }

      // Auto-save every 30 seconds
      const autoSaveInterval = setInterval(() => {
        if (editorRef.current) {
          saveContent()
        }
      }, 30000)

      editorRef.current = editor

      return () => {
        clearInterval(autoSaveInterval)
        editor.destroy()
      }
    }

    initEditor()
  }, [initialContent, initialStyles, initialComponents, saveContent])

  // Change device view
  useEffect(() => {
    if (!editorRef.current) return
    const deviceMap = {
      desktop: 'Desktop',
      tablet: 'Tablet',
      mobile: 'Mobile',
    }
    editorRef.current.setDevice(deviceMap[deviceView])
  }, [deviceView])

  const handleUndo = () => editorRef.current?.UndoManager.undo()
  const handleRedo = () => editorRef.current?.UndoManager.redo()

  const handlePreview = () => {
    saveContent().then(() => {
      window.open(`/p/${slug}`, '_blank')
    })
  }

  const handlePublish = async () => {
    await saveContent(true)
  }

  const handleUnpublish = async () => {
    await saveContent(false)
  }

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col">
      {/* Top Toolbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/design/pages"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-gray-900">{title}</h1>
            <div className="text-xs text-gray-500">/p/{slug}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                deviceView === 'desktop' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="데스크톱"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`p-2 rounded-lg transition-colors ${
                deviceView === 'tablet' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="태블릿"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                deviceView === 'mobile' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="모바일"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="실행 취소"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="다시 실행"
          >
            <Redo className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="설정"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Save */}
          <button
            onClick={() => saveContent()}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '저장 중...' : '저장'}
          </button>

          {/* Preview */}
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>

          {/* Publish/Unpublish */}
          {isPublished ? (
            <button
              onClick={handleUnpublish}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              게시 취소
            </button>
          ) : (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Upload className="w-4 h-4" />
              게시하기
            </button>
          )}
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Blocks */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">블록</h2>
            <p className="text-xs text-gray-500 mt-1">드래그하여 캔버스에 추가</p>
          </div>
          <div id="blocks-container" className="flex-1 overflow-y-auto p-4" />
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-hidden">
          <div ref={containerRef} className="h-full" />
        </main>

        {/* Right Sidebar - Styles & Layers */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className="flex-1 px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary"
              >
                스타일
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div id="selectors-container" className="p-4 border-b border-gray-200" />
            <div id="styles-container" className="p-4 border-b border-gray-200" />
            <div id="traits-container" className="p-4 border-b border-gray-200" />
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">레이어</h3>
              <div id="layers-container" />
            </div>
          </div>
        </aside>
      </div>

      {/* Last Saved Indicator */}
      {lastSaved && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          저장됨: {lastSaved.toLocaleTimeString('ko-KR')}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">페이지 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  페이지 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL 슬러그
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-2">/p/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9가-힣-]/gi, '-').toLowerCase())}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO 타이틀
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="검색 엔진에 표시될 제목"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO 설명
                </label>
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="검색 엔진에 표시될 설명"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  saveContent()
                  setShowSettings(false)
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
