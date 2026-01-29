import Link from 'next/link';
import { BookOpen, MessageSquare } from 'lucide-react';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author?: string | null;
    image?: string | null;
    season?: string | null;
    reportCount: number;
  };
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/club/bookclub/bookshelf/${book.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* 책 표지 */}
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {book.reportCount > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs">
            <MessageSquare className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-gray-700">{book.reportCount}</span>
          </div>
        )}
      </div>

      {/* 책 정보 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-sm text-gray-500 mb-2">{book.author}</p>
        )}
        {book.season && (
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
            {book.season}
          </span>
        )}
      </div>
    </Link>
  );
}
