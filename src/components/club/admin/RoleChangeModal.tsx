'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { changeUserRole } from '@/app/club/(admin)/admin/members/actions';

interface Props {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  onClose: () => void;
}

const roles = [
  { value: 'USER', label: '회원', description: '기본 기능만 사용 가능' },
  {
    value: 'FACILITATOR',
    label: '운영진',
    description: '진행자 도구 + 관리자 일부 기능',
  },
  { value: 'ADMIN', label: '관리자', description: '모든 기능 사용 가능' },
];

export default function RoleChangeModal({ user, onClose }: Props) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useFocusTrap<HTMLDivElement>(true);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [handleEsc]);

  const handleSubmit = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await changeUserRole(user.id, selectedRole);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      onClose();
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="role-modal-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="role-modal-title" className="text-lg font-semibold">역할 변경</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4">
          {/* 대상 회원 정보 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">
              {user.name || '(이름 없음)'}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {/* 역할 선택 */}
          <div className="space-y-2">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedRole === role.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{role.label}</p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* 경고 */}
          {selectedRole !== user.role && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                역할 변경 시 해당 회원의 접근 권한이 즉시 변경됩니다.
              </p>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isSubmitting ? '변경 중...' : '변경하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
