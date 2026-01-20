'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Book, Edit, Trash2, FileText, MoreVertical } from 'lucide-react'

interface ReadBookWithCount {
  id: string
  title: string
  author: string | null
  publisher: string | null
  pubYear: string | null
  image: string | null
  season: string
  sessionCount: number | null
  participants: number | null
  category: string | null
  rating: number | null
  status: string
  _count: {
    bookReports: number
  }
}

interface Props {
  books: ReadBookWithCount[]
}

export default function BooksTable({ books }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 연결된 독후감은 삭제되지 않습니다.')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  if (books.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">등록된 책이 없습니다</h3>
        <p className="text-gray-500 mb-4">첫 번째 책을 추가해보세요.</p>
        <Link
          href="/admin/books/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          책 추가
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">책</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">시즌</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">분류</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">회차</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">참여자</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">독후감</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {book.image ? (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center">
                      <Book className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-500">{book.author || '작자 미상'}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-primary/10 text-primary text-sm font-medium rounded">
                  {book.season}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {book.category || '-'}
              </td>
              <td className="px-4 py-3 text-center text-gray-600">
                {book.sessionCount || '-'}
              </td>
              <td className="px-4 py-3 text-center text-gray-600">
                {book.participants || '-'}
              </td>
              <td className="px-4 py-3 text-center">
                {book._count.bookReports > 0 ? (
                  <Link
                    href={`/reports?book=${book.id}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    {book._count.bookReports}
                  </Link>
                ) : (
                  <span className="text-gray-400">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === book.id ? null : book.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>

                  {openMenuId === book.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-20">
                        <Link
                          href={`/admin/books/${book.id}`}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenMenuId(null)}
                        >
                          <Edit className="w-4 h-4" />
                          수정
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuId(null)
                            handleDelete(book.id)
                          }}
                          disabled={deletingId === book.id}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
