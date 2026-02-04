'use client';

import Image from 'next/image';
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
      className={`flex gap-4 p-4 club-card ${
        onClick ? 'cursor-pointer club-card-hover' : ''
      }`}
      onClick={onClick}
    >
      {/* 표지 */}
      <div className="w-16 h-20 flex-shrink-0">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.title}
            width={64}
            height={80}
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-zinc-300" />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-zinc-900 truncate">{book.title}</h3>
        <p className="text-xs text-zinc-500 truncate">{book.author}</p>

        {showComment && book.comment && (
          <p className="text-sm text-zinc-600 mt-2 line-clamp-2 italic">
            &ldquo;{book.comment}&rdquo;
          </p>
        )}

        {book.memo && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
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
          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-50 transition-colors duration-200 self-start"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
