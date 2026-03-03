import { BookOpen } from 'lucide-react';

interface BookshelfHeaderProps {
  totalCount: number;
  title?: string;
  description?: string;
}

export default function BookshelfHeader({
  totalCount,
  title = '유니피벗 진행도서',
  description,
}: BookshelfHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BookOpen className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
          {description && (
            <p className="text-zinc-500">{description}</p>
          )}
        </div>
      </div>
      <p className="text-sm text-zinc-400">
        총 <span className="font-medium text-zinc-600">{totalCount}권</span>의 책을 함께 읽었어요
      </p>
    </div>
  );
}
