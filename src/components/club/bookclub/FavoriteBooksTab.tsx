'use client';

import { useState } from 'react';
import { Plus, Heart, Star } from 'lucide-react';
import BookCardSmall from './BookCardSmall';
import SelectFavoriteModal from './SelectFavoriteModal';
import EmptyState from '../ui/EmptyState';
import { removeFavoriteBook } from '@/app/club/bookclub/my-bookshelf/actions';

interface FavoriteBook {
  id: string;
  title: string;
  author: string;
  image?: string | null;
  comment?: string | null;
  order: number;
}

interface AvailableBook {
  id: string;
  title: string;
  author: string | null;
  image: string | null;
}

interface FavoriteBooksTabProps {
  favoriteBooks: FavoriteBook[];
  availableBooks: AvailableBook[];
}

export default function FavoriteBooksTab({
  favoriteBooks,
  availableBooks,
}: FavoriteBooksTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = async (id: string) => {
    if (!confirm('인생 책에서 삭제할까요?')) return;

    const result = await removeFavoriteBook(id);
    if (result.error) {
      alert(result.error);
    }
  };

  const canAddMore = favoriteBooks.length < 3;

  return (
    <div>
      {/* 안내 문구 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              인생 책을 선정해보세요
            </p>
            <p className="text-xs text-amber-600 mt-1">
              가장 인상 깊었던 책 최대 3권을 선정하고 한줄 소감을 남길 수 있어요.
            </p>
          </div>
        </div>
      </div>

      {/* 추가 버튼 */}
      {canAddMore && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full mb-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          인생 책 추가 ({favoriteBooks.length}/3)
        </button>
      )}

      {favoriteBooks.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="아직 선정한 인생 책이 없어요"
          description="읽은 책 중에서 가장 좋았던 책을 선정해보세요"
        />
      ) : (
        <div className="space-y-3">
          {favoriteBooks.map((book, index) => (
            <div key={book.id} className="relative">
              {/* 순위 배지 */}
              <div className="absolute -left-2 -top-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                {index + 1}
              </div>

              <BookCardSmall
                book={book}
                showRemove
                showComment
                onRemove={() => handleRemove(book.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* 선정 모달 */}
      <SelectFavoriteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableBooks={availableBooks}
      />
    </div>
  );
}
