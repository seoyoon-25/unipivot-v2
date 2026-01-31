/**
 * CSV 생성 유틸리티
 * BOM 포함으로 Excel 한글 호환
 */
export function generateCSV(headers: string[], rows: string[][]): string {
  const escape = (cell: string) => {
    if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const headerRow = headers.map(escape).join(',');
  const dataRows = rows.map((row) => row.map(escape).join(','));

  // BOM (\uFEFF) 추가 — Excel에서 한글이 깨지지 않도록
  return '\uFEFF' + [headerRow, ...dataRows].join('\n');
}

/**
 * 날짜를 내보내기용 문자열로 포맷
 */
export function formatDateForExport(date: Date | string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ko-KR');
}
