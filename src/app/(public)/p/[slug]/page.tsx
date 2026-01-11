import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import prisma from '@/lib/db'

// Force dynamic rendering for real-time content updates
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.pageContent.findUnique({
    where: { slug },
    select: { title: true, metaTitle: true, metaDesc: true },
  })

  if (!page) {
    return { title: '페이지를 찾을 수 없습니다' }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDesc || undefined,
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params

  const page = await prisma.pageContent.findUnique({
    where: { slug },
  })

  if (!page || !page.isPublished) {
    notFound()
  }

  return (
    <>
      {/* Inject custom styles */}
      {page.styles && (
        <style dangerouslySetInnerHTML={{ __html: page.styles }} />
      )}

      {/* Render HTML content */}
      <div
        className="visual-page-content"
        dangerouslySetInnerHTML={{ __html: page.content || '' }}
      />
    </>
  )
}

