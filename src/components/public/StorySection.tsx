import Link from 'next/link'

export function StorySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative scale-in">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-primary">U</span>
                  </div>
                  <p className="text-gray-500">창립 스토리 이미지</p>
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">2019</p>
                  <p className="text-sm text-gray-500">창립연도</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-sm text-gray-500">참여 청년</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="animate-on-scroll">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
              왜 유니피벗인가요?
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                2019년, 남과 북에서 온 청년들이 처음 만났습니다.
                서로 다른 환경에서 자랐지만, 같은 꿈을 꾸고 있었습니다.
              </p>
              <p>
                <strong className="text-gray-900">하나의 한반도, 함께하는 미래.</strong>
              </p>
              <p>
                유니피벗은 그 꿈을 향해 나아가는 청년들의 커뮤니티입니다.
                독서모임, 세미나, 현장 탐방 등 다양한 프로그램을 통해
                남북 청년들이 서로를 이해하고 함께 성장합니다.
              </p>
              <p>
                분단 70년, 이제 우리 세대가 변화를 만들어갈 때입니다.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/about"
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors"
              >
                더 알아보기
              </Link>
              <Link
                href="/notice"
                className="px-6 py-3 border border-gray-200 hover:border-primary hover:text-primary text-gray-700 rounded-xl font-medium transition-colors"
              >
                활동 소식
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
