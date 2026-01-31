import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProgramForm from '@/components/club/admin/ProgramForm';

export const metadata = { title: '프로그램 생성' };

export default function NewProgramPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/club/admin/programs"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="뒤로"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로그램 생성</h1>
          <p className="text-gray-500 mt-1">새 프로그램을 생성합니다.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProgramForm mode="create" />
      </div>
    </div>
  );
}
