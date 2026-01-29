export function MeaningSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* UNITE */}
          <div className="relative slide-from-left">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary-light rounded-full blur-2xl opacity-60" />
            <div className="relative">
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">Unite</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-6">
                UNI
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                <span className="text-primary font-semibold">UNITE</span>는
                남과 북의 청년들이 <strong>하나로 연결</strong>된다는 의미입니다.
                분단의 경계를 넘어 함께 소통하고, 이해하며,
                새로운 한반도의 미래를 함께 그려갑니다.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">N</span>
                </div>
                <span className="text-gray-400">+</span>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">S</span>
                </div>
                <span className="text-gray-400">=</span>
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* PIVOTING */}
          <div className="relative slide-from-right">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-light rounded-full blur-2xl opacity-60" />
            <div className="relative">
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">Pivoting</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-6">
                PIVOT
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                <span className="text-primary font-semibold">PIVOTING</span>은
                관점의 <strong>전환과 변화</strong>를 의미합니다.
                고정된 시각에서 벗어나 다양한 관점으로 한반도를 바라보며,
                새로운 가능성을 발견합니다.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-gray-500">기존 관점</span>
                </div>
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full">
                  <span>새로운 시각</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
