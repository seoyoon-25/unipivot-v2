import Link from 'next/link';
import { MessageSquare, CheckSquare, BookOpen, Quote } from 'lucide-react';

interface QuickActionsCardProps {
  hasTodayMeeting?: boolean;
}

export default function QuickActionsCard({ hasTodayMeeting }: QuickActionsCardProps) {
  const actions = [
    {
      name: '독후감 쓰기',
      href: '/club/bookclub/reviews/write',
      icon: MessageSquare,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: '출석 체크',
      href: '/club/attendance',
      icon: CheckSquare,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      highlight: hasTodayMeeting,
    },
    {
      name: '책장 보기',
      href: '/club/bookclub/bookshelf',
      icon: BookOpen,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      name: '명문장',
      href: '/club/bookclub/quotes',
      icon: Quote,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          className="group relative club-card flex flex-col items-center gap-2 p-4 text-center hover:bg-zinc-50 transition-colors duration-200"
        >
          {action.highlight && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
          )}
          <div className={`w-12 h-12 rounded-2xl ${action.bgColor} flex items-center justify-center group-hover:-translate-y-0.5 transition-transform duration-200`}>
            <action.icon className={`w-5 h-5 ${action.iconColor}`} />
          </div>
          <span className="text-sm font-medium text-zinc-700">{action.name}</span>
        </Link>
      ))}
    </div>
  );
}
