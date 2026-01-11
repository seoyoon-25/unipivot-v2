import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye } from 'lucide-react'
import { getNoticeById } from '@/lib/actions/public'

interface Props {
  params: { id: string }
}

export default async function NoticeDetailPage({ params }: Props) {
  const notice = await getNoticeById(params.id)

  if (!notice) {
    notFound()
  }

  return (
    <>
      <section className="pt-32 pb-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/notice"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {notice.title}
          </h1>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {notice.views}
            </span>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <div className="prose prose-lg max-w-none">
              {notice.content.split('\n').map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/notice"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
