'use client';

import { useState } from 'react';
import { togglePagePublished } from '@/lib/actions/pages';

interface PageToggleButtonProps {
  pageId: string;
  isPublished: boolean;
}

export default function PageToggleButton({ pageId, isPublished }: PageToggleButtonProps) {
  const [published, setPublished] = useState(isPublished);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await togglePagePublished(pageId);
      setPublished(!published);
    } catch (error) {
      console.error('Failed to toggle page status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-colors disabled:opacity-50
        ${published
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
      `}
    >
      <span className={`w-2 h-2 rounded-full ${published ? 'bg-green-500' : 'bg-gray-400'}`} />
      {loading ? '처리중...' : published ? '공개' : '비공개'}
    </button>
  );
}
