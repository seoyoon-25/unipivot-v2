import Link from 'next/link';
import {
  Plus,
  FileText,
  Link as LinkIcon,
  File,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getResources } from '@/lib/club/admin-queries';

export const metadata = { title: '자료 관리' };

interface Props {
  searchParams: Promise<{ page?: string; sessionId?: string }>;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  NOTE: { label: '노트', icon: FileText, color: 'bg-blue-50 text-blue-700' },
  FILE: { label: '파일', icon: File, color: 'bg-green-50 text-green-700' },
  LINK: { label: '링크', icon: LinkIcon, color: 'bg-purple-50 text-purple-700' },
};

export default async function AdminResourcesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const { resources, total, totalPages } = await getResources({
    page,
    sessionId: params.sessionId,
  });

  function pageUrl(p: number) {
    const searchParts: string[] = [];
    if (p > 1) searchParts.push(`page=${p}`);
    if (params.sessionId) searchParts.push(`sessionId=${params.sessionId}`);
    const qs = searchParts.join('&');
    return qs ? `?${qs}` : '/club/admin/resources';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">자료 관리</h1>
          <p className="text-gray-500 mt-1">총 {total}개 자료</p>
        </div>
        <Link
          href="/club/admin/resources/upload"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          자료 업로드
        </Link>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">프로그램 / 세션</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">유형</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">업로더</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    등록된 자료가 없습니다.
                  </td>
                </tr>
              ) : (
                resources.map((resource) => {
                  const typeConfig = TYPE_CONFIG[resource.type] ?? TYPE_CONFIG.NOTE;
                  const TypeIcon = typeConfig.icon;

                  return (
                    <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                      {/* Title */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {resource.title}
                            </p>
                            {resource.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {resource.description}
                              </p>
                            )}
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline mt-0.5 inline-block"
                              >
                                {resource.url}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Program / Session */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-900">
                            {resource.session.program.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {resource.session.sessionNo
                              ? `${resource.session.sessionNo}회차`
                              : ''}
                            {resource.session.title
                              ? ` - ${resource.session.title}`
                              : ''}
                          </p>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${typeConfig.color}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig.label}
                        </span>
                      </td>

                      {/* Uploader */}
                      <td className="px-4 py-3 text-gray-500">
                        {resource.user.name || '(이름 없음)'}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-gray-500">
                        {format(new Date(resource.createdAt), 'yyyy.MM.dd', {
                          locale: ko,
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 ? (
            <Link
              href={pageUrl(page - 1)}
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
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={pageUrl(page + 1)}
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
    </div>
  );
}
