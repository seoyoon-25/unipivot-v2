import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Decoration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-primary/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/60 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="font-bold text-2xl text-white">유니피벗</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            남북청년이 함께<br />새로운 한반도를<br />만들어갑니다
          </h1>
          <p className="text-white/70 text-lg">
            유니피벗과 함께 한반도의 미래를 준비하세요
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="font-bold text-xl text-gray-900">유니피벗</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
