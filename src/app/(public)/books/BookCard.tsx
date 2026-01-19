'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Heart, Trash2, Award, User, Loader2 } from 'lucide-react';
import { toggleVote, deleteBookSuggestion } from '@/lib/actions/books';

interface BookSuggestion {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  image: string | null;
  description: string | null;
  voteCount: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface BookCardProps {
  suggestion: BookSuggestion;
  rank?: number;
  isVoted: boolean;
  isLoggedIn: boolean;
  isOwner: boolean;
}

export default function BookCard({
  suggestion,
  rank,
  isVoted: initialIsVoted,
  isLoggedIn,
  isOwner,
}: BookCardProps) {
  const [isVoted, setIsVoted] = useState(initialIsVoted);
  const [voteCount, setVoteCount] = useState(suggestion.voteCount);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleVote = () => {
    if (!isLoggedIn) {
      window.location.href = `/login?callbackUrl=/books`;
      return;
    }

    startTransition(async () => {
      const result = await toggleVote(suggestion.id);
      if (result.success) {
        setIsVoted(result.voted!);
        setVoteCount((prev) => (result.voted ? prev + 1 : prev - 1));
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBookSuggestion(suggestion.id);
      if (result.success) {
        setShowDeleteConfirm(false);
        // Page will revalidate
      } else {
        alert(result.error);
      }
    });
  };

  const getRankBadge = () => {
    if (!rank) return null;
    if (rank === 1) return { bg: 'bg-yellow-500', text: '🥇 1위' };
    if (rank === 2) return { bg: 'bg-gray-400', text: '🥈 2위' };
    if (rank === 3) return { bg: 'bg-amber-600', text: '🥉 3위' };
    return null;
  };

  const rankBadge = getRankBadge();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* 이미지 영역 */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {suggestion.image ? (
          <Image
            src={suggestion.image}
            alt={suggestion.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">📚</div>
          </div>
        )}

        {/* 랭킹 뱃지 */}
        {rankBadge && (
          <div className={`absolute top-3 left-3 px-3 py-1 ${rankBadge.bg} text-white text-sm font-bold rounded-full`}>
            {rankBadge.text}
          </div>
        )}

        {/* 투표 버튼 */}
        <button
          onClick={handleVote}
          disabled={isPending}
          className={`
            absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all
            ${isVoted
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-500'
            }
            ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
          `}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${isVoted ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-5 flex flex-col flex-1">
        {/* 제목 */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
          {suggestion.title}
        </h3>

        {/* 저자/출판사 */}
        {(suggestion.author || suggestion.publisher) && (
          <p className="text-sm text-gray-500 mb-3">
            {suggestion.author}
            {suggestion.author && suggestion.publisher && ' · '}
            {suggestion.publisher}
          </p>
        )}

        {/* 추천 이유 */}
        {suggestion.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 bg-gray-50 p-3 rounded-lg">
            &ldquo;{suggestion.description}&rdquo;
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* 하단 정보 */}
        <div className="flex items-center justify-between pt-4 border-t">
          {/* 추천인 */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>{suggestion.user.name || '익명'}</span>
          </div>

          {/* 투표 수 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <Heart className="w-4 h-4 fill-current" />
              <span>{voteCount}</span>
            </div>

            {/* 삭제 버튼 (본인만) */}
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              책 삭제
            </h3>
            <p className="text-gray-600 mb-6">
              &ldquo;{suggestion.title}&rdquo;을(를) 삭제하시겠습니까?
              <br />
              <span className="text-red-500 text-sm">삭제하면 투표도 함께 사라집니다.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
