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
    { label: '참여 프로그램', value: stats.totalPrograms, color: 'text-blue-600' },
    { label: '출석률', value: `${stats.attendanceRate}%`, color: 'text-green-600' },
    { label: '독후감', value: stats.totalReviews, color: 'text-purple-600' },
    { label: '스탬프', value: stats.totalStamps, color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center"
        >
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          <p className="text-sm text-gray-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
