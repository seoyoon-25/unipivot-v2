import Link from 'next/link'
import { Heart } from 'lucide-react'

export function DonationBanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-primary-dark">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 animate-on-scroll">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                함께 만들어가는 한반도
              </h3>
              <p className="text-white/80">
                여러분의 후원이 남북청년의 교류를 가능하게 합니다
              </p>
            </div>
          </div>
          <Link
            href="/donate"
            className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            후원하기
          </Link>
        </div>
      </div>
    </section>
  )
}
