'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Database,
  Upload,
  FileText,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: string
  status: 'processing' | 'indexed' | 'error'
  uploadedAt: string
  chunks: number
}

export default function AdminAiKnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 향후 구현
    alert('파일 업로드 기능은 곧 추가될 예정입니다.')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/ai"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">지식 베이스</h1>
          <p className="text-gray-500">AI 학습용 문서를 관리합니다</p>
        </div>
      </div>

      {/* 상태 배너 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            이 기능은 현재 개발 중입니다. AI 기능이 활성화되면 문서를 업로드하고 검색할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 업로드 영역 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-dashed border-gray-300">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">문서 업로드</h3>
          <p className="text-sm text-gray-500 mb-4">
            PDF, Word, TXT 파일을 드래그하거나 클릭하여 업로드하세요
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition-colors">
            <Upload className="w-4 h-4" />
            파일 선택
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              onChange={handleFileUpload}
              disabled
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">(현재 비활성화됨)</p>
        </div>
      </div>

      {/* 문서 목록 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">업로드된 문서</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="문서 검색..."
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
                disabled
              />
            </div>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              disabled
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>업로드된 문서가 없습니다</p>
            <p className="text-sm mt-1">문서를 업로드하면 AI가 학습합니다</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">문서명</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">유형</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">크기</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">청크</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">상태</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{doc.type}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{doc.size}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{doc.chunks}</td>
                  <td className="px-4 py-3 text-center">
                    {doc.status === 'indexed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        완료
                      </span>
                    )}
                    {doc.status === 'processing' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        처리중
                      </span>
                    )}
                    {doc.status === 'error' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        <AlertCircle className="w-3 h-3" />
                        오류
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 설정 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">인덱싱 설정</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">청크 크기</div>
            <div className="text-sm text-gray-500">1000 토큰</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">오버랩</div>
            <div className="text-sm text-gray-500">200 토큰</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">임베딩 모델</div>
            <div className="text-sm text-gray-500">text-embedding-ada-002</div>
          </div>
        </div>
      </div>
    </div>
  )
}
