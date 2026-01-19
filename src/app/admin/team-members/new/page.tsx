import { Metadata } from 'next';
import TeamMemberForm from '../TeamMemberForm';

export const metadata: Metadata = {
  title: '팀 멤버 추가 | 어드민',
};

export default function NewTeamMemberPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">팀 멤버 추가</h1>
        <p className="text-gray-600 mt-1">
          새로운 팀 멤버를 등록합니다.
        </p>
      </div>

      <TeamMemberForm />
    </div>
  );
}
