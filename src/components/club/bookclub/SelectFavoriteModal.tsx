'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Search, BookOpen, Heart } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { addFavoriteBook } from '@/app/club/bookclub/my-bookshelf/actions';

interface AvailableBook {
  id: string;
  title: string;
  author: string | null;
  image: string | null;
}

interface SelectFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBooks: AvailableBook[];
}

export default function SelectFavoriteModal({
  isOpen,
  onClose,
  availableBooks,
}: SelectFavoriteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<AvailableBook | null>(null);
  const [comment, setComment] = useState('');
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); resetForm(); }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  const filteredBooks = availableBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      (book.author || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedBook) return;

    const formData = new FormData();
    formData.set('readBookId', selectedBook.id);
    if (comment) formData.set('comment', comment);

    startTransition(async () => {
      const result = await addFavoriteBook(formData);
      if (result.error) {
        alert(result.error);
      } else {
        onClose();
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setSearch('');
    setSelectedBook(null);
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="favorite-modal-title">
      <div className="absolute inset-0 bg-black/50" onClick={() => { onClose(); resetForm(); }} aria-hidden="true" />
      <div ref={modalRef} className="relative w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-500" />
            <h2 id="favorite-modal-title" className="text-lg font-semibold text-gray-900">인생 책 선정</h2>
          </div>
          <button onClick={() => { onClose(); resetForm(); }} className="p-1 text-gray-400 hover:text-gray-600" aria-label="닫기">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-4">
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
          <div className="space-y-2 mb-4">
            {filteredBooks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {availableBooks.length === 0
                  ? '선정 가능한 책이 없습니다'
                  : '검색 결과가 없습니다'}
              </p>
            ) : (
              filteredBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedBook?.id === book.id
                      ? 'bg-amber-50 border-2 border-amber-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  {book.image ? (
                    <Image
                      src={book.image}
                      alt={book.title}
                      width={40}
                      height={56}
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
                  {selectedBook?.id === book.id && (
                    <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* 한줄 소감 */}
          {selectedBook && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                한줄 소감 (선택)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="이 책이 왜 인생 책인지 한줄로 표현해보세요"
                rows={2}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {comment.length}/100
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={!selectedBook || isPending}
            className="w-full py-2.5 bg-amber-500 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPending ? '선정 중...' : '인생 책으로 선정'}
          </button>
        </div>
      </div>
    </div>
  );
}
