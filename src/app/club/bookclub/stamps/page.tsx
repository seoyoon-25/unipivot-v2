import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMyStamps } from '@/lib/club/stamp-queries';
import StampCard from '@/components/club/bookclub/StampCard';
import { Award } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const metadata = { title: '스탬프' };

export default async function StampsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const stamps = await getMyStamps(session.user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Award className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">스탬프</h1>
          <p className="text-gray-500">총 {stamps.total}개 적립</p>
        </div>
      </div>

      {stamps.programs.length > 0 ? (
        <div className="space-y-6">
          {stamps.programs.map((program) => (
            <StampCard
              key={program.id}
              programTitle={program.title}
              totalSlots={12}
              stamps={program.stamps}
            />
          ))}
        </div>
      ) : (
        <StampCard programTitle="독서모임 시즌" totalSlots={12} stamps={[]} />
      )}

      <div className="mt-8">
        <h2 className="font-semibold text-gray-900 mb-4">적립 내역</h2>
        <div className="bg-white rounded-xl border divide-y">
          {stamps.history.length === 0 ? (
            <p className="p-8 text-center text-gray-500">적립 내역이 없습니다.</p>
          ) : (
            stamps.history.slice(0, 20).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{item.programTitle}</p>
                  <p className="text-sm text-gray-500">{item.sessionNo}회차 출석</p>
                </div>
                <div className="text-right">
                  <span className="text-amber-600 font-medium">+1</span>
                  <p className="text-xs text-gray-400">{format(new Date(item.date), 'M.d', { locale: ko })}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
