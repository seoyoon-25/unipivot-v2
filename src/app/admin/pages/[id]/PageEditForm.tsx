'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePage } from '@/lib/actions/pages';
import Link from 'next/link';

interface Page {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  unpublishedMessage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

interface PageEditFormProps {
  page: Page;
}

export default function PageEditForm({ page }: PageEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: page.title,
    description: page.description || '',
    isPublished: page.isPublished,
    unpublishedMessage: page.unpublishedMessage || '페이지 준비 중입니다.',
    seoTitle: page.seoTitle || '',
    seoDescription: page.seoDescription || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePage(page.id, formData);
      router.push('/admin/pages');
      router.refresh();
    } catch (error) {
      console.error('Failed to update page:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* 기본 정보 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                /{page.slug}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                페이지 제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* 공개 설정 */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">공개 설정</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">공개 상태</p>
                <p className="text-sm text-gray-500">
                  비공개 시 메뉴에 표시되지 않습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${formData.isPublished ? 'bg-orange-500' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${formData.isPublished ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {!formData.isPublished && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비공개 시 표시 메시지
                </label>
                <textarea
                  value={formData.unpublishedMessage}
                  onChange={(e) => setFormData({ ...formData, unpublishedMessage: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* SEO 설정 */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO 설정</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO 제목
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder={`${formData.title} | 유니피벗`}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO 설명
              </label>
              <textarea
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${page.slug}?preview=true`}
          target="_blank"
          className="text-gray-600 hover:text-gray-900"
        >
          미리보기
        </Link>

        <div className="flex gap-3">
          <Link
            href="/admin/pages"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </form>
  );
}
