'use client'
import { useState } from 'react'
import {
  WalkingPeninsulaLoader,
  WalkingPeninsulaOverlay,
  WalkingPeninsulaInline,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui'

export default function WalkingLoaderDemoPage() {
  const [showOverlay, setShowOverlay] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [isCardLoading, setIsCardLoading] = useState(false)

  const handleButtonClick = () => {
    setIsButtonLoading(true)
    setTimeout(() => setIsButtonLoading(false), 3000)
  }

  const handleCardLoad = () => {
    setIsCardLoading(true)
    setTimeout(() => setIsCardLoading(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🇰🇷 걷는 한반도 로더
          </h1>
          <p className="text-lg text-gray-600">
            WalkingPeninsulaLoader 컴포넌트 데모
          </p>
        </div>

        {/* 사이즈 비교 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📏 사이즈 비교</h2>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-end justify-around gap-8">
                <div className="text-center">
                  <WalkingPeninsulaLoader size="sm" text="Small" />
                  <code className="mt-4 block text-xs bg-gray-100 px-2 py-1 rounded">size="sm"</code>
                </div>
                <div className="text-center">
                  <WalkingPeninsulaLoader size="md" text="Medium" />
                  <code className="mt-4 block text-xs bg-gray-100 px-2 py-1 rounded">size="md"</code>
                </div>
                <div className="text-center">
                  <WalkingPeninsulaLoader size="lg" text="Large" />
                  <code className="mt-4 block text-xs bg-gray-100 px-2 py-1 rounded">size="lg"</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 텍스트 커스터마이징 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💬 텍스트 옵션</h2>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start justify-around gap-8">
                <div className="text-center">
                  <WalkingPeninsulaLoader size="md" />
                  <code className="mt-4 block text-xs bg-gray-100 px-2 py-1 rounded">기본 텍스트</code>
                </div>
                <div className="text-center">
                  <WalkingPeninsulaLoader size="md" text="데이터를 불러오는 중..." />
                  <code className="mt-4 block text-xs bg-gray-100 px-2 py-1 rounded">커스텀 텍스트</code>
                </div>
                <div className="text-center">
                  <WalkingPeninsulaLoader size="md" text="" />
                  <code className="mt-4 block text-xs bg-gray-100 px-2 py-1 rounded">텍스트 없음</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 전체 화면 오버레이 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🖼️ 전체 화면 오버레이</h2>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                페이지 전체를 덮는 로딩 오버레이입니다. 버튼을 클릭하면 3초 동안 표시됩니다.
              </p>
              <Button
                onClick={() => {
                  setShowOverlay(true)
                  setTimeout(() => setShowOverlay(false), 3000)
                }}
                size="lg"
              >
                오버레이 보기
              </Button>
              <code className="mt-4 block text-xs bg-gray-100 px-2 py-1 rounded mx-auto max-w-md">
                {'<WalkingPeninsulaOverlay text="잠시만 기다려주세요..." />'}
              </code>
            </CardContent>
          </Card>
        </section>

        {/* 인라인 버전 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 인라인 버전</h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-gray-600 mb-6">
                버튼이나 작은 공간에 사용할 수 있는 인라인 로더입니다.
              </p>
              <div className="flex items-center gap-4 justify-center">
                <span className="text-gray-700">로딩 중:</span>
                <WalkingPeninsulaInline />
              </div>
              <code className="mt-4 block text-xs bg-gray-100 px-2 py-1 rounded mx-auto max-w-xs text-center">
                {'<WalkingPeninsulaInline />'}
              </code>
            </CardContent>
          </Card>
        </section>

        {/* 실제 사용 예시 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 실제 사용 예시</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 버튼 로딩 */}
            <Card>
              <CardHeader>
                <CardTitle>버튼 로딩 상태</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={handleButtonClick}
                  disabled={isButtonLoading}
                  className="min-w-[200px]"
                >
                  {isButtonLoading ? (
                    <span className="flex items-center gap-2">
                      <WalkingPeninsulaInline />
                      <span>처리 중...</span>
                    </span>
                  ) : (
                    '클릭하세요'
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  클릭하면 3초간 로딩 상태가 됩니다
                </p>
              </CardContent>
            </Card>

            {/* 카드 로딩 */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle>카드 로딩 상태</CardTitle>
              </CardHeader>
              <CardContent>
                {isCardLoading ? (
                  <div className="py-8">
                    <WalkingPeninsulaLoader size="md" text="콘텐츠 로딩 중..." />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      이것은 로드된 콘텐츠입니다. 버튼을 클릭하면 로딩 상태로 전환됩니다.
                    </p>
                    <Button variant="outline" onClick={handleCardLoad}>
                      다시 로드하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 코드 예시 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💻 사용 코드</h2>
          <Card>
            <CardContent className="p-6">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
{`import {
  WalkingPeninsulaLoader,
  WalkingPeninsulaOverlay,
  WalkingPeninsulaInline
} from '@/components/ui'

// 기본 사용
<WalkingPeninsulaLoader />

// 사이즈 변경
<WalkingPeninsulaLoader size="lg" text="데이터 로딩 중..." />

// 전체 화면 오버레이
{isLoading && <WalkingPeninsulaOverlay text="잠시만 기다려주세요..." />}

// 인라인 (버튼 등에 사용)
<button>
  {isLoading ? <WalkingPeninsulaInline /> : '저장'}
</button>`}
              </pre>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* 오버레이 */}
      {showOverlay && <WalkingPeninsulaOverlay text="잠시만 기다려주세요..." />}
    </div>
  )
}
