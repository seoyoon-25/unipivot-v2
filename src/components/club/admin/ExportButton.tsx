'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

interface Props {
  type: 'members' | 'participants' | 'attendance';
  programId?: string;
  label?: string;
}

export default function ExportButton({
  type,
  programId,
  label = '내보내기',
}: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams({ type });
      if (programId) params.set('programId', programId);

      const response = await fetch(`/club/admin/export?${params.toString()}`);

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        response.headers
          .get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || 'export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('내보내기에 실패했습니다.');
    }

    setIsExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      <Download className="w-4 h-4" />
      {isExporting ? '내보내는 중...' : label}
    </button>
  );
}
