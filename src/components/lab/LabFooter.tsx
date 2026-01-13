import Link from 'next/link'

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'bestcome.org'

export function LabFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <p className="font-bold text-white">유니피벗 리서치랩</p>
                <p className="text-xs text-gray-500">Research Lab</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              북한이탈주민 전문가 풀과 연구 매칭 플랫폼입니다.
              통일·북한 분야의 전문가와 강사를 직접 검색하고 섭외하세요.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/lab/experts" className="hover:text-white transition-colors">
                  전문가/강사
                </Link>
              </li>
              <li>
                <Link href="/lab/surveys" className="hover:text-white transition-colors">
                  설문조사
                </Link>
              </li>
              <li>
                <Link href="/lab/research" className="hover:text-white transition-colors">
                  연구참여
                </Link>
              </li>
              <li>
                <Link href="/lab/trends" className="hover:text-white transition-colors">
                  연구동향
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">연락처</h4>
            <ul className="space-y-2 text-sm">
              <li>이메일: research@bestcome.org</li>
              <li>
                <a
                  href={`https://${MAIN_DOMAIN}`}
                  className="hover:text-white transition-colors"
                >
                  유니피벗 메인
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} UniPivot Research Lab. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/lab/privacy" className="hover:text-white transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/lab/terms" className="hover:text-white transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
