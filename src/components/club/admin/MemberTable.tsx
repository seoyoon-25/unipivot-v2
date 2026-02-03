'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, UserCog, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import RoleChangeModal from './RoleChangeModal';

interface Member {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string | Date;
  programCount: number;
  attendanceRate: number;
}

interface Props {
  members: Member[];
  currentPage: number;
  totalPages: number;
}

const ROLE_LABELS: Record<string, string> = {
  USER: '회원',
  FACILITATOR: '운영진',
  ADMIN: '관리자',
  SUPER_ADMIN: '최고관리자',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  FACILITATOR: 'bg-blue-100 text-blue-700',
  USER: 'bg-gray-100 text-gray-600',
};

function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return format(d, 'yyyy.M.d', { locale: ko });
}

export default function MemberTable({ members, currentPage, totalPages }: Props) {
  const searchParams = useSearchParams();
  const [roleModalUser, setRoleModalUser] = useState<Member | null>(null);

  const pageUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) {
        params.set('page', String(page));
      } else {
        params.delete('page');
      }
      const qs = params.toString();
      return `/club/admin/members${qs ? `?${qs}` : ''}`;
    },
    [searchParams]
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">회원</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">역할</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">가입일</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">프로그램</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">출석률</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    회원이 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const roleLabel = ROLE_LABELS[member.role] ?? member.role;
                  const roleColor = ROLE_COLORS[member.role] ?? 'bg-gray-100 text-gray-500';

                  return (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      {/* 회원 */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/club/admin/members/${member.id}`}
                          className="flex items-center gap-2.5 hover:text-blue-600"
                        >
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt=""
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                              {(member.name || '?').charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {member.name || '(이름 없음)'}
                          </span>
                        </Link>
                      </td>

                      {/* 이메일 */}
                      <td className="px-4 py-3 text-gray-500">{member.email}</td>

                      {/* 역할 */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${roleColor}`}
                        >
                          {(member.role === 'ADMIN' || member.role === 'SUPER_ADMIN') && (
                            <Shield className="w-3 h-3" />
                          )}
                          {roleLabel}
                        </span>
                      </td>

                      {/* 가입일 */}
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(member.createdAt)}
                      </td>

                      {/* 프로그램 */}
                      <td className="px-4 py-3 text-center text-gray-500">
                        {member.programCount}개
                      </td>

                      {/* 출석률 */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            member.attendanceRate >= 80
                              ? 'text-green-600'
                              : member.attendanceRate >= 50
                                ? 'text-amber-600'
                                : 'text-red-600'
                          }
                        >
                          {member.attendanceRate}%
                        </span>
                      </td>

                      {/* 액션 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/club/admin/members/${member.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="상세보기"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setRoleModalUser(member)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="역할변경"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={pageUrl(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              이전
            </span>
          )}
          <span className="px-3 py-2 text-sm text-gray-500">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={pageUrl(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
              다음
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}

      {/* 역할 변경 모달 */}
      {roleModalUser && (
        <RoleChangeModal
          user={roleModalUser}
          onClose={() => setRoleModalUser(null)}
        />
      )}
    </>
  );
}
