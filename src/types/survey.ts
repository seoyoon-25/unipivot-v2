/**
 * Survey Types
 *
 * Type definitions for the satisfaction survey system
 */

// Question types supported by the survey system
export type QuestionType =
  | 'emoji_5'       // 5-scale emoji rating
  | 'star_5'        // 5-star rating
  | 'rating_10'     // NPS 0-10 scale
  | 'single_choice' // Single selection
  | 'multi_choice'  // Multiple selection
  | 'text_short'    // Short text input
  | 'text_long'     // Long text input
  | 'yes_no'        // Yes/No question

// Individual choice option for selection questions
export interface ChoiceOption {
  id: string
  text: string
  order: number
}

// Question-specific options
export interface QuestionOptions {
  // For emoji/star ratings
  labels?: string[]

  // For choice questions
  choices?: ChoiceOption[]

  // For rating_10 (NPS)
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string

  // For text inputs
  placeholder?: string
  maxLength?: number
  rows?: number
}

// Survey question structure
export interface SurveyQuestion {
  id: string
  order: number
  type: QuestionType
  text: string
  description?: string
  required: boolean
  options?: QuestionOptions
}

// Survey settings
export interface SurveySettings {
  anonymous?: boolean
  allowEdit?: boolean
  showProgress?: boolean
  includeRefund?: boolean
}

// Complete survey structure stored in database
export interface SurveyStructure {
  version: string
  type: 'session' | 'program'
  questions: SurveyQuestion[]
  settings?: SurveySettings
}

// Template settings
export interface TemplateSettings {
  estimatedTime?: string
  sendReminder?: boolean
  reminderDays?: number[]
}

// Survey template from database
export interface SurveyTemplate {
  id: string
  name: string
  description?: string | null
  category: string
  isDefault: boolean
  isPublic: boolean
  createdBy?: string | null
  questions: SurveyStructure
  settings?: TemplateSettings | null
  createdAt: Date
  updatedAt: Date
}

// Raw template from database (questions as string)
export interface SurveyTemplateRaw {
  id: string
  name: string
  description?: string | null
  category: string
  isDefault: boolean
  isPublic: boolean
  createdBy?: string | null
  questions: string
  settings?: string | null
  createdAt: Date
  updatedAt: Date
}

// Survey answer types
export type SurveyAnswerValue =
  | number           // For ratings (emoji_5, star_5, rating_10)
  | string           // For text inputs
  | string[]         // For multi_choice
  | boolean          // For yes_no

// Individual answer
export interface SurveyAnswer {
  questionId: string
  value: SurveyAnswerValue
}

// Survey response data
export interface SurveyResponseData {
  surveyId: string
  applicationId: string
  answers: SurveyAnswer[]
  refundInfo?: {
    choice: 'REFUND' | 'DONATE'
    bankAccountId?: string
    newAccount?: {
      bankCode: string
      bankName: string
      accountNumber: string
      accountHolder: string
    }
    donationMessage?: string
    saveNewAccount?: boolean
  }
  isAnonymous?: boolean
}

// Survey category labels
export const SURVEY_CATEGORIES: Record<string, string> = {
  reading_session: '독서모임 회차별',
  reading_program: '독서모임 시즌별',
  lecture: '강연/특강',
  workshop: '워크샵',
  custom: '사용자 정의'
}

// Question type labels
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  emoji_5: '이모지 5단계',
  star_5: '별점 5점',
  rating_10: 'NPS (0-10점)',
  single_choice: '단일 선택',
  multi_choice: '다중 선택',
  text_short: '단답형',
  text_long: '서술형',
  yes_no: '예/아니오'
}

// Default emoji labels
export const DEFAULT_EMOJI_LABELS = ['매우 불만족', '불만족', '보통', '만족', '매우 만족']

// Default NPS labels
export const DEFAULT_NPS_LABELS = {
  minLabel: '전혀 추천 안함',
  maxLabel: '매우 추천함'
}

// Utility function to parse template questions
export function parseTemplateQuestions(questionsJson: string): SurveyStructure {
  try {
    return JSON.parse(questionsJson) as SurveyStructure
  } catch {
    return {
      version: '1.0',
      type: 'session',
      questions: [],
      settings: {}
    }
  }
}

// Utility function to parse template settings
export function parseTemplateSettings(settingsJson: string | null | undefined): TemplateSettings | null {
  if (!settingsJson) return null
  try {
    return JSON.parse(settingsJson) as TemplateSettings
  } catch {
    return null
  }
}

// Generate unique question ID
export function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate unique choice ID
export function generateChoiceId(): string {
  return `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create default question
export function createDefaultQuestion(order: number): SurveyQuestion {
  return {
    id: generateQuestionId(),
    order,
    type: 'star_5',
    text: '',
    required: true
  }
}

// Create default choice
export function createDefaultChoice(order: number): ChoiceOption {
  return {
    id: generateChoiceId(),
    text: '',
    order
  }
}
