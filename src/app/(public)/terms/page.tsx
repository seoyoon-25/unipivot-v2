import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | 유니피벗',
  description: '유니피벗 서비스 이용약관',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관은 사단법인 유니피벗(이하 &quot;단체&quot;)이 운영하는 웹사이트(https://bestcome.org)에서
              제공하는 서비스(이하 &quot;서비스&quot;)의 이용조건 및 절차, 단체와 회원 간의 권리, 의무 및
              책임사항 등을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (용어의 정의)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>&quot;서비스&quot;란 단체가 운영하는 웹사이트를 통해 제공하는 모든 서비스를 말합니다.</li>
              <li>&quot;회원&quot;이란 본 약관에 동의하고 회원가입을 완료한 자를 말합니다.</li>
              <li>&quot;프로그램&quot;이란 단체가 운영하는 독서모임, 세미나, 토론회 등의 활동을 말합니다.</li>
              <li>&quot;콘텐츠&quot;란 서비스 내에서 제공되는 텍스트, 이미지, 영상 등의 정보를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>본 약관은 서비스 화면에 게시하거나 회원에게 공지함으로써 효력이 발생합니다.</li>
              <li>단체는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
              <li>약관이 변경되는 경우 단체는 변경 내용을 시행일 7일 전부터 공지합니다.</li>
              <li>회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (회원가입)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원가입은 이용자가 본 약관에 동의하고 가입신청을 하면 단체가 이를 승낙함으로써 성립합니다.</li>
              <li>회원은 가입 시 정확한 정보를 제공해야 하며, 허위 정보 제공 시 서비스 이용이 제한될 수 있습니다.</li>
              <li>단체는 다음 각 호에 해당하는 경우 회원가입을 거부할 수 있습니다:
                <ul className="mt-2 ml-6 space-y-1">
                  <li>- 타인의 명의를 사용한 경우</li>
                  <li>- 허위 정보를 기재한 경우</li>
                  <li>- 기타 회원가입 요건이 미비된 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (회원의 의무)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원은 본 약관 및 단체의 공지사항을 준수해야 합니다.</li>
              <li>회원은 타인의 권리를 침해하거나 불법적인 행위를 해서는 안 됩니다.</li>
              <li>회원은 서비스를 이용하여 얻은 정보를 단체의 동의 없이 영리 목적으로 사용할 수 없습니다.</li>
              <li>회원은 자신의 계정 정보를 안전하게 관리해야 하며, 제3자에게 이를 양도하거나 대여할 수 없습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (프로그램 참여)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>프로그램 참여는 회원에 한하여 신청할 수 있습니다.</li>
              <li>프로그램 참가비는 각 프로그램별로 별도 안내되며, 환불 규정은 각 프로그램 안내에 따릅니다.</li>
              <li>보증금이 있는 프로그램의 경우, 참여 조건을 충족해야 보증금이 반환됩니다.</li>
              <li>단체는 프로그램 운영상 필요한 경우 일정 및 내용을 변경할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (서비스 이용 제한)</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              단체는 다음 각 호에 해당하는 경우 회원의 서비스 이용을 제한하거나 회원 자격을 박탈할 수 있습니다:
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-1 list-disc list-inside ml-4">
              <li>타인의 정보를 도용한 경우</li>
              <li>서비스 운영을 고의로 방해한 경우</li>
              <li>공공질서 및 미풍양속에 반하는 행위를 한 경우</li>
              <li>타인의 명예를 손상시키거나 불이익을 주는 행위를 한 경우</li>
              <li>기타 관련 법령이나 본 약관을 위반한 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (면책 조항)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>단체는 천재지변, 전쟁, 기타 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              <li>단체는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
              <li>단체는 회원이 서비스 내에 게시한 정보, 자료, 사실의 신뢰도, 정확성 등에 대하여 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제9조 (분쟁 해결)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>본 약관과 관련하여 분쟁이 발생한 경우 단체와 회원은 상호 협의하여 해결합니다.</li>
              <li>협의가 이루어지지 않는 경우 관할 법원은 단체의 소재지를 관할하는 법원으로 합니다.</li>
              <li>본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.</li>
            </ul>
          </section>

          <section className="border-t pt-6 mt-8">
            <p className="text-gray-500 text-sm">
              본 약관은 2024년 1월 1일부터 시행됩니다.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              사단법인 유니피벗<br />
              서울특별시 (상세주소)
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
