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
      hoverBorder: 'hover:border-blue-300',
      iconColor: 'text-blue-600',
    },
    {
      name: '출석 체크',
      href: '/club/attendance',
      icon: CheckSquare,
      bgColor: 'bg-green-50',
      hoverBorder: 'hover:border-green-300',
      iconColor: 'text-green-600',
      highlight: hasTodayMeeting,
    },
    {
      name: '책장 보기',
      href: '/club/bookclub/bookshelf',
      icon: BookOpen,
      bgColor: 'bg-purple-50',
      hoverBorder: 'hover:border-purple-300',
      iconColor: 'text-purple-600',
    },
    {
      name: '명문장',
      href: '/club/bookclub/quotes',
      icon: Quote,
      bgColor: 'bg-amber-50',
      hoverBorder: 'hover:border-amber-300',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          className={`
            relative bg-white rounded-xl p-4 border border-gray-200
            ${action.hoverBorder} hover:shadow-md transition-all
            flex flex-col items-center gap-2 text-center
          `}
        >
          {action.highlight && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
          <div className={`p-2.5 ${action.bgColor} rounded-lg`}>
            <action.icon className={`w-5 h-5 ${action.iconColor}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">{action.name}</span>
        </Link>
      ))}
    </div>
  );
}
