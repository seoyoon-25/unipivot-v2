'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { UserCog } from 'lucide-react';
import RoleChangeModal from './RoleChangeModal';

interface Props {
  member: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    createdAt: string | Date;
  };
}

const roleLabels: Record<string, string> = {
  USER: '회원',
  FACILITATOR: '운영진',
  ADMIN: '관리자',
  SUPER_ADMIN: '최고관리자',
};

const roleColors: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-700',
  FACILITATOR: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700',
};

export default function MemberDetailCard({ member }: Props) {
  const [showRoleModal, setShowRoleModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {/* 프로필 이미지 */}
          {member.image ? (
            <Image
              src={member.image}
              alt=""
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
              {member.name?.[0] || '?'}
            </div>
          )}

          {/* 정보 */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {member.name || '(이름 없음)'}
            </h1>
            <p className="text-gray-500 mt-1">{member.email}</p>

            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {/* 역할 */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${roleColors[member.role] || 'bg-gray-100 text-gray-700'}`}
                >
                  {roleLabels[member.role] || member.role}
                </span>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                  title="역할 변경"
                >
                  <UserCog className="w-4 h-4" />
                </button>
              </div>

              {/* 가입일 */}
              <span className="text-sm text-gray-500">
                가입일:{' '}
                {format(new Date(member.createdAt), 'yyyy년 M월 d일', {
                  locale: ko,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 역할 변경 모달 */}
      {showRoleModal && (
        <RoleChangeModal
          user={member}
          onClose={() => setShowRoleModal(false)}
        />
      )}
    </>
  );
}
