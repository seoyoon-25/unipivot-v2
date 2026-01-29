'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, X } from 'lucide-react'

interface QuoteImageGeneratorProps {
  quote: {
    content: string
    bookTitle: string
    bookAuthor?: string | null
    page?: number | null
  }
  onClose: () => void
}

const BACKGROUNDS = [
  { name: '블루', gradient: ['#1e3a5f', '#2d5a8e'] },
  { name: '그린', gradient: ['#1a3c2a', '#2d6a4f'] },
  { name: '퍼플', gradient: ['#2d1b4e', '#553c7b'] },
  { name: '다크', gradient: ['#1a1a2e', '#16213e'] },
  { name: '웜', gradient: ['#5c3d2e', '#8b5e3c'] },
]

export default function QuoteImageGenerator({ quote, onClose }: QuoteImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bgIndex, setBgIndex] = useState(0)

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 800
    const h = 600
    canvas.width = w
    canvas.height = h

    // Background gradient
    const bg = BACKGROUNDS[bgIndex]
    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, bg.gradient[0])
    gradient.addColorStop(1, bg.gradient[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    // Quote mark
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = 'bold 120px serif'
    ctx.fillText('"', 50, 140)

    // Quote text - word wrap
    ctx.fillStyle = '#ffffff'
    ctx.font = '24px sans-serif'
    const maxWidth = w - 120
    const words = quote.content.split('')
    let line = ''
    let y = 200
    const lineHeight = 36

    for (const char of words) {
      const testLine = line + char
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth) {
        ctx.fillText(line, 60, y)
        line = char
        y += lineHeight
        if (y > h - 120) break
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 60, y)

    // Book info
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '16px sans-serif'
    const bookInfo = `- ${quote.bookTitle}${quote.bookAuthor ? `, ${quote.bookAuthor}` : ''}${quote.page ? ` (p.${quote.page})` : ''}`
    ctx.fillText(bookInfo, 60, h - 60)

    // Branding
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('UniClub', w - 40, h - 30)
    ctx.textAlign = 'left'
  }

  // Draw canvas on mount and bg change
  useEffect(() => {
    const timer = setTimeout(drawCanvas, 100)
    return () => clearTimeout(timer)
  }, [bgIndex])

  const handleBgChange = (index: number) => {
    setBgIndex(index)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `quote-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-[860px] w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">이미지 카드 생성</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full rounded-lg border border-gray-200 mb-4"
          style={{ maxHeight: '400px', objectFit: 'contain' }}
        />

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-600">배경:</span>
          {BACKGROUNDS.map((bg, i) => (
            <button
              key={i}
              onClick={() => handleBgChange(i)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                bgIndex === i ? 'border-blue-500 scale-110' : 'border-gray-300'
              }`}
              style={{
                background: `linear-gradient(135deg, ${bg.gradient[0]}, ${bg.gradient[1]})`,
              }}
              title={bg.name}
            />
          ))}
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          이미지 다운로드
        </button>
      </div>
    </div>
  )
}
