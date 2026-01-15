export const dynamic = 'force-dynamic'

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">단체 소개</h1>
            <p className="text-white/90 text-lg">유니피벳의 미션과 핵심 가치를 소개합니다.</p>
          </div>

          <div className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">미션</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                유니피벳은 남북청년이 함께 새로운 한반도를 만들어가는 플랫폼입니다.
                우리는 교육과 연구, 네트워킹을 통해 통일을 준비하는 미래 세대를 양성하고자 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">핵심 가치</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-primary-light/20 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-primary mb-2">Unity (통합)</h3>
                  <p className="text-gray-600">남북한 청년들의 만남과 소통을 통한 진정한 통합을 추구합니다.</p>
                </div>
                <div className="bg-primary-light/20 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-primary mb-2">Innovation (혁신)</h3>
                  <p className="text-gray-600">새로운 아이디어와 접근법으로 한반도 문제에 대한 창의적 해결책을 모색합니다.</p>
                </div>
                <div className="bg-primary-light/20 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-primary mb-2">Future (미래)</h3>
                  <p className="text-gray-600">통일 한국의 미래를 준비하는 인재 양성과 비전 제시에 힘씁니다.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">주요 활동</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">독서모임 '남Book북한걸음'</h3>
                    <p className="text-gray-600">남북관계와 통일 관련 도서를 함께 읽고 토론하는 활동</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">교육 세미나 및 강연</h3>
                    <p className="text-gray-600">전문가 강연과 교육 프로그램을 통한 역량 강화</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">K-move 프로그램</h3>
                    <p className="text-gray-600">청년들의 글로벌 역량 강화와 네트워킹 지원</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">리서치랩</h3>
                    <p className="text-gray-600">통일과 한반도 이슈에 대한 연구와 정책 제안</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">연락처</h2>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700"><strong>이메일:</strong> contact@unipivot.kr</p>
                <p className="text-gray-700"><strong>전화:</strong> 02-1234-5678</p>
                <p className="text-gray-700"><strong>주소:</strong> 서울특별시 종로구 청와대로 1</p>
                <p className="text-gray-700"><strong>운영시간:</strong> 평일 09:00-18:00</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}