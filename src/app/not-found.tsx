import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="text-[8rem] font-extrabold leading-none tracking-tight text-gray-900 sm:text-[10rem]">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-3 text-center text-gray-500">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-xl bg-[#FF6B35] px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#E55A2B]"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
