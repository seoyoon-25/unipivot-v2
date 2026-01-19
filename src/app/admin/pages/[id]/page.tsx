import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import PageEditForm from './PageEditForm';

export const metadata: Metadata = {
  title: '페이지 편집 | 어드민',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPageEditPage({ params }: PageProps) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">페이지 편집</h1>
        <p className="text-gray-600 mt-1">
          {page.title} 페이지 설정을 수정합니다.
        </p>
      </div>

      <PageEditForm page={page} />
    </div>
  );
}
