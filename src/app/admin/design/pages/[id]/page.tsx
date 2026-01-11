import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import VisualEditor from '@/components/admin/VisualEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PageEditorPage({ params }: Props) {
  const { id } = await params

  const page = await prisma.pageContent.findUnique({
    where: { id },
  })

  if (!page) {
    notFound()
  }

  return (
    <VisualEditor
      pageId={page.id}
      pageTitle={page.title}
      pageSlug={page.slug}
      initialContent={page.content || ''}
      initialStyles={page.styles || ''}
      initialComponents={page.components || '[]'}
      isPublished={page.isPublished}
      metaTitle={page.metaTitle || ''}
      metaDesc={page.metaDesc || ''}
    />
  )
}
