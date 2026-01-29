import { Check } from 'lucide-react';

interface Props {
  programTitle: string;
  totalSlots: number;
  stamps: { sessionNo: number; date: Date }[];
}

export default function StampCard({ programTitle, totalSlots, stamps }: Props) {
  const stampedSessions = new Set(stamps.map((s) => s.sessionNo));
  const count = stamps.length;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
      <h3 className="font-bold text-gray-900 mb-4">{programTitle}</h3>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: totalSlots }, (_, i) => i + 1).map((slot) => (
          <div
            key={slot}
            className={`aspect-square rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
              stampedSessions.has(slot)
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white border-2 border-dashed border-amber-300 text-amber-300'
            }`}
          >
            {stampedSessions.has(slot) ? <Check className="w-6 h-6" /> : slot}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-gray-500">{count} / {totalSlots} 스탬프</span>
        <span className="text-amber-600 font-medium">{totalSlots > 0 ? Math.round((count / totalSlots) * 100) : 0}% 달성</span>
      </div>
    </div>
  );
}
