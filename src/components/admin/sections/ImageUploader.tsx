'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormField } from './FormField'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface ImageUploaderProps {
  label: string
  description?: string
  value: string
  onChange: (url: string) => void
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  maxSizeMB?: number
  skipOptimize?: boolean
}

export function ImageUploader({
  label,
  description,
  value,
  onChange,
  className,
  aspectRatio = 'auto',
  maxSizeMB = 10,
  skipOptimize = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: '오류',
        description: `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`,
        variant: 'destructive',
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: '오류',
        description: '이미지 파일만 업로드할 수 있습니다.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('generateThumbnail', 'true')
      if (skipOptimize) {
        formData.append('skipOptimize', 'true')
      }

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onChange(data.url)

      toast({
        title: '성공',
        description: '이미지가 업로드되었습니다.',
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: '오류',
        description: '이미지 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      default:
        return 'min-h-[200px]'
    }
  }

  return (
    <FormField
      label={label}
      description={description}
      className={className}
    >
      <div className="space-y-4">
        {/* Upload Area */}
        <Card className={cn(
          'border-2 border-dashed transition-colors',
          dragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
          getAspectRatioClass()
        )}>
          <CardContent className="p-0">
            {value ? (
              /* Image Preview */
              <div className="relative w-full h-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Preview"
                  className="max-w-full max-h-[200px] object-contain rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              /* Upload Zone */
              <div
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full min-h-[200px] cursor-pointer p-6',
                  getAspectRatioClass()
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">업로드 중...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-muted rounded-full">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">이미지를 드래그하거나 클릭하세요</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, GIF, WEBP (최대 {maxSizeMB}MB)
                      </p>
                    </div>
                    <Button variant="outline" size="sm" type="button">
                      <Upload className="h-4 w-4 mr-2" />
                      파일 선택
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Image URL Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            또는 이미지 URL 직접 입력
          </label>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </FormField>
  )
}