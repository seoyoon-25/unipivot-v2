import BookCard from './BookCard';
import EmptyState from '../ui/EmptyState';
import { BookOpen } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author?: string | null;
  image?: string | null;
  season?: string | null;
  reportCount: number;
}

interface BookGridProps {
  books: Book[];
  emptyMessage?: string;
}

export default function BookGrid({ books, emptyMessage }: BookGridProps) {
  if (books.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyMessage || '책이 없습니다'}
        description="아직 함께 읽은 책이 없어요"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
