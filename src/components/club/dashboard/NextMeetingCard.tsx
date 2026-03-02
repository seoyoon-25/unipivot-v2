'use client';

import { format, isToday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, MapPin, BookOpen, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
      <div className="club-card p-6 opacity-0 club-animate-in">
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
      {/* Hero Featured Meeting Card */}
      <Link
        href={`/club/programs/${firstMeeting.program.id}`}
        className="group relative block rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 opacity-0 club-animate-in"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #4338ca 100%)',
          boxShadow: '0 20px 40px -12px rgba(79, 70, 229, 0.35)',
        }}
      >
        {/* Mesh gradient overlay */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(129, 140, 248, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(67, 56, 202, 0.2) 0%, transparent 70%)
            `,
          }}
        />

        {/* Content */}
        <div className="relative p-6">
          {/* Session badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white/90 backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              {firstMeeting.sessionNo}회차
            </span>
            {isFirstToday && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/30">
                오늘
              </span>
            )}
          </div>

          {/* Date */}
          <p className="text-sm text-indigo-200 font-medium mb-2">
            {formatMeetingDate(firstMeeting.date)}
          </p>

          {/* Program title */}
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-100 transition-colors">
            {firstMeeting.program.title}
          </h3>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-sm text-indigo-200 mb-5">
            {firstMeeting.bookTitle && (
              <span className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-sm">
                <BookOpen className="w-4 h-4" />
                {firstMeeting.bookTitle}
              </span>
            )}
            {firstMeeting.location && (
              <span className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-sm">
                <MapPin className="w-4 h-4" />
                {firstMeeting.location}
              </span>
            )}
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold transition-all duration-200',
              isFirstToday
                ? 'bg-white text-indigo-700 shadow-lg hover:bg-indigo-50'
                : 'bg-white/15 text-white border border-white/20 hover:bg-white/25'
            )}>
              {isFirstToday ? '출석하기' : '자세히 보기'}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5" />
      </Link>

      {/* Additional meetings list */}
      {meetings.length > 1 && (
        <div className="club-card p-5 opacity-0 club-animate-in club-stagger-2">
          <h2 className="club-section-title mb-4">예정된 모임</h2>
          <div className="space-y-3">
            {meetings.slice(1).map((meeting, index) => (
              <Link
                key={meeting.id}
                href={`/club/programs/${meeting.program.id}`}
                className={cn(
                  'group block p-4 rounded-xl bg-stone-50 hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all duration-200',
                  'opacity-0 club-animate-in',
                  `club-stagger-${index + 3}`
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700">
                    {formatMeetingDate(meeting.date)}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    {meeting.sessionNo}회차
                  </span>
                </div>

                <h3 className="font-semibold text-stone-900 mb-2 group-hover:text-indigo-700 transition-colors flex items-center gap-1">
                  {meeting.program.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-indigo-500" />
                </h3>

                <div className="flex flex-wrap gap-3 text-xs text-stone-500">
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
