'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpen, Heart, Bookmark } from 'lucide-react';

const tabs = [
  { id: 'read', label: '읽은 책', icon: BookOpen },
  { id: 'wish', label: '읽고 싶은 책', icon: Bookmark },
  { id: 'favorite', label: '인생 책', icon: Heart },
] as const;

interface MyBookshelfTabsProps {
  counts: {
    readCount: number;
    wishCount: number;
    favoriteCount: number;
  };
}

export default function MyBookshelfTabs({ counts }: MyBookshelfTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'read';

  const handleTabChange = (tabId: string) => {
    router.push(`/club/bookclub/my-bookshelf?tab=${tabId}`);
  };

  const getCount = (tabId: string) => {
    switch (tabId) {
      case 'read': return counts.readCount;
      case 'wish': return counts.wishCount;
      case 'favorite': return counts.favoriteCount;
      default: return 0;
    }
  };

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;
        const count = getCount(tab.id);

        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
