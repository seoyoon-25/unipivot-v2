/**
 * 브라우저 확장 프로그램과의 충돌을 방지하는 안전한 DOM 접근 유틸리티
 */

// 안전한 document 접근
export function safeDocument(): Document | null {
  try {
    if (typeof document !== 'undefined' && document) {
      return document
    }
  } catch (error) {
    console.warn('Document access failed:', error)
  }
  return null
}

// 안전한 window 접근
export function safeWindow(): Window | null {
  try {
    if (typeof window !== 'undefined' && window) {
      return window
    }
  } catch (error) {
    console.warn('Window access failed:', error)
  }
  return null
}

// 안전한 document.head 접근
export function safeDocumentHead(): HTMLHeadElement | null {
  try {
    const doc = safeDocument()
    return doc?.head || null
  } catch (error) {
    console.warn('Document head access failed:', error)
    return null
  }
}

// 안전한 document.body 접근
export function safeDocumentBody(): HTMLBodyElement | null {
  try {
    const doc = safeDocument()
    return (doc?.body as HTMLBodyElement) || null
  } catch (error) {
    console.warn('Document body access failed:', error)
    return null
  }
}

// 안전한 querySelector
export function safeQuerySelector<T extends Element = Element>(
  selector: string
): T | null {
  try {
    const doc = safeDocument()
    if (!doc) return null
    return doc.querySelector<T>(selector)
  } catch (error) {
    console.warn('QuerySelector failed:', error)
    return null
  }
}

// 안전한 querySelectorAll
export function safeQuerySelectorAll<T extends Element = Element>(
  selector: string
): NodeListOf<T> | null {
  try {
    const doc = safeDocument()
    if (!doc) return null
    return doc.querySelectorAll<T>(selector)
  } catch (error) {
    console.warn('QuerySelectorAll failed:', error)
    return null
  }
}

// 안전한 createElement
export function safeCreateElement<T extends keyof HTMLElementTagNameMap>(
  tagName: T
): HTMLElementTagNameMap[T] | null {
  try {
    const doc = safeDocument()
    if (!doc) return null
    return doc.createElement(tagName)
  } catch (error) {
    console.warn('CreateElement failed:', error)
    return null
  }
}

// 안전한 title 설정
export function safeSetTitle(title: string): boolean {
  try {
    const doc = safeDocument()
    if (!doc) return false
    doc.title = title
    return true
  } catch (error) {
    console.warn('Set title failed:', error)
    return false
  }
}

// 안전한 addEventListener
export function safeAddEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): boolean {
  try {
    const win = safeWindow()
    if (!win) return false
    win.addEventListener(type, listener, options)
    return true
  } catch (error) {
    console.warn('AddEventListener failed:', error)
    return false
  }
}

// 안전한 removeEventListener
export function safeRemoveEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | EventListenerOptions
): boolean {
  try {
    const win = safeWindow()
    if (!win) return false
    win.removeEventListener(type, listener, options)
    return true
  } catch (error) {
    console.warn('RemoveEventListener failed:', error)
    return false
  }
}

// 안전한 window 속성 접근
export function safeWindowProperty<K extends keyof Window>(
  property: K
): Window[K] | null {
  try {
    const win = safeWindow()
    return win ? win[property] : null
  } catch (error) {
    console.warn(`Window property ${String(property)} access failed:`, error)
    return null
  }
}

// 안전한 window.location 접근
export function safeLocation(): Location | null {
  return safeWindowProperty('location')
}

// 안전한 window.innerWidth 접근
export function safeInnerWidth(): number {
  try {
    const width = safeWindowProperty('innerWidth')
    return typeof width === 'number' ? width : 0
  } catch (error) {
    console.warn('InnerWidth access failed:', error)
    return 0
  }
}

// 안전한 window.scrollY 접근
export function safeScrollY(): number {
  try {
    const scrollY = safeWindowProperty('scrollY')
    return typeof scrollY === 'number' ? scrollY : 0
  } catch (error) {
    console.warn('ScrollY access failed:', error)
    return 0
  }
}

// 안전한 window.open
export function safeWindowOpen(
  url: string,
  target?: string,
  features?: string
): Window | null {
  try {
    const win = safeWindow()
    if (!win) return null
    return win.open(url, target, features)
  } catch (error) {
    console.warn('Window open failed:', error)
    return null
  }
}

// 브라우저 환경 체크
export function isBrowser(): boolean {
  try {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
  } catch {
    return false
  }
}

// 확장 프로그램 충돌 감지
export function detectExtensionConflict(): boolean {
  try {
    if (!isBrowser()) return false

    const win = safeWindow()
    if (!win) return false

    // 흔한 확장 프로그램 시그니처 확인
    const conflictSignatures = [
      'chrome', 'browser', 'moz', 'webkitRTCPeerConnection'
    ]

    for (const sig of conflictSignatures) {
      if (sig in win) {
        return true
      }
    }

    return false
  } catch (error) {
    console.warn('Extension conflict detection failed:', error)
    return false
  }
}