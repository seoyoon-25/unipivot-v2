export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Gift } from 'lucide-react'
import Link from 'next/link'
import DonateForm from './DonateForm'

export const metadata: Metadata = {
  title: '후원하기',
  description: '유니피벗과 함께 한반도 평화를 만들어가세요',
}

export default function DonatePage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Donate</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">후원하기</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            여러분의 후원이 남북청년의 만남을 가능하게 합니다
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <DonateForm />

          {/* Monthly Donation */}
          <div className="mt-12 bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white text-center">
            <Gift className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">정기 후원</h2>
            <p className="text-white/80 mb-6">
              매월 정기적인 후원으로 유니피벗의 안정적인 운영을 도와주세요
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              정기 후원 문의하기
            </Link>
          </div>
        </div>
      </section>

      {/* Tax Deduction Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">세액공제 안내</h2>
          <p className="text-gray-600 mb-6">
            사단법인 유니피벗에 대한 후원금은 소득세법에 따라 연말정산 시 세액공제 혜택을 받으실 수 있습니다.
          </p>
          <div className="inline-flex items-center gap-4 bg-white rounded-xl px-6 py-4 border border-gray-200">
            <div className="text-left">
              <p className="text-sm text-gray-500">기부금 영수증 문의</p>
              <p className="font-bold text-gray-900">unipivot@unipivot.org</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
