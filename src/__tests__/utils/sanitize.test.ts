import { sanitizeHtml, sanitizeCss } from '@/lib/sanitize'

describe('sanitizeHtml', () => {
  it('passes through safe HTML', () => {
    expect(sanitizeHtml('<p>Hello</p>')).toBe('<p>Hello</p>')
  })

  it('removes script tags', () => {
    const result = sanitizeHtml('<script>alert("xss")</script><p>Safe</p>')
    expect(result).not.toContain('<script')
    expect(result).toContain('<p>Safe</p>')
  })

  it('allows iframe tags', () => {
    const result = sanitizeHtml('<iframe src="https://example.com"></iframe>')
    expect(result).toContain('<iframe')
  })

  it('adds sandbox to iframes without it', () => {
    const result = sanitizeHtml('<iframe src="https://example.com"></iframe>')
    expect(result).toContain('sandbox')
  })

  it('removes onclick handlers', () => {
    const result = sanitizeHtml('<p onclick="alert(1)">Click</p>')
    expect(result).not.toContain('onclick')
  })
})

describe('sanitizeCss', () => {
  it('passes through safe CSS', () => {
    expect(sanitizeCss('color: red; font-size: 14px;')).toBe('color: red; font-size: 14px;')
  })

  it('removes closing style tags', () => {
    expect(sanitizeCss('color: red;</style>')).not.toContain('</style>')
  })

  it('removes @import directives', () => {
    expect(sanitizeCss('@import url("evil.css"); color: red;')).not.toContain('@import')
  })

  it('removes expression()', () => {
    expect(sanitizeCss('width: expression(alert(1))')).not.toContain('expression')
  })

  it('removes javascript: in url()', () => {
    expect(sanitizeCss('background: url("javascript:alert(1)")')).not.toContain('javascript:')
  })

  it('removes -moz-binding', () => {
    expect(sanitizeCss('-moz-binding: url("evil")')).not.toContain('-moz-binding')
  })

  it('removes behavior property', () => {
    expect(sanitizeCss('behavior: url("evil.htc")')).not.toContain('behavior')
  })
})
