import sharp from 'sharp'
import path from 'path'
import { mkdir } from 'fs/promises'

interface OptimizeOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

interface OptimizeResult {
  buffer: Buffer
  format: string
  width: number
  height: number
  size: number
}

// 기본 최적화 설정
const DEFAULT_OPTIONS: OptimizeOptions = {
  quality: 80,
  format: 'webp',
  fit: 'inside',
}

// 이미지 크기 프리셋
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' as const },
  small: { width: 320, height: 320, fit: 'inside' as const },
  medium: { width: 640, height: 640, fit: 'inside' as const },
  large: { width: 1280, height: 1280, fit: 'inside' as const },
  hero: { width: 1920, height: 1080, fit: 'inside' as const },
  square: { width: 400, height: 400, fit: 'cover' as const },
  card: { width: 400, height: 300, fit: 'cover' as const },
}

/**
 * 이미지 최적화 (WebP 변환 + 리사이징)
 */
export async function optimizeImage(
  input: Buffer | string,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  let pipeline = sharp(input)

  // 메타데이터 읽기
  const metadata = await pipeline.metadata()

  // 리사이징
  if (opts.width || opts.height) {
    pipeline = pipeline.resize({
      width: opts.width,
      height: opts.height,
      fit: opts.fit,
      withoutEnlargement: true, // 원본보다 크게 확대하지 않음
    })
  }

  // 포맷 변환
  switch (opts.format) {
    case 'webp':
      pipeline = pipeline.webp({ quality: opts.quality })
      break
    case 'avif':
      pipeline = pipeline.avif({ quality: opts.quality })
      break
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true })
      break
    case 'png':
      pipeline = pipeline.png({ quality: opts.quality, compressionLevel: 9 })
      break
  }

  const buffer = await pipeline.toBuffer()
  const info = await sharp(buffer).metadata()

  return {
    buffer,
    format: opts.format || 'webp',
    width: info.width || 0,
    height: info.height || 0,
    size: buffer.length,
  }
}

/**
 * 이미지 여러 크기 생성 (반응형 이미지용)
 */
export async function generateResponsiveImages(
  input: Buffer | string,
  presets: (keyof typeof IMAGE_PRESETS)[] = ['thumbnail', 'medium', 'large']
): Promise<Map<string, OptimizeResult>> {
  const results = new Map<string, OptimizeResult>()

  for (const preset of presets) {
    const options = IMAGE_PRESETS[preset]
    const result = await optimizeImage(input, options)
    results.set(preset, result)
  }

  return results
}

/**
 * 썸네일 생성
 */
export async function generateThumbnail(
  input: Buffer | string,
  size: number = 150
): Promise<OptimizeResult> {
  return optimizeImage(input, {
    width: size,
    height: size,
    fit: 'cover',
    format: 'webp',
    quality: 75,
  })
}

/**
 * 이미지 메타데이터 추출
 */
export async function getImageMetadata(input: Buffer | string) {
  const metadata = await sharp(input).metadata()
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: metadata.size || 0,
    hasAlpha: metadata.hasAlpha || false,
  }
}

/**
 * 이미지가 최적화가 필요한지 확인
 */
export async function needsOptimization(
  input: Buffer | string,
  maxWidth: number = 1920,
  maxSize: number = 500 * 1024 // 500KB
): Promise<boolean> {
  const metadata = await sharp(input).metadata()

  // 너무 큰 이미지
  if (metadata.width && metadata.width > maxWidth) return true

  // 파일 크기가 큰 경우
  if (metadata.size && metadata.size > maxSize) return true

  // WebP가 아닌 경우
  if (metadata.format !== 'webp') return true

  return false
}

/**
 * 파일명에서 WebP 확장자로 변경
 */
export function getWebPFilename(filename: string): string {
  const ext = path.extname(filename)
  return filename.replace(ext, '.webp')
}
