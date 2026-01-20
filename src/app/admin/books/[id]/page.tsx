import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import BookForm from '../BookForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBookPage({ params }: Props) {
  const { id } = await params

  const book = await prisma.readBook.findUnique({
    where: { id }
  })

  if (!book) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">책 수정</h1>
        <p className="text-gray-600 mt-1">
          {book.title}
        </p>
      </div>

      <BookForm book={book} />
    </div>
  )
}
