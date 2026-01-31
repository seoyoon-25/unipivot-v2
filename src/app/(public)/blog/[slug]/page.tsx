import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Eye, Tag, User } from 'lucide-react'
import { getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/actions/public'
import { ShareButton } from '@/components/ShareButton'
import { sanitizeHtml } from '@/lib/sanitize'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return { title: '블로그' }
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.image ? [post.image] : [],
    },
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedBlogPosts(params.slug, post.category)

  // Parse tags
  const tags = post.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || []

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            블로그 목록
          </Link>

          {post.category && (
            <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-medium rounded-full mb-4">
              {post.category}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-white/60">
            <div className="flex items-center gap-2">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || ''}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white/60" />
                </div>
              )}
              <span>{post.author.name || '관리자'}</span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views}
            </span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image && (
        <section className="bg-gray-100">
          <div className="max-w-5xl mx-auto px-4 -mt-8">
            <div className="aspect-[21/9] relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className={`py-12 bg-gray-50 ${!post.image ? 'pt-12' : 'pt-16'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 pb-8 border-b border-gray-100 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Main Content */}
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?search=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-primary hover:text-white transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-500 text-sm">이 글이 도움이 되셨나요?</span>
              <ShareButton title={post.title} />
            </div>
          </article>

          {/* Author Info */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || ''}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">작성자</p>
                <p className="text-lg font-semibold text-gray-900">{post.author.name || '관리자'}</p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/blog"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">관련 글</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                    {relatedPost.image ? (
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="text-3xl font-bold text-primary/20">B</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(relatedPost.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
