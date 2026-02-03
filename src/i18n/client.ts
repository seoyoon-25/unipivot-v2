'use client'

import { useCallback, useMemo } from 'react'
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

function getClientLocale(): Locale {
  if (typeof document === 'undefined') return defaultLocale
  const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/)
  const value = match?.[1]
  if (value && isValidLocale(value)) return value
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

export function useTranslation() {
  const locale = useMemo(() => getClientLocale(), [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const [namespace, ...keyParts] = key.split('.')
      const value = resolve(translations[locale]?.[namespace], keyParts)

      if (typeof value !== 'string') return key

      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
          String(params[name] ?? `{{${name}}}`)
        )
      }

      return value
    },
    [locale]
  )

  return { t, locale }
}
