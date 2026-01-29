import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (status === 'published') {
      where.isPublished = true
    } else if (status === 'draft') {
      where.isPublished = false
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Check for slug uniqueness
    if (body.slug) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug: body.slug },
      })
      if (existingPost) {
        return NextResponse.json(
          { error: '이미 사용 중인 슬러그입니다.' },
          { status: 400 }
        )
      }
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        image: body.image,
        category: body.category,
        tags: body.tags,
        isPublished: body.isPublished || false,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
