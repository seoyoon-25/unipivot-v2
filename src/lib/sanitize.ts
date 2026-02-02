import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'sandbox'],
  })
  // Force sandbox on all iframes to prevent script execution
  return clean.replace(/<iframe(?![^>]*\bsandbox\b)/gi, '<iframe sandbox="allow-scripts allow-same-origin"')
}

export function sanitizeCss(dirty: string): string {
  return dirty
    .replace(/<\/style>/gi, '')
    .replace(/@import\b/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/url\s*\(\s*["']?\s*javascript:/gi, '')
    .replace(/-moz-binding\s*:/gi, '')
    .replace(/behavior\s*:/gi, '')
}
