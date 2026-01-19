'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { deleteTeamMember, updateTeamMember } from '@/lib/actions/team-members';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  position: string | null;
  photo: string | null;
  programs: string | null;
  introduction: string | null;
  period: string | null;
  displayOrder: number;
  isVisible: boolean;
}

interface TeamMemberListProps {
  staff: TeamMember[];
  advisors: TeamMember[];
  alumni: TeamMember[];
}

type TabType = 'STAFF' | 'ADVISOR' | 'ALUMNI';

export default function TeamMemberList({ staff, advisors, alumni }: TeamMemberListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('STAFF');

  const tabs = [
    { key: 'STAFF' as TabType, label: '운영진', count: staff.length },
    { key: 'ADVISOR' as TabType, label: '자문위원', count: advisors.length },
    { key: 'ALUMNI' as TabType, label: '역대 운영진', count: alumni.length },
  ];

  const currentMembers = activeTab === 'STAFF' ? staff
    : activeTab === 'ADVISOR' ? advisors
    : alumni;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name}님을 삭제하시겠습니까?`)) return;
    await deleteTeamMember(id);
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    await updateTeamMember(id, { isVisible: !isVisible });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* 탭 */}
      <div className="border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors
                ${activeTab === tab.key
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div className="divide-y">
        {currentMembers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            등록된 {tabs.find(t => t.key === activeTab)?.label}이 없습니다.
          </div>
        ) : (
          currentMembers.map((member) => {
            const programs = member.programs ? JSON.parse(member.programs) as string[] : [];

            return (
              <div
                key={member.id}
                className={`p-4 flex items-center gap-4 hover:bg-gray-50 ${!member.isVisible ? 'opacity-50' : ''}`}
              >
                {/* 드래그 핸들 */}
                <button className="text-gray-300 hover:text-gray-500 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </button>

                {/* 사진 */}
                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    {member.position && (
                      <span className="text-sm text-orange-500">{member.position}</span>
                    )}
                    {member.period && (
                      <span className="text-sm text-gray-400">({member.period})</span>
                    )}
                  </div>
                  {programs.length > 0 && (
                    <p className="text-sm text-gray-500 truncate">
                      {programs.join(', ')}
                    </p>
                  )}
                  {member.introduction && (
                    <p className="text-sm text-gray-400 truncate">
                      &ldquo;{member.introduction}&rdquo;
                    </p>
                  )}
                </div>

                {/* 표시 상태 */}
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${member.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                `}>
                  {member.isVisible ? '표시' : '숨김'}
                </span>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleVisibility(member.id, member.isVisible)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title={member.isVisible ? '숨기기' : '표시하기'}
                  >
                    {member.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <Link
                    href={`/admin/team-members/${member.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="편집"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
