import { BookOpen, Target, PenSquare, Stamp } from 'lucide-react';

interface StatsCardProps {
  stats: {
    totalPrograms: number;
    attendanceRate: number;
    totalReviews: number;
    totalStamps: number;
  };
}

export default function StatsCard({ stats }: StatsCardProps) {
  const items = [
    { label: '참여 프로그램', value: stats.totalPrograms, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '출석률', value: `${stats.attendanceRate}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '독후감', value: stats.totalReviews, icon: PenSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '스탬프', value: stats.totalStamps, icon: Stamp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="club-card p-5 flex flex-col items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className={`text-2xl font-bold text-zinc-900`}>{item.value}</p>
            <p className="text-xs text-zinc-500">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
