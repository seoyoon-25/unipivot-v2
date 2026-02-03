export const defaultLocale = 'ko'
export const locales = ['ko', 'en'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
