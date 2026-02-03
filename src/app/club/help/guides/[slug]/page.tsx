import { notFound } from 'next/navigation'
import { helpGuides } from '@/data/help-content'
import MarkdownContent from '@/components/club/help/MarkdownContent'
import HelpBreadcrumb from '@/components/club/help/HelpBreadcrumb'

const guideSlugs = ['bookclub', 'programs', 'attendance', 'community']

export function generateStaticParams() {
  return guideSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = helpGuides.find((g) => g.slug === slug)
  return { title: guide ? `${guide.title} | 도움말 | 유니클럽` : '도움말 | 유니클럽' }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = helpGuides.find((g) => g.slug === slug)

  if (!guide) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <HelpBreadcrumb current={guide.title} parentLabel="가이드" />
      <MarkdownContent content={guide.content} />
    </div>
  )
}
