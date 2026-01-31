import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import prisma from '@/lib/db';
import { createResource } from '../actions';

export const metadata = { title: '자료 업로드' };

export default async function ResourceUploadPage() {
  // Fetch sessions grouped by program for the selector
  const programs = await prisma.program.findMany({
    where: { status: { in: ['ONGOING', 'RECRUITING'] } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      sessions: {
        orderBy: { sessionNo: 'asc' },
        select: {
          id: true,
          sessionNo: true,
          title: true,
        },
      },
    },
  });

  async function handleSubmit(formData: FormData) {
    'use server';

    const sessionId = formData.get('sessionId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const url = formData.get('url') as string;

    if (!sessionId || !title) {
      return;
    }

    await createResource({
      sessionId,
      title,
      description: description || undefined,
      type: type || 'NOTE',
      url: url || undefined,
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/club/admin/resources"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">자료 업로드</h1>
          <p className="text-gray-500 mt-1">새로운 자료를 등록합니다.</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <form action={handleSubmit} className="space-y-5">
          {/* Session Selector */}
          <div>
            <label
              htmlFor="sessionId"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              세션 선택 <span className="text-red-500">*</span>
            </label>
            <select
              id="sessionId"
              name="sessionId"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">세션을 선택하세요</option>
              {programs.map((program) => (
                <optgroup key={program.id} label={program.title}>
                  {program.sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.sessionNo}회차
                      {session.title ? ` - ${session.title}` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="자료 제목을 입력하세요"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="자료에 대한 설명을 입력하세요 (선택)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              유형 <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="NOTE">노트</option>
              <option value="FILE">파일</option>
              <option value="LINK">링크</option>
            </select>
          </div>

          {/* URL (for LINK type) */}
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com (링크 유형인 경우 입력)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              유형이 &quot;링크&quot;인 경우 URL을 입력해주세요.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              등록하기
            </button>
            <Link
              href="/club/admin/resources"
              className="px-6 py-2.5 text-gray-600 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
