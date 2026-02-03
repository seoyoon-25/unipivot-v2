import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProgramJsonLd } from '@/components/seo/JsonLd'
import { ProgramDetailContent } from './ProgramDetailContent'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const program = await prisma.program.findUnique({
    where: { slug },
    select: { title: true, description: true, image: true, thumbnailSquare: true },
  })

  if (!program) {
    return { title: '프로그램을 찾을 수 없습니다' }
  }

  return {
    title: `${program.title} | 유니피벗`,
    description: program.description || `${program.title} 프로그램 정보`,
    openGraph: {
      title: program.title,
      description: program.description || `${program.title} 프로그램 정보`,
      images: program.thumbnailSquare || program.image ? [program.thumbnailSquare || program.image!] : [],
    },
  }
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const { slug } = await params

  const program = await prisma.program.findUnique({
    where: { slug },
    include: {
      sessions: {
        orderBy: { sessionNo: 'asc' },
      },
      books: {
        include: {
          book: true,
        },
      },
      gallery: {
        orderBy: { sortOrder: 'asc' },
      },
      depositSetting: true,
    },
  })

  if (!program) {
    notFound()
  }

  // Check if user has liked and applied
  let isLiked = false
  let hasApplied = false
  let application = null

  if (session?.user?.id) {
    const [like, app] = await Promise.all([
      prisma.programLike.findUnique({
        where: {
          programId_userId: {
            programId: program.id,
            userId: session.user.id,
          },
        },
      }),
      prisma.programApplication.findUnique({
        where: {
          programId_userId: {
            programId: program.id,
            userId: session.user.id,
          },
        },
      }),
    ])

    isLiked = !!like
    hasApplied = !!app
    application = app
  }

  return (
    <>
      <ProgramJsonLd
        program={{
          title: program.title,
          slug: program.slug,
          description: program.description,
          image: program.image,
          startDate: program.startDate?.toISOString() ?? null,
          endDate: program.endDate?.toISOString() ?? null,
          location: program.location,
          isOnline: program.isOnline,
          fee: program.fee,
          capacity: program.capacity,
          status: program.status,
        }}
      />
      <ProgramDetailContent
        program={program}
        isLiked={isLiked}
        hasApplied={hasApplied}
        application={application}
        isLoggedIn={!!session}
        userRole={session?.user?.role}
      />
    </>
  )
}
