'use client';

import { useState, useTransition } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { addWishBook } from '@/app/club/bookclub/my-bookshelf/actions';

interface AvailableBook {
  id: string;
  title: string;
  author: string | null;
  image: string | null;
}

interface AddWishBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBooks: AvailableBook[];
}

export default function AddWishBookModal({
  isOpen,
  onClose,
  availableBooks,
}: AddWishBookModalProps) {
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<'select' | 'custom'>('select');
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<AvailableBook | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [memo, setMemo] = useState('');

  if (!isOpen) return null;

  const filteredBooks = availableBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      (book.author || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    const formData = new FormData();

    if (mode === 'select' && selectedBook) {
      formData.set('readBookId', selectedBook.id);
    } else if (mode === 'custom') {
      formData.set('customTitle', customTitle);
      formData.set('customAuthor', customAuthor);
    }
    if (memo) formData.set('memo', memo);

    startTransition(async () => {
      const result = await addWishBook(formData);
      if (result.error) {
        alert(result.error);
      } else {
        onClose();
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setMode('select');
    setSearch('');
    setSelectedBook(null);
    setCustomTitle('');
    setCustomAuthor('');
    setMemo('');
  };

  const canSubmit = mode === 'select' ? !!selectedBook : !!customTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">읽고 싶은 책 추가</h2>
          <button onClick={() => { onClose(); resetForm(); }} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모드 탭 */}
        <div className="flex border-b">
          <button
            onClick={() => setMode('select')}
            className={`flex-1 py-3 text-sm font-medium ${
              mode === 'select'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            책장에서 선택
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-3 text-sm font-medium ${
              mode === 'custom'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            직접 입력
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'select' ? (
            <>
              {/* 검색 */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="책 제목 또는 저자 검색"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              {/* 책 목록 */}
              <div className="space-y-2">
                {filteredBooks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    검색 결과가 없습니다
                  </p>
                ) : (
                  filteredBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        selectedBook?.id === book.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{book.title}</p>
                        <p className="text-sm text-gray-500 truncate">{book.author || ''}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* 직접 입력 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    책 제목 *
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="책 제목을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    저자
                  </label>
                  <input
                    type="text"
                    value={customAuthor}
                    onChange={(e) => setCustomAuthor(e.target.value)}
                    placeholder="저자를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* 메모 (공통) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="왜 이 책을 읽고 싶은지 메모해보세요"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPending ? '추가 중...' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
