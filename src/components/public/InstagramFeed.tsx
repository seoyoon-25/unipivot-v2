import Image from 'next/image'
import Link from 'next/link'
import { Instagram } from 'lucide-react'

const instagramPosts = [
  { id: 1, image: '/images/instagram/1.jpg' },
  { id: 2, image: '/images/instagram/2.jpg' },
  { id: 3, image: '/images/instagram/3.jpg' },
  { id: 4, image: '/images/instagram/4.jpg' },
  { id: 5, image: '/images/instagram/5.jpg' },
  { id: 6, image: '/images/instagram/6.jpg' },
]

export function InstagramFeed() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Instagram</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            @unipivot
          </h2>
          <p className="text-gray-600">
            인스타그램에서 유니피벗의 일상을 만나보세요
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <Link
              key={post.id}
              href="https://instagram.com/unipivot"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
            >
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <Instagram className="w-8 h-8" />
              </div>
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="https://instagram.com/unipivot"
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
