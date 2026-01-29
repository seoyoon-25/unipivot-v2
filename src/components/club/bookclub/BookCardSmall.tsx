'use client';

import { BookOpen, X } from 'lucide-react';

interface BookCardSmallProps {
  book: {
    id: string;
    title: string;
    author: string;
    image?: string | null;
    comment?: string | null;
    memo?: string | null;
  };
  showRemove?: boolean;
  onRemove?: () => void;
  showComment?: boolean;
  onClick?: () => void;
}

export default function BookCardSmall({
  book,
  showRemove,
  onRemove,
  showComment,
  onClick,
}: BookCardSmallProps) {
  return (
    <div
      className={`flex gap-4 p-4 bg-white rounded-xl border border-gray-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all' : ''
      }`}
      onClick={onClick}
    >
      {/* 표지 */}
      <div className="w-16 h-20 flex-shrink-0">
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{book.title}</h3>
        <p className="text-sm text-gray-500 truncate">{book.author}</p>

        {showComment && book.comment && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic">
            &ldquo;{book.comment}&rdquo;
          </p>
        )}

        {book.memo && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
            메모: {book.memo}
          </p>
        )}
      </div>

      {/* 삭제 버튼 */}
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors self-start"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
