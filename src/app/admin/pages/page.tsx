import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPages } from '@/lib/actions/pages';
import PageToggleButton from './PageToggleButton';
import { Eye, Pencil } from 'lucide-react';

export const metadata: Metadata = {
  title: '페이지 관리 | 어드민',
};

export default async function AdminPagesPage() {
  const pages = await getAllPages();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">페이지 관리</h1>
        <p className="text-gray-600 mt-1">
          페이지 공개/비공개 상태를 관리합니다.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                페이지
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                URL
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                메뉴 그룹
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                상태
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{page.title}</p>
                    <p className="text-sm text-gray-500">{page.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    /{page.slug}
                  </code>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {page.menuGroup || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <PageToggleButton
                    pageId={page.id}
                    isPublished={page.isPublished}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* 미리보기 */}
                    <Link
                      href={`/${page.slug}?preview=true`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="미리보기"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {/* 편집 */}
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="편집"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
