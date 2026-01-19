'use client';

import { useState, useTransition } from 'react';
import { Plus, BookOpen, User2, Building, FileText, Loader2, X, Check } from 'lucide-react';
import { createBookSuggestion } from '@/lib/actions/books';

interface BookSuggestionFormProps {
  isLoggedIn: boolean;
}

export default function BookSuggestionForm({ isLoggedIn }: BookSuggestionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      window.location.href = `/login?callbackUrl=/books`;
      return;
    }

    if (!formData.title.trim()) {
      setError('책 제목을 입력해주세요.');
      return;
    }

    setError('');

    startTransition(async () => {
      const result = await createBookSuggestion({
        title: formData.title.trim(),
        author: formData.author.trim() || undefined,
        publisher: formData.publisher.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setFormData({ title: '', author: '', publisher: '', description: '' });
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 2000);
      } else {
        setError(result.error || '등록에 실패했습니다.');
      }
    });
  };

  if (!isOpen) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-orange-100 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📖</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          읽고 싶은 책이 있으신가요?
        </h3>
        <p className="text-gray-600 mb-6">
          다음 독서모임에서 함께 읽고 싶은 책을 등록해주세요!
        </p>
        <button
          onClick={() => {
            if (!isLoggedIn) {
              window.location.href = `/login?callbackUrl=/books`;
              return;
            }
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          책 등록하기
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          등록 완료!
        </h3>
        <p className="text-gray-600">
          책이 성공적으로 등록되었습니다. 많은 투표 부탁드려요!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          책 등록하기
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 책 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            책 제목 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="읽고 싶은 책 제목을 입력하세요"
              required
            />
          </div>
        </div>

        {/* 저자 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">저자</label>
          <div className="relative">
            <User2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="저자 이름"
            />
          </div>
        </div>

        {/* 출판사 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">출판사</label>
          <div className="relative">
            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="출판사 이름"
            />
          </div>
        </div>

        {/* 추천 이유 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">추천 이유</label>
          <div className="relative">
            <FileText className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={3}
              placeholder="이 책을 추천하는 이유를 간단히 적어주세요"
              maxLength={200}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">
            {formData.description.length}/200
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                등록 중...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                등록하기
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
