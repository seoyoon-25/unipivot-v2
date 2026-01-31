import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sparkles } from 'lucide-react';

interface Props {
  program: {
    title: string;
    startDate: Date | null;
    endDate: Date | null;
  };
}

export default function RecapHeader({ program }: Props) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 mb-4">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">시즌 회고</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {program.title}
      </h1>

      {program.startDate && program.endDate && (
        <p className="text-gray-500">
          {format(new Date(program.startDate), 'yyyy.M.d', { locale: ko })}
          {' ~ '}
          {format(new Date(program.endDate), 'yyyy.M.d', { locale: ko })}
        </p>
      )}
    </div>
  );
}
