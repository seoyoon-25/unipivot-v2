import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BookOpen, Calendar } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

interface ReadBook {
  id: string;
  title: string;
  author: string;
  image?: string | null;
  program?: {
    id: string;
    title: string;
  } | null;
  readDate?: Date | null;
}

interface ReadBooksTabProps {
  books: ReadBook[];
}

export default function ReadBooksTab({ books }: ReadBooksTabProps) {
  if (books.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="아직 읽은 책이 없어요"
        description="독서모임에 참여해서 함께 책을 읽어보세요"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {books.map((book) => (
        <div
          key={book.id}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {/* 표지 */}
          <div className="aspect-[3/4] bg-gray-100 relative">
            {book.image ? (
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-300" />
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="p-3">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
              {book.title}
            </h3>
            <p className="text-xs text-gray-500 truncate">{book.author}</p>

            {book.readDate && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(book.readDate), 'yyyy.M', { locale: ko })}
              </p>
            )}

            {book.program && (
              <p className="text-xs text-blue-500 mt-1 truncate">
                {book.program.title}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
