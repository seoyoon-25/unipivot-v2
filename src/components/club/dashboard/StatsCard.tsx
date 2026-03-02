'use client';

import { BookOpen, Target, PenSquare, Stamp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  stats: {
    totalPrograms: number;
    attendanceRate: number;
    totalReviews: number;
    totalStamps: number;
  };
}

const statItems = [
  {
    key: 'totalPrograms',
    label: '참여 프로그램',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-indigo-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    key: 'attendanceRate',
    label: '출석률',
    icon: Target,
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    suffix: '%',
  },
  {
    key: 'totalReviews',
    label: '독후감',
    icon: PenSquare,
    gradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    key: 'totalStamps',
    label: '스탬프',
    icon: Stamp,
    gradient: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
];

export default function StatsCard({ stats }: StatsCardProps) {
  const getValue = (key: string) => {
    switch (key) {
      case 'totalPrograms':
        return stats.totalPrograms;
      case 'attendanceRate':
        return stats.attendanceRate;
      case 'totalReviews':
        return stats.totalReviews;
      case 'totalStamps':
        return stats.totalStamps;
      default:
        return 0;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const value = getValue(item.key);

        return (
          <div
            key={item.key}
            className={cn(
              'group relative club-card p-5 flex flex-col items-center gap-3 overflow-hidden',
              'opacity-0 club-animate-in',
              `club-stagger-${index + 1}`
            )}
          >
            {/* Background blur decoration */}
            <div
              className={cn(
                'absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-30',
                `bg-gradient-to-br ${item.gradient}`
              )}
            />

            {/* Icon with gradient background */}
            <div
              className={cn(
                'relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110',
                `bg-gradient-to-br ${item.gradient}`
              )}
              style={{
                boxShadow: `0 8px 16px -4px ${item.gradient.includes('indigo') ? 'rgba(99, 102, 241, 0.3)' :
                  item.gradient.includes('emerald') ? 'rgba(16, 185, 129, 0.3)' :
                    item.gradient.includes('purple') ? 'rgba(139, 92, 246, 0.3)' :
                      'rgba(245, 158, 11, 0.3)'
                  }`
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Value */}
            <p className="relative text-2xl font-bold text-stone-900">
              {value}{item.suffix || ''}
            </p>

            {/* Label */}
            <p className="relative text-xs font-medium text-stone-500 uppercase tracking-wider">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
