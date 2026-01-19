'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createTeamMember, updateTeamMember, TeamMemberRole } from '@/lib/actions/team-members';
import { Upload } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  position: string | null;
  photo: string | null;
  programs: string | null;
  introduction: string | null;
  period: string | null;
  isVisible: boolean;
}

interface TeamMemberFormProps {
  member?: TeamMember;
}

const programOptions = [
  '독서모임',
  '강연 기획',
  '세미나',
  'K-Move',
  '토론회',
  '운영 총괄',
  '홍보',
  '재정',
];

export default function TeamMemberForm({ member }: TeamMemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const existingPrograms = member?.programs ? JSON.parse(member.programs) as string[] : [];

  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: (member?.role || 'STAFF') as TeamMemberRole,
    position: member?.position || '',
    photo: member?.photo || '',
    programs: existingPrograms,
    introduction: member?.introduction || '',
    period: member?.period || '',
    isVisible: member?.isVisible ?? true,
  });

  const handleProgramToggle = (program: string) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.includes(program)
        ? prev.programs.filter(p => p !== program)
        : [...prev.programs, program],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (member) {
        await updateTeamMember(member.id, formData);
      } else {
        await createTeamMember({
          name: formData.name,
          role: formData.role,
          position: formData.position || undefined,
          photo: formData.photo || undefined,
          programs: formData.programs.length > 0 ? formData.programs : undefined,
          introduction: formData.introduction || undefined,
          period: formData.period || undefined,
        });
      }
      router.push('/admin/team-members');
      router.refresh();
    } catch (error) {
      console.error('Failed to save team member:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* 사진 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사진
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              {formData.photo ? (
                <Image
                  src={formData.photo}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Upload className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                placeholder="이미지 URL 입력"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                이미지 URL을 입력하거나 업로드 기능을 사용하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름 *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* 구분 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            구분 *
          </label>
          <div className="flex gap-4">
            {[
              { value: 'STAFF', label: '운영진' },
              { value: 'ADVISOR', label: '자문위원' },
              { value: 'ALUMNI', label: '역대 운영진' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamMemberRole })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 직책 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            직책
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="예: 대표, 운영팀장"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* 참여 프로그램 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            참여 프로그램
          </label>
          <div className="flex flex-wrap gap-2">
            {programOptions.map((program) => (
              <button
                key={program}
                type="button"
                onClick={() => handleProgramToggle(program)}
                className={`
                  px-3 py-1.5 rounded-full text-sm border transition-colors
                  ${formData.programs.includes(program)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
                  }
                `}
              >
                {program}
              </button>
            ))}
          </div>
        </div>

        {/* 한줄 소개 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            한줄 소개
          </label>
          <textarea
            value={formData.introduction}
            onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
            rows={2}
            placeholder="예: 남북 청년이 함께하는 미래를 꿈꿉니다"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* 활동 기간 (역대 운영진만) */}
        {formData.role === 'ALUMNI' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              활동 기간
            </label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              placeholder="예: 2019-2022"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        )}

        {/* 표시 여부 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="font-medium text-gray-900">표시 여부</p>
            <p className="text-sm text-gray-500">
              페이지에 표시할지 여부를 선택합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${formData.isVisible ? 'bg-orange-500' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${formData.isVisible ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3">
        <Link
          href="/admin/team-members"
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? '저장 중...' : member ? '수정' : '추가'}
        </button>
      </div>
    </form>
  );
}
