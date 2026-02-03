import { cookies } from 'next/headers'
import { defaultLocale, type Locale, isValidLocale } from './config'

import koCommon from '@/locales/ko/common.json'
import koClub from '@/locales/ko/club.json'
import koAuth from '@/locales/ko/auth.json'
import enCommon from '@/locales/en/common.json'
import enClub from '@/locales/en/club.json'
import enAuth from '@/locales/en/auth.json'

type TranslationMap = Record<string, unknown>

const translations: Record<Locale, Record<string, TranslationMap>> = {
  ko: { common: koCommon, club: koClub, auth: koAuth },
  en: { common: enCommon, club: enClub, auth: enAuth },
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')?.value

  if (localeCookie && isValidLocale(localeCookie)) {
    return localeCookie
  }

  return defaultLocale
}

function resolve(obj: unknown, keys: string[]): unknown {
  let current = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

export function createTranslator(locale: Locale) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const [namespace, ...keyParts] = key.split('.')
    const value = resolve(translations[locale]?.[namespace], keyParts)

    if (typeof value !== 'string') {
      return key
    }

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(params[name] ?? `{{${name}}}`)
      )
    }

    return value
  }
}

export async function getTranslations() {
  const locale = await getLocale()
  return { t: createTranslator(locale), locale }
}
