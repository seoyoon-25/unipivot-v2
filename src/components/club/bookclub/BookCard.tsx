import Link from 'next/link';
import Image from 'next/image';
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
      className="group club-card club-card-hover overflow-hidden"
    >
      {/* 책 표지 */}
      <div className="aspect-[3/4] bg-zinc-100 relative overflow-hidden rounded-t-2xl">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
            <BookOpen className="w-12 h-12 text-zinc-300" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {book.reportCount > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs">
            <MessageSquare className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-zinc-700">{book.reportCount}</span>
          </div>
        )}
      </div>

      {/* 책 정보 */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-zinc-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors duration-200">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs text-zinc-500 mb-2">{book.author}</p>
        )}
        {book.season && (
          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-xs font-medium rounded-full">
            {book.season}
          </span>
        )}
      </div>
    </Link>
  );
}
