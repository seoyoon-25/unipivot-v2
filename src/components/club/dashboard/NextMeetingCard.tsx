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
      <div className="club-card p-5">
        <h2 className="club-section-title mb-4">다음 모임</h2>
        <EmptyState
          icon={Calendar}
          title="예정된 모임이 없습니다"
          description="7일 이내 모임이 없어요"
        />
      </div>
    );
  }

  const firstMeeting = meetings[0];
  const isFirstToday = isToday(firstMeeting.date);

  return (
    <div className="space-y-4">
      {/* Featured next meeting */}
      <Link
        href={`/club/programs/${firstMeeting.program.id}`}
        className="block rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <p className="text-xs text-blue-200 font-medium mb-1">
          {firstMeeting.sessionNo}회차
        </p>
        <p className="text-sm text-blue-200 font-medium mb-2">
          {formatMeetingDate(firstMeeting.date)}
        </p>
        <h3 className="text-lg font-bold mb-3">
          {firstMeeting.program.title}
        </h3>

        <div className="flex flex-wrap gap-3 text-sm text-blue-200 mb-4">
          {firstMeeting.bookTitle && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {firstMeeting.bookTitle}
            </span>
          )}
          {firstMeeting.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {firstMeeting.location}
            </span>
          )}
        </div>

        {isFirstToday && (
          <span className="inline-flex items-center justify-center bg-white text-blue-700 rounded-xl h-10 px-5 text-sm font-semibold hover:bg-blue-50 transition-colors duration-200">
            출석하기
          </span>
        )}
      </Link>

      {/* Additional meetings */}
      {meetings.length > 1 && (
        <div className="club-card p-5">
          <h2 className="club-section-title mb-3">예정된 모임</h2>
          <div className="space-y-3">
            {meetings.slice(1).map((meeting) => (
              <Link
                key={meeting.id}
                href={`/club/programs/${meeting.program.id}`}
                className="block p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    {formatMeetingDate(meeting.date)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {meeting.sessionNo}회차
                  </span>
                </div>

                <h3 className="font-medium text-zinc-900 mb-1">
                  {meeting.program.title}
                </h3>

                <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                  {meeting.bookTitle && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {meeting.bookTitle}
                    </span>
                  )}
                  {meeting.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {meeting.location}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
