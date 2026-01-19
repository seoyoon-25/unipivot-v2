import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 유니피벗',
  description: '유니피벗 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          <p className="text-gray-600 leading-relaxed">
            사단법인 유니피벗(이하 &quot;단체&quot;)은 개인정보보호법에 따라 회원의 개인정보를 보호하고
            이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립하여 공개합니다.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (개인정보의 수집 항목)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              단체는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
            </p>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-2">필수 항목</h3>
              <ul className="text-gray-600 space-y-1 list-disc list-inside">
                <li>이름, 이메일, 비밀번호</li>
                <li>활동명(닉네임)</li>
                <li>출신(남한/북한/해외), 출생지</li>
                <li>거주지, 연락처</li>
                <li>출생연도, 성별</li>
              </ul>
              <h3 className="font-medium text-gray-900 mb-2 mt-4">선택 항목</h3>
              <ul className="text-gray-600 space-y-1 list-disc list-inside">
                <li>소속, 소속명</li>
                <li>가입 경로</li>
                <li>프로필 사진</li>
              </ul>
              <h3 className="font-medium text-gray-900 mb-2 mt-4">자동 수집 항목</h3>
              <ul className="text-gray-600 space-y-1 list-disc list-inside">
                <li>IP 주소, 접속 기록, 서비스 이용 기록</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (개인정보의 수집 목적)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li><strong>회원 관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정이용 방지</li>
              <li><strong>서비스 제공:</strong> 프로그램 신청 및 참여, 콘텐츠 제공, 포인트 적립 등</li>
              <li><strong>커뮤니케이션:</strong> 공지사항 전달, 프로그램 안내, 민원처리</li>
              <li><strong>통계 분석:</strong> 서비스 개선을 위한 통계 분석 및 연구</li>
              <li><strong>마케팅:</strong> 신규 프로그램 안내, 이벤트 정보 제공 (동의 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (개인정보의 보유 및 이용 기간)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>단체는 회원이 회원자격을 유지하는 동안 개인정보를 보유 및 이용합니다.</li>
              <li>회원 탈퇴 시 개인정보는 즉시 파기됩니다. 단, 관련 법령에 의한 보존이 필요한 경우 해당 기간 동안 보관합니다.</li>
              <li>법령에 따른 보관 기간:
                <ul className="mt-2 ml-6 space-y-1">
                  <li>- 계약 또는 청약철회 등에 관한 기록: 5년</li>
                  <li>- 대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                  <li>- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                  <li>- 접속에 관한 기록: 1년</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (개인정보의 제3자 제공)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>단체는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다.</li>
              <li>다음의 경우에는 예외로 합니다:
                <ul className="mt-2 ml-6 space-y-1">
                  <li>- 회원이 사전에 동의한 경우</li>
                  <li>- 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차에 따라 요청이 있는 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (개인정보 처리의 위탁)</h2>
            <p className="text-gray-600 leading-relaxed">
              단체는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <table className="w-full text-sm text-gray-600">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">수탁업체</th>
                    <th className="text-left py-2 font-medium">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">AWS (Amazon Web Services)</td>
                    <td className="py-2">클라우드 서버 운영</td>
                  </tr>
                  <tr>
                    <td className="py-2">Vercel</td>
                    <td className="py-2">웹사이트 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (회원의 권리와 행사 방법)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원은 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
              <li>회원은 언제든지 회원 탈퇴를 통해 개인정보 수집 및 이용에 대한 동의를 철회할 수 있습니다.</li>
              <li>회원은 개인정보 처리에 대한 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.</li>
              <li>권리 행사는 마이페이지 또는 이메일(contact@bestcome.org)을 통해 가능합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (개인정보의 파기)</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>단체는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</li>
              <li>전자적 파일 형태의 정보는 복구 및 재생할 수 없도록 기술적 방법을 사용하여 파기합니다.</li>
              <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통해 파기합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (개인정보 보호책임자)</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-600 leading-relaxed">
                단체는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 회원의 불만처리 및
                피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="mt-4 space-y-1 text-gray-600">
                <p><strong>개인정보 보호책임자</strong></p>
                <p>성명: (담당자명)</p>
                <p>직위: (직위)</p>
                <p>이메일: contact@bestcome.org</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제9조 (개인정보 처리방침의 변경)</h2>
            <p className="text-gray-600 leading-relaxed">
              본 개인정보처리방침은 법령, 정책 또는 서비스의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있습니다.
              변경되는 경우 최소 7일 전에 웹사이트를 통해 공지합니다.
            </p>
          </section>

          <section className="border-t pt-6 mt-8">
            <p className="text-gray-500 text-sm">
              본 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.
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
