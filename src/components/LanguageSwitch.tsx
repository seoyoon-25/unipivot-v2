'use client'

import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { locales, localeNames, type Locale } from '@/i18n/config'

interface Props {
  currentLocale: Locale
}

export default function LanguageSwitch({ currentLocale }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (locale: Locale) => {
    document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        aria-label="언어 선택"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg border border-gray-200 shadow-lg z-20 overflow-hidden">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleChange(locale)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  locale === currentLocale ? 'text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
