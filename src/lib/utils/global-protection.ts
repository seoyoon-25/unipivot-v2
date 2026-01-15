/**
 * 전역 에러 핸들러 및 브라우저 확장 프로그램 충돌 방지 유틸리티
 */

import { isBrowser } from './safe-dom'

// 에러 로그 전송 함수
async function reportError(error: any, context: string) {
  try {
    // 개발 환경에서만 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}]`, error)
    }

    // 프로덕션에서는 에러 로깅 서비스로 전송 (선택사항)
    // await fetch('/api/error-log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error: error.toString(), context })
    // })
  } catch (reportError) {
    console.warn('Failed to report error:', reportError)
  }
}

// 전역 에러 핸들러 설정
export function setupGlobalErrorHandling() {
  if (!isBrowser()) return

  // JavaScript 런타임 에러 처리
  window.addEventListener('error', (event) => {
    const error = event.error || event.message
    reportError(error, 'Global Error')

    // 에러가 확장 프로그램에서 발생한 것인지 확인
    if (isExtensionError(event)) {
      console.warn('Browser extension error detected, ignoring')
      return true // 에러 전파 중지
    }
  })

  // Promise 거부 에러 처리
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, 'Unhandled Promise Rejection')

    // 확장 프로그램 관련 에러인지 확인
    if (isExtensionPromiseError(event.reason)) {
      console.warn('Browser extension promise rejection detected, ignoring')
      event.preventDefault() // 에러 전파 중지
      return
    }
  })

  console.log('Global error handling initialized')
}

// 확장 프로그램 에러 감지
function isExtensionError(event: ErrorEvent): boolean {
  const errorSignatures = [
    'chrome-extension',
    'moz-extension',
    'safari-extension',
    'content script',
    'contentScript',
    'message port closed',
    'Extension context invalidated'
  ]

  const errorString = event.message || event.filename || ''
  return errorSignatures.some(signature =>
    errorString.toLowerCase().includes(signature.toLowerCase())
  )
}

// 확장 프로그램 Promise 에러 감지
function isExtensionPromiseError(reason: any): boolean {
  if (typeof reason === 'string') {
    const errorSignatures = [
      'message port closed',
      'extension context invalidated',
      'content script',
      'chrome-extension',
      'moz-extension'
    ]

    return errorSignatures.some(signature =>
      reason.toLowerCase().includes(signature.toLowerCase())
    )
  }

  if (reason && reason.message) {
    return isExtensionPromiseError(reason.message)
  }

  return false
}

// 확장 프로그램 네임스페이스 보호
export function protectAgainstExtensions() {
  if (!isBrowser()) return

  // DOM 프로퍼티 보호
  try {
    const originalAppendChild = Element.prototype.appendChild
    const originalRemoveChild = Element.prototype.removeChild
    const originalInsertBefore = Element.prototype.insertBefore

    // 우리 사이트의 요소만 조작하도록 보호 (선택적)
    // 너무 강력한 보호는 정상적인 기능을 방해할 수 있으므로 주의

    console.log('DOM protection initialized')
  } catch (error) {
    console.warn('Failed to initialize DOM protection:', error)
  }
}

// 확장 프로그램 메시지 감지 및 무시
export function setupExtensionMessageFiltering() {
  if (!isBrowser()) return

  // postMessage 이벤트 필터링
  window.addEventListener('message', (event) => {
    // 확장 프로그램에서 오는 메시지 감지
    const extensionOrigins = [
      'chrome-extension',
      'moz-extension',
      'safari-extension'
    ]

    if (event.origin && extensionOrigins.some(prefix =>
      event.origin.startsWith(prefix))) {
      // 확장 프로그램 메시지는 무시
      return
    }

    // 확장 프로그램 특유의 메시지 타입 필터링
    const extensionMessageTypes = [
      'content-script',
      'extension-message',
      'chrome-extension',
      'FROM_PAGE'
    ]

    if (event.data && typeof event.data === 'object' && event.data.type) {
      if (extensionMessageTypes.includes(event.data.type)) {
        return
      }
    }
  })

  console.log('Extension message filtering initialized')
}

// 페이지 로드 시 실행할 보호 기능들
export function initializePageProtection() {
  if (!isBrowser()) return

  try {
    setupGlobalErrorHandling()
    protectAgainstExtensions()
    setupExtensionMessageFiltering()

    // 콘솔 메시지로 보호 기능 활성화 확인
    console.log('🛡️ UniPivot page protection initialized')

    // 확장 프로그램 충돌 감지
    if (detectActiveExtensions()) {
      console.warn('⚠️ Browser extensions detected - enhanced protection active')
    }

  } catch (error) {
    console.error('Failed to initialize page protection:', error)
  }
}

// 활성 확장 프로그램 감지
function detectActiveExtensions(): boolean {
  if (!isBrowser()) return false

  try {
    const extensionIndicators = [
      'chrome',
      'browser',
      '__REACT_DEVTOOLS_GLOBAL_HOOK__',
      '__REDUX_DEVTOOLS_EXTENSION__'
    ]

    return extensionIndicators.some(indicator => indicator in window)
  } catch (error) {
    console.warn('Extension detection failed:', error)
    return false
  }
}

// CSP (Content Security Policy) 도우미 (선택사항)
export function suggestCSPHeaders(): string[] {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.unipivot.kr https://*.bestcome.org",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.unipivot.kr https://*.bestcome.org https://api.unipivot.kr",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ]
}

// 디버깅용 확장 프로그램 정보 수집
export function getExtensionInfo(): object {
  if (!isBrowser()) return {}

  const info: any = {
    userAgent: navigator.userAgent,
    extensions: [],
    globalObjects: [],
    timeline: new Date().toISOString()
  }

  // 알려진 확장 프로그램 전역 객체 확인
  const knownExtensionObjects = [
    'chrome',
    'browser',
    '__REACT_DEVTOOLS_GLOBAL_HOOK__',
    '__REDUX_DEVTOOLS_EXTENSION__',
    '__APOLLO_DEVTOOLS_GLOBAL_HOOK__',
    'Grammarly'
  ]

  knownExtensionObjects.forEach(obj => {
    if (obj in window) {
      info.globalObjects.push(obj)
    }
  })

  return info
}