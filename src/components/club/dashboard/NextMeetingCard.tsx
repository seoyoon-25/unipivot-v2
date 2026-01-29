import { format, isToday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, MapPin, BookOpen } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '../ui/EmptyState';

interface Meeting {
  id: string;
  sessionNo: number;
  date: Date;
  location?: string | null;
  bookTitle?: string | null;
  bookAuthor?: string | null;
  program: {
    id: string;
    title: string;
    type: string;
  };
}

interface NextMeetingCardProps {
  meetings: Meeting[];
}

function formatMeetingDate(date: Date): string {
  if (isToday(date)) {
    return `오늘 ${format(date, 'a h:mm', { locale: ko })}`;
  }
  if (isTomorrow(date)) {
    return `내일 ${format(date, 'a h:mm', { locale: ko })}`;
  }
  return format(date, 'M월 d일 (EEE) a h:mm', { locale: ko });
}

export default function NextMeetingCard({ meetings }: NextMeetingCardProps) {
  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">다음 모임</h2>
        <EmptyState
          icon={Calendar}
          title="예정된 모임이 없습니다"
          description="7일 이내 모임이 없어요"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">다음 모임</h2>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <Link
            key={meeting.id}
            href={`/club/programs/${meeting.program.id}`}
            className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`
                px-2 py-0.5 rounded text-xs font-medium
                ${isToday(meeting.date)
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'}
              `}>
                {formatMeetingDate(meeting.date)}
              </span>
              <span className="text-xs text-gray-400">
                {meeting.sessionNo}회차
              </span>
            </div>

            <h3 className="font-medium text-gray-900 mb-2">
              {meeting.program.title}
            </h3>

            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              {meeting.bookTitle && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {meeting.bookTitle}
                </span>
              )}
              {meeting.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {meeting.location}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
