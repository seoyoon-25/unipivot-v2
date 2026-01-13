'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, File, Image as ImageIcon, AlertCircle, Check } from 'lucide-react'

interface UploadedFile {
  url: string
  name: string
  size: number
  type: 'image' | 'file'
}

interface DropzoneUploadProps {
  type?: 'image' | 'file' | 'both'
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // bytes
  accept?: string
  value?: string | string[]
  onChange?: (urls: string | string[]) => void
  onFilesChange?: (files: UploadedFile[]) => void
  placeholder?: string
  className?: string
  showPreview?: boolean
  compact?: boolean
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DropzoneUpload({
  type = 'image',
  multiple = false,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept,
  value,
  onChange,
  onFilesChange,
  placeholder,
  className = '',
  showPreview = true,
  compact = false,
}: DropzoneUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 기본 accept 설정
  const defaultAccept = type === 'image'
    ? 'image/jpeg,image/png,image/gif,image/webp'
    : type === 'file'
    ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.txt,.zip'
    : 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.txt,.zip'

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData()
    formData.append('file', file)

    const isImage = file.type.startsWith('image/')
    const endpoint = isImage ? '/api/upload/image' : '/api/upload/file'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '업로드 실패')
      }

      const data = await response.json()
      return {
        url: data.url,
        name: data.name,
        size: file.size,
        type: isImage ? 'image' : 'file',
      }
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    }
  }

  const processFiles = async (files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)

    // 파일 개수 체크
    if (multiple && fileArray.length + uploadedFiles.length > maxFiles) {
      setError(`최대 ${maxFiles}개까지 업로드할 수 있습니다.`)
      return
    }

    // 파일 크기 및 타입 체크
    const validFiles: File[] = []
    for (const file of fileArray) {
      if (file.size > maxSize) {
        setError(`파일 크기는 ${formatFileSize(maxSize)} 이하여야 합니다.`)
        continue
      }

      if (type === 'image' && !file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.')
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setIsUploading(true)

    try {
      const results: UploadedFile[] = []

      for (const file of validFiles) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        const result = await uploadFile(file)
        if (result) {
          results.push(result)
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
        }
      }

      const newFiles = multiple ? [...uploadedFiles, ...results] : results
      setUploadedFiles(newFiles)

      // 콜백 호출
      const urls = newFiles.map((f) => f.url)
      if (onChange) {
        onChange(multiple ? urls : urls[0] || '')
      }
      if (onFilesChange) {
        onFilesChange(newFiles)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const { files } = e.dataTransfer
      if (files && files.length > 0) {
        processFiles(files)
      }
    },
    [uploadedFiles, maxFiles, maxSize, type, multiple]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (files && files.length > 0) {
      processFiles(files)
    }
    // 같은 파일 다시 선택 가능하도록 초기화
    e.target.value = ''
  }

  const handleRemove = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)

    const urls = newFiles.map((f) => f.url)
    if (onChange) {
      onChange(multiple ? urls : urls[0] || '')
    }
    if (onFilesChange) {
      onFilesChange(newFiles)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const defaultPlaceholder = type === 'image'
    ? '이미지를 드래그하거나 클릭하여 업로드'
    : type === 'file'
    ? '파일을 드래그하거나 클릭하여 업로드'
    : '파일을 드래그하거나 클릭하여 업로드'

  return (
    <div className={className}>
      {/* 드롭존 영역 */}
      <div
        role="button"
        tabIndex={0}
        aria-label={placeholder || defaultPlaceholder}
        aria-describedby="dropzone-description"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl transition-all cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${compact ? 'p-4' : 'p-8'}
          ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept || defaultAccept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-600">업로드 중...</p>
            </>
          ) : (
            <>
              <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-full bg-primary/10 flex items-center justify-center mb-3`}>
                <Upload className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
              </div>
              <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-700`}>
                {placeholder || defaultPlaceholder}
              </p>
              <p id="dropzone-description" className="text-xs text-gray-500 mt-1">
                {type === 'image' ? 'JPG, PNG, GIF, WEBP' : 'PDF, DOC, XLS, HWP 등'}
                {' '}(최대 {formatFileSize(maxSize)})
              </p>
            </>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 업로드된 파일 목록 */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={file.url}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* 썸네일/아이콘 */}
              {file.type === 'image' ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white border">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                  <File className="w-6 h-6 text-gray-400" />
                </div>
              )}

              {/* 파일 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* 상태/삭제 버튼 */}
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(index)
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 진행 상태 */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-blue-700 truncate">{name}</span>
                <span className="text-xs text-blue-600">{progress}%</span>
              </div>
              <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
