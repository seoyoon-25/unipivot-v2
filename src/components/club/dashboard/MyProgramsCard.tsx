import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import EmptyState from '../ui/EmptyState';

interface Program {
  id: string;
  title: string;
  type: string;
  status: string;
  image?: string | null;
  totalSessions: number;
  nextSession?: {
    sessionNo: number;
    date: Date;
  } | null;
}

interface MyProgramsCardProps {
  programs: Program[];
}

const programTypeLabels: Record<string, string> = {
  BOOKCLUB: '독서모임',
  SEMINAR: '강연',
  KMOVE: 'K-Move',
  DEBATE: '토론회',
};

export default function MyProgramsCard({ programs }: MyProgramsCardProps) {
  if (programs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">참여 중인 프로그램</h2>
        <EmptyState
          icon={BookOpen}
          title="참여 중인 프로그램이 없습니다"
          description="새로운 프로그램에 참여해보세요"
          actionLabel="프로그램 둘러보기"
          actionHref="/programs"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">참여 중인 프로그램</h2>
        <Link
          href="/club/programs"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          전체보기 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {programs.slice(0, 3).map((program) => (
          <Link
            key={program.id}
            href={`/club/programs/${program.id}`}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {program.image ? (
              <Image
                src={program.image}
                alt={program.title}
                width={56}
                height={56}
                className="w-14 h-14 rounded-lg object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  {programTypeLabels[program.type] || program.type}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 truncate">
                {program.title}
              </h3>
              {program.nextSession && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  다음 모임: {format(program.nextSession.date, 'M/d (EEE)', { locale: ko })}
                </p>
              )}
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
