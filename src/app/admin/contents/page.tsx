import Link from 'next/link'
import { prisma } from '@/lib/db'
import {
  FileText,
  Megaphone,
  BookOpen,
  ArrowRight,
  Eye,
  MessageSquare,
  TrendingUp,
  Clock,
  Edit,
} from 'lucide-react'

async function getContentsStats() {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalNotices,
    publicNotices,
    pinnedNotices,
    totalBlogPosts,
    publishedBlogPosts,
    draftBlogPosts,
    monthlyBlogPosts,
    recentNotices,
    recentBlogPosts,
  ] = await Promise.all([
    prisma.notice.count(),
    prisma.notice.count({ where: { isPublic: true } }),
    prisma.notice.count({ where: { isPinned: true } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { isPublished: true } }),
    prisma.blogPost.count({ where: { isPublished: false } }),
    prisma.blogPost.count({
      where: {
        createdAt: { gte: thisMonth },
      },
    }),
    prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        isPublic: true,
        isPinned: true,
        views: true,
        createdAt: true,
      },
    }),
    prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: {
          select: { name: true },
        },
      },
    }),
  ])

  return {
    stats: {
      totalNotices,
      publicNotices,
      pinnedNotices,
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      monthlyBlogPosts,
    },
    recentNotices,
    recentBlogPosts,
  }
}

export default async function AdminContentsPage() {
  const { stats, recentNotices, recentBlogPosts } = await getContentsStats()

  const modules = [
    {
      title: '공지사항',
      description: '공지사항 관리',
      href: '/admin/contents/notices',
      icon: Megaphone,
      stats: `${stats.publicNotices}개 공개`,
      subStats: stats.pinnedNotices > 0 ? `${stats.pinnedNotices}개 고정` : null,
      color: 'bg-blue-500',
    },
    {
      title: '블로그',
      description: '블로그 포스트 관리',
      href: '/admin/contents/blog',
      icon: BookOpen,
      stats: `${stats.publishedBlogPosts}개 게시중`,
      subStats: stats.draftBlogPosts > 0 ? `${stats.draftBlogPosts}개 임시저장` : null,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
          <p className="text-gray-500">공지사항과 블로그를 관리합니다</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">공지사항</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalNotices}</div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-blue-600">{stats.publicNotices} 공개</span>
            {stats.pinnedNotices > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-orange-600">{stats.pinnedNotices} 고정</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">블로그 포스트</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalBlogPosts}</div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-green-600">{stats.publishedBlogPosts} 게시</span>
            {stats.draftBlogPosts > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{stats.draftBlogPosts} 임시</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">이번달 새 글</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.monthlyBlogPosts}</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">빠른 작업</span>
          </div>
          <div className="flex gap-2 mt-2">
            <Link
              href="/notice/write"
              className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              공지 작성
            </Link>
            <Link
              href="/admin/contents/blog"
              className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              블로그 작성
            </Link>
          </div>
        </div>
      </div>

      {/* 모듈 카드 */}
      <div className="grid md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mt-4 mb-1 group-hover:text-primary transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3">{module.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-primary font-medium">{module.stats}</span>
              {module.subStats && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">{module.subStats}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 콘텐츠 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 최근 공지사항 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">최근 공지사항</h3>
            <Link
              href="/admin/contents/notices"
              className="text-sm text-primary hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentNotices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 공지사항이 없습니다
              </div>
            ) : (
              recentNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {notice.isPinned && (
                        <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                          고정
                        </span>
                      )}
                      <span className="font-medium text-gray-900 truncate">
                        {notice.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {notice.views}
                      </span>
                      <span>
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    notice.isPublic
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {notice.isPublic ? '공개' : '비공개'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* 최근 블로그 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">최근 블로그 포스트</h3>
            <Link
              href="/admin/contents/blog"
              className="text-sm text-primary hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBlogPosts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 블로그 포스트가 없습니다
              </div>
            ) : (
              recentBlogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {post.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{post.author?.name || '작성자 없음'}</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    post.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {post.isPublished ? '게시됨' : '임시저장'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
