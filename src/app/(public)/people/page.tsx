import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '함께하는 사람들 | 유니피벗',
  description: '유니피벗과 함께하는 운영진, 자문위원을 소개합니다.',
}

export default function PeoplePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            함께하는 사람들
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            유니피벗과 함께 새로운 한반도를 만들어가는 사람들입니다.
          </p>

          {/* 운영진 섹션 */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">운영진</h2>
            <div className="bg-orange-50 rounded-2xl p-12">
              <p className="text-orange-600 font-medium">
                페이지 준비 중입니다.
              </p>
            </div>
          </section>

          {/* 자문위원 섹션 */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">자문위원</h2>
            <div className="bg-gray-100 rounded-2xl p-12">
              <p className="text-gray-500">준비 중</p>
            </div>
          </section>

          {/* 역대 운영진 섹션 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">함께해온 사람들</h2>
            <div className="bg-gray-100 rounded-2xl p-12">
              <p className="text-gray-500">준비 중</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
