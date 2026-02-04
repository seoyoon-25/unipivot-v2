'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ProgramSession {
  id: string;
  sessionNo: number;
  date: string;
  title: string | null;
}

interface ProgramCardProps {
  program: {
    id: string;
    title: string;
    type: string;
    status: string;
    image: string | null;
    thumbnailSquare: string | null;
    participantCount: number;
    sessions: ProgramSession[];
    myRole: string;
  };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  RECRUITING: { label: '모집중', color: 'bg-blue-50 text-blue-700' },
  ONGOING: { label: '진행중', color: 'bg-emerald-50 text-emerald-700' },
  COMPLETED: { label: '완료', color: 'bg-zinc-100 text-zinc-500' },
};

const TYPE_MAP: Record<string, string> = {
  BOOKCLUB: '독서모임',
  SEMINAR: '강연',
  DEBATE: '토론회',
  KMOVE: 'K-Move',
};

function getNextSession(sessions: ProgramSession[]): ProgramSession | null {
  const now = new Date();
  return (
    sessions.find((s) => new Date(s.date) >= now) ?? null
  );
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const statusInfo = STATUS_MAP[program.status] ?? {
    label: program.status,
    color: 'bg-zinc-100 text-zinc-500',
  };
  const typeLabel = TYPE_MAP[program.type] ?? program.type;
  const thumbnail = program.thumbnailSquare || program.image;
  const nextSession = getNextSession(program.sessions);

  return (
    <Link
      href={`/club/programs/${program.id}`}
      className="group club-card club-card-hover overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] bg-zinc-100 relative overflow-hidden rounded-t-2xl">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={program.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
            <BookOpen className="w-12 h-12 text-zinc-300" />
          </div>
        )}

        {/* Status badge */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Type label */}
        <span className="text-xs text-zinc-400 font-medium">{typeLabel}</span>

        {/* Title */}
        <h3 className="text-base font-bold text-zinc-900 line-clamp-2 mt-1 group-hover:text-blue-600 transition-colors duration-200">
          {program.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {program.participantCount}명
          </span>
          {nextSession && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(nextSession.date), 'M/d(EEE)', { locale: ko })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
