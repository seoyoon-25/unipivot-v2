import Link from 'next/link'
import Image from 'next/image'
import { sanitizeHtml } from '@/lib/sanitize'
import '@/components/editor/editor.css'

interface CooperationSectionProps {
  title: string
  content: string
  image?: string | null
  imageAlt?: string | null
  buttonText: string
  buttonLink: string
  reverse?: boolean
}

export function CooperationSection({
  title,
  content,
  image,
  imageAlt,
  buttonText,
  buttonLink,
  reverse = false,
}: CooperationSectionProps) {
  // Check if content is HTML (has tags) or plain text
  const isHtml = /<[a-z][\s\S]*>/i.test(content)

  return (
    <div
      className={`flex flex-col gap-8 items-center ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      }`}
    >
      {/* Text Content */}
      <div className="flex-1 space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        <div
          className={`leading-relaxed ${isHtml ? 'rich-text-content prose prose-gray max-w-none' : 'text-gray-600 whitespace-pre-line'}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(isHtml ? content : content.replace(/\n/g, '<br/>')) }}
        />
        <Link
          href={buttonLink}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors"
        >
          {buttonText}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Image */}
      <div className="flex-1 w-full">
        {image ? (
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">이미지 준비 중</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
