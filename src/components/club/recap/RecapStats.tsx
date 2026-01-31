import { Calendar, Users, CheckCircle, FileText } from 'lucide-react';

interface Props {
  recap: {
    totalSessions: number;
    totalParticipants: number;
    avgAttendanceRate: number;
    totalReports: number;
  };
}

const colorStyles: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function RecapStats({ recap }: Props) {
  const stats = [
    {
      label: '총 모임',
      value: `${recap.totalSessions}회`,
      icon: Calendar,
      color: 'blue',
    },
    {
      label: '참가자',
      value: `${recap.totalParticipants}명`,
      icon: Users,
      color: 'green',
    },
    {
      label: '평균 출석률',
      value: `${recap.avgAttendanceRate}%`,
      icon: CheckCircle,
      color: 'amber',
    },
    {
      label: '작성된 독후감',
      value: `${recap.totalReports}개`,
      icon: FileText,
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center"
          >
            <div
              className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${colorStyles[stat.color]}`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
