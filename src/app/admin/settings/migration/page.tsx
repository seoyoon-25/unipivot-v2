'use client'

import { useState, useRef } from 'react'
import { Download, Upload, FileJson, Check, AlertTriangle, Loader2 } from 'lucide-react'

const TABLES = [
  { id: 'users', name: '회원', description: '회원 정보 (이메일, 이름, 연락처 등)' },
  { id: 'programs', name: '프로그램', description: '프로그램 및 세션 정보' },
  { id: 'programParticipants', name: '참가자', description: '프로그램 참가자 및 출석/보고서' },
  { id: 'donations', name: '후원', description: '후원 내역' },
  { id: 'financeDonations', name: '회계-기부금', description: '기부금 및 기부자 정보' },
  { id: 'financeTransactions', name: '회계-거래', description: '수입/지출 거래 내역' },
  { id: 'funds', name: '기금', description: '기금 정보' },
  { id: 'financeAccounts', name: '계정과목', description: '계정과목 코드' },
  { id: 'financeProjects', name: '회계-프로젝트', description: '프로젝트 및 예산' },
  { id: 'notices', name: '공지사항', description: '공지사항' },
  { id: 'books', name: '도서', description: '도서 정보' }
]

export default function MigrationPage() {
  const [selectedTables, setSelectedTables] = useState<string[]>(['all'])
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [skipExisting, setSkipExisting] = useState(true)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleTable(tableId: string) {
    if (tableId === 'all') {
      setSelectedTables(['all'])
    } else {
      setSelectedTables(prev => {
        const newTables = prev.filter(t => t !== 'all')
        if (newTables.includes(tableId)) {
          return newTables.filter(t => t !== tableId)
        } else {
          return [...newTables, tableId]
        }
      })
    }
  }

  async function handleExport() {
    setExportLoading(true)
    setError('')

    try {
      const tables = selectedTables.includes('all') ? 'all' : selectedTables.join(',')
      const res = await fetch(`/api/admin/migration/export?tables=${tables}`)

      if (!res.ok) {
        throw new Error('내보내기에 실패했습니다.')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `unipivot-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '내보내기에 실패했습니다.')
    }

    setExportLoading(false)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    setError('')
    setImportResult(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const res = await fetch('/api/admin/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          options: { skipExisting }
        })
      })

      if (!res.ok) {
        throw new Error('가져오기에 실패했습니다.')
      }

      const result = await res.json()
      setImportResult(result.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : '가져오기에 실패했습니다.')
    }

    setImportLoading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">데이터 마이그레이션</h1>
        <p className="text-gray-600">데이터를 내보내거나 가져올 수 있습니다</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">데이터 내보내기</h2>
              <p className="text-sm text-gray-500">선택한 데이터를 JSON 파일로 다운로드</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">내보낼 데이터 선택</label>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTables.includes('all')
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTables.includes('all')}
                  onChange={() => toggleTable('all')}
                  className="w-4 h-4 text-primary rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">전체 데이터</p>
                  <p className="text-xs text-gray-500">모든 테이블 데이터</p>
                </div>
              </label>

              {!selectedTables.includes('all') && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {TABLES.map(table => (
                    <label
                      key={table.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedTables.includes(table.id)
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table.id)}
                        onChange={() => toggleTable(table.id)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm text-gray-700">{table.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exportLoading || selectedTables.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                내보내는 중...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                JSON 파일 다운로드
              </>
            )}
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">데이터 가져오기</h2>
              <p className="text-sm text-gray-500">JSON 파일에서 데이터 가져오기</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 mb-4">
              <input
                type="checkbox"
                checked={skipExisting}
                onChange={e => setSkipExisting(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <div>
                <p className="font-medium text-gray-900">기존 데이터 건너뛰기</p>
                <p className="text-xs text-gray-500">이미 존재하는 데이터는 덮어쓰지 않음</p>
              </div>
            </label>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <FileJson className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">JSON 파일을 선택하세요</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
              >
                {importLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    가져오는 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    파일 선택
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">가져오기 결과</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {Object.entries(importResult).map(([table, result]: [string, any]) => (
                  <div key={table} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{table}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600">
                        <Check className="w-4 h-4 inline mr-1" />
                        {result.imported}개 추가
                      </span>
                      {result.skipped > 0 && (
                        <span className="text-gray-500">{result.skipped}개 건너뜀</span>
                      )}
                      {result.errors.length > 0 && (
                        <span className="text-red-600">{result.errors.length}개 오류</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSV Import Templates */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">CSV 템플릿</h2>
        <p className="text-sm text-gray-500 mb-6">
          CSV 파일로 데이터를 가져오려면 아래 템플릿을 다운로드하여 사용하세요.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/templates/members-template.csv"
            download
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">회원 템플릿</p>
              <p className="text-xs text-gray-500">members-template.csv</p>
            </div>
          </a>
          <a
            href="/templates/programs-template.csv"
            download
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">프로그램 템플릿</p>
              <p className="text-xs text-gray-500">programs-template.csv</p>
            </div>
          </a>
          <a
            href="/templates/transactions-template.csv"
            download
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">거래 템플릿</p>
              <p className="text-xs text-gray-500">transactions-template.csv</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
