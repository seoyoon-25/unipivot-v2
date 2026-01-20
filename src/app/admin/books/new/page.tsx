import BookForm from '../BookForm'

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">새 책 추가</h1>
        <p className="text-gray-600 mt-1">
          유니피벗에서 읽은 책을 추가합니다.
        </p>
      </div>

      <BookForm />
    </div>
  )
}
