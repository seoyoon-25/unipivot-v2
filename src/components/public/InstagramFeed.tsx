import Image from 'next/image'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { getInstagramPosts, getInstagramAccount } from '@/lib/actions/instagram'

export async function InstagramFeed() {
  const [posts, accountInfo] = await Promise.all([
    getInstagramPosts(),
    getInstagramAccount()
  ])

  const { account, link } = accountInfo

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-on-scroll">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Instagram</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            @{account.replace('@', '')}
          </h2>
          <p className="text-gray-600">
            인스타그램에서 유니피벗의 일상을 만나보세요
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.slice(0, 6).map((post, index) => (
            <Link
              key={post.id}
              href={post.permalink || link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-100 scale-in stagger-${index + 1}`}
            >
              {post.imageUrl ? (
                <>
                  {/* Real Instagram Image */}
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || `Instagram post ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  {/* Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
                    <Instagram className="w-8 h-8 text-gray-400" />
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/80 via-pink-500/80 to-orange-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-white" />
                  </div>
                </>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center animate-on-scroll">
          <Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-5 h-5" />
            팔로우하기
          </Link>
        </div>
      </div>
    </section>
  )
}
