'use client';

import Link from 'next/link';
import { MessageSquare, CheckSquare, BookOpen, Quote, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsCardProps {
  hasTodayMeeting?: boolean;
}

const actions = [
  {
    name: '독후감 쓰기',
    href: '/club/bookclub/reviews/write',
    icon: MessageSquare,
    gradient: 'from-indigo-500 to-indigo-600',
    shadowColor: 'rgba(99, 102, 241, 0.25)',
    hoverBorder: 'hover:border-indigo-200',
  },
  {
    name: '출석 체크',
    href: '/club/attendance',
    icon: CheckSquare,
    gradient: 'from-emerald-500 to-emerald-600',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    hoverBorder: 'hover:border-emerald-200',
    highlightKey: 'hasTodayMeeting',
  },
  {
    name: '진행도서 보기',
    href: '/club/bookclub/bookshelf',
    icon: BookOpen,
    gradient: 'from-purple-500 to-purple-600',
    shadowColor: 'rgba(139, 92, 246, 0.25)',
    hoverBorder: 'hover:border-purple-200',
  },
  {
    name: '명문장',
    href: '/club/bookclub/quotes',
    icon: Quote,
    gradient: 'from-amber-500 to-amber-600',
    shadowColor: 'rgba(245, 158, 11, 0.25)',
    hoverBorder: 'hover:border-amber-200',
  },
];

export default function QuickActionsCard({ hasTodayMeeting }: QuickActionsCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, index) => {
        const isHighlighted = action.highlightKey === 'hasTodayMeeting' && hasTodayMeeting;

        return (
          <Link
            key={action.name}
            href={action.href}
            className={cn(
              'group relative flex flex-col items-center gap-3 p-5 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-white/50 transition-all duration-200',
              action.hoverBorder,
              'hover:bg-white hover:shadow-lg hover:-translate-y-1',
              isHighlighted && 'border-indigo-300 bg-indigo-50/50',
              'opacity-0 club-animate-in',
              `club-stagger-${index + 1}`
            )}
          >
            {/* Highlight pulse for today's meeting */}
            {isHighlighted && (
              <>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
              </>
            )}

            {/* Icon with gradient background */}
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200',
                'group-hover:scale-110 group-hover:rotate-3',
                `bg-gradient-to-br ${action.gradient}`
              )}
              style={{ boxShadow: `0 8px 20px -4px ${action.shadowColor}` }}
            >
              <action.icon className="w-6 h-6 text-white" />
            </div>

            {/* Label with arrow */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">
                {action.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
            </div>

            {/* Today indicator */}
            {isHighlighted && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500 text-white shadow-sm">
                오늘 모임
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
