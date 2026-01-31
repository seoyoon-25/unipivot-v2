'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import { Plus, Trash2, User } from 'lucide-react';
import { removeParticipant } from '@/app/club/(admin)/admin/programs/actions';
import AddParticipantModal from './AddParticipantModal';

interface Participant {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  status: string;
  joinedAt: string | Date;
}

interface ProgramEditParticipantsProps {
  participants: Participant[];
  programId: string;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '활동중',
  INACTIVE: '비활동',
  WITHDRAWN: '탈퇴',
};

function formatJoinedAt(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return format(d, 'yyyy.MM.dd', { locale: ko });
}

export default function ProgramEditParticipants({
  participants,
  programId,
}: ProgramEditParticipantsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleRemove = (participantId: string, userName: string | null) => {
    const name = userName || '이름 없음';
    if (!confirm(`"${name}" 참가자를 제거하시겠습니까?`)) return;

    setRemovingId(participantId);
    setError(null);

    startTransition(async () => {
      try {
        const result = await removeParticipant(participantId, programId);
        if (result?.error) {
          setError(result.error);
        } else {
          router.refresh();
        }
      } catch {
        setError('참가자 제거 중 오류가 발생했습니다.');
      } finally {
        setRemovingId(null);
      }
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            참가자 목록 ({participants.length}명)
          </h3>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            참가자 추가
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {participants.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            등록된 참가자가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {participant.user.image ? (
                      <Image
                        src={participant.user.image}
                        alt={participant.user.name || ''}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {participant.user.name || '이름 없음'}
                      </span>
                      <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                        {STATUS_LABELS[participant.status] ?? participant.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{participant.user.email || '-'}</span>
                      <span className="text-gray-300">|</span>
                      <span>가입: {formatJoinedAt(participant.joinedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() =>
                    handleRemove(participant.id, participant.user.name)
                  }
                  disabled={isPending || removingId === participant.id}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="제거"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 참가자 추가 모달 */}
      {showAddModal && (
        <AddParticipantModal
          programId={programId}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}
