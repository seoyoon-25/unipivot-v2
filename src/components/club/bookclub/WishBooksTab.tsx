'use client';

import { useState } from 'react';
import { Plus, Bookmark } from 'lucide-react';
import BookCardSmall from './BookCardSmall';
import AddWishBookModal from './AddWishBookModal';
import EmptyState from '../ui/EmptyState';
import { removeWishBook } from '@/app/club/bookclub/my-bookshelf/actions';

interface WishBook {
  id: string;
  title: string;
  author: string;
  image?: string | null;
  memo?: string | null;
}

interface AvailableBook {
  id: string;
  title: string;
  author: string | null;
  image: string | null;
}

interface WishBooksTabProps {
  wishBooks: WishBook[];
  availableBooks: AvailableBook[];
}

export default function WishBooksTab({ wishBooks, availableBooks }: WishBooksTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = async (id: string) => {
    if (!confirm('읽고 싶은 책에서 삭제할까요?')) return;

    const result = await removeWishBook(id);
    if (result.error) {
      alert(result.error);
    }
  };

  return (
    <div>
      {/* 추가 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mb-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        읽고 싶은 책 추가
      </button>

      {wishBooks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="읽고 싶은 책을 추가해보세요"
          description="전체 책장에서 선택하거나 직접 입력할 수 있어요"
        />
      ) : (
        <div className="space-y-3">
          {wishBooks.map((book) => (
            <BookCardSmall
              key={book.id}
              book={book}
              showRemove
              onRemove={() => handleRemove(book.id)}
            />
          ))}
        </div>
      )}

      {/* 추가 모달 */}
      <AddWishBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableBooks={availableBooks}
      />
    </div>
  );
}
