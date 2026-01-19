import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '읽고 싶은 책 | 유니피벗',
  description: '함께 읽고 싶은 책을 공유하고 투표해보세요.',
}

export default function BooksPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              읽고 싶은 책
            </h1>
            <p className="text-xl text-gray-600">
              함께 읽고 싶은 책을 공유하고 투표해보세요!
              <br />
              투표가 많은 책은 다음 독서모임 책 후보가 됩니다.
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-12 text-center">
            <p className="text-orange-600 font-medium text-lg">
              페이지 준비 중입니다.
            </p>
            <p className="text-gray-500 mt-4">
              곧 책을 검색하고, 등록하고, 투표할 수 있어요!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
