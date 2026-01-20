/**
 * 독후감 구조 선택 시스템 타입 정의
 */

// 독후감 구조 코드
export type ReportStructureCode =
  | 'BONGGAEJEOK'  // 본깨적 (실천형)
  | 'OREO'         // OREO (비판형)
  | '4F'           // 4F (감성형)
  | 'PMI'          // PMI (균형형)
  | 'FREE'         // 자유형식

// 섹션 타입
export type SectionType =
  | 'textarea'     // 일반 텍스트
  | 'quote'        // 구절 + 이유
  | 'list'         // 리스트 (여러 개)
  | 'emotion'      // 감정 선택 + 설명
  | 'questions'    // 토론 질문

// 섹션 필드 정의
export interface ReportField {
  id: string
  label: string
  type: 'textarea' | 'text'
  placeholder?: string
  required: boolean
}

// 섹션 정의
export interface ReportSection {
  id: string
  name: string
  emoji: string
  title: string
  type: SectionType
  required: boolean
  placeholder?: string
  guide?: string
  multiple?: boolean
  options?: string[]  // emotion 타입에서 사용
  fields?: ReportField[]  // quote 타입에서 사용
}

// 템플릿 구조
export interface ReportTemplateStructure {
  sections: ReportSection[]
}

// 템플릿 정보
export interface ReportTemplate {
  id: string
  name: string
  code: ReportStructureCode
  description: string | null
  category: string
  icon: string | null
  structure: ReportTemplateStructure
  isDefault: boolean
  isActive: boolean
  sortOrder: number
}

// 섹션 데이터 타입
export interface QuoteSectionData {
  quote?: string
  page?: string
  reason?: string
  explanation?: string
}

export interface ListSectionData {
  items?: string[]
}

export interface EmotionSectionData {
  emotions?: string[]
  description?: string
}

export interface QuestionsSectionData {
  questions?: string[]
}

export type SectionData =
  | string
  | QuoteSectionData
  | ListSectionData
  | EmotionSectionData
  | QuestionsSectionData

// 구조화된 독후감 데이터
export interface StructuredReportData {
  structure?: ReportStructureCode
  sections: Record<string, SectionData>
}

// 독후감 제출 데이터
export interface SubmitStructuredReportData {
  title?: string
  structure: ReportStructureCode
  sections: Record<string, SectionData>
  visibility: 'PRIVATE' | 'GROUP' | 'PUBLIC'
}

// 독후감 카드에서 사용할 구조 정보
export interface ReportStructureInfo {
  code: ReportStructureCode
  name: string
  icon: string
  color: string
}

// 구조 정보 맵
export const REPORT_STRUCTURES: Record<ReportStructureCode, ReportStructureInfo> = {
  BONGGAEJEOK: {
    code: 'BONGGAEJEOK',
    name: '본깨적',
    icon: '✅',
    color: 'bg-green-50 border-green-200 text-green-800'
  },
  OREO: {
    code: 'OREO',
    name: 'OREO',
    icon: '💭',
    color: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  '4F': {
    code: '4F',
    name: '4F',
    icon: '❤️',
    color: 'bg-pink-50 border-pink-200 text-pink-800'
  },
  PMI: {
    code: 'PMI',
    name: 'PMI',
    icon: '⚖️',
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  FREE: {
    code: 'FREE',
    name: '자유형식',
    icon: '✏️',
    color: 'bg-gray-50 border-gray-200 text-gray-800'
  }
}

// 헬퍼 함수
export function getStructureInfo(code: ReportStructureCode): ReportStructureInfo {
  return REPORT_STRUCTURES[code] || REPORT_STRUCTURES.FREE
}

export function getStructureName(code: ReportStructureCode): string {
  return REPORT_STRUCTURES[code]?.name || '자유형식'
}

export function getStructureIcon(code: ReportStructureCode): string {
  return REPORT_STRUCTURES[code]?.icon || '✏️'
}

export function isValidStructureCode(code: string): code is ReportStructureCode {
  return code in REPORT_STRUCTURES
}
