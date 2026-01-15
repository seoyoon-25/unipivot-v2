'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo: string
  logoDark: string
  favicon: string
  siteName: string
  siteDescription: string
  fontFamily: string
  darkModeEnabled: boolean
  darkModeDefault: 'light' | 'dark' | 'system'
  darkBgColor: string
  darkTextColor: string
  darkPrimaryColor: string
  darkSecondaryColor: string
  darkCardBgColor: string
}

interface ThemeContextType {
  theme: ThemeSettings | null
  isDark: boolean
  toggleDarkMode: () => void
  loading: boolean
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#F97316',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  logo: '',
  logoDark: '',
  favicon: '',
  siteName: '유니피벳',
  siteDescription: '',
  fontFamily: 'Pretendard',
  darkModeEnabled: false,
  darkModeDefault: 'light',
  darkBgColor: '#1a1a2e',
  darkTextColor: '#e2e8f0',
  darkPrimaryColor: '#60a5fa',
  darkSecondaryColor: '#34d399',
  darkCardBgColor: '#16213e',
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  isDark: false,
  toggleDarkMode: () => {},
  loading: true,
})

export const useTheme = () => useContext(ThemeContext)

// Helper function to convert hex to HSL
function hexToHSL(hex: string): string {
  hex = hex.replace(/^#/, '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeSettings | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch theme settings
  useEffect(() => {
    async function fetchTheme() {
      try {
        const res = await fetch('/api/public/theme')
        const data = await res.json()

        const settings = data.settings
        const themeData: ThemeSettings = {
          primaryColor: settings['theme.primaryColor'] || defaultTheme.primaryColor,
          secondaryColor: settings['theme.secondaryColor'] || defaultTheme.secondaryColor,
          accentColor: settings['theme.accentColor'] || defaultTheme.accentColor,
          logo: settings['theme.logo'] || '',
          logoDark: settings['theme.logoDark'] || '',
          favicon: settings['theme.favicon'] || '',
          siteName: settings['theme.siteName'] || defaultTheme.siteName,
          siteDescription: settings['theme.siteDescription'] || '',
          fontFamily: settings['theme.fontFamily'] || defaultTheme.fontFamily,
          darkModeEnabled: settings['theme.darkModeEnabled'] === 'true',
          darkModeDefault: settings['theme.darkModeDefault'] || 'light',
          darkBgColor: settings['theme.darkBgColor'] || defaultTheme.darkBgColor,
          darkTextColor: settings['theme.darkTextColor'] || defaultTheme.darkTextColor,
          darkPrimaryColor: settings['theme.darkPrimaryColor'] || defaultTheme.darkPrimaryColor,
          darkSecondaryColor: settings['theme.darkSecondaryColor'] || defaultTheme.darkSecondaryColor,
          darkCardBgColor: settings['theme.darkCardBgColor'] || defaultTheme.darkCardBgColor,
        }

        setTheme(themeData)

        // Set initial dark mode based on preference
        if (themeData.darkModeEnabled) {
          const savedMode = localStorage.getItem('theme-mode')
          if (savedMode) {
            setIsDark(savedMode === 'dark')
          } else if (themeData.darkModeDefault === 'system') {
            setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
          } else {
            setIsDark(themeData.darkModeDefault === 'dark')
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error)
        setTheme(defaultTheme)
      } finally {
        setLoading(false)
      }
    }

    fetchTheme()
  }, [])

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (!theme) return

    const root = document.documentElement

    // Apply primary color as CSS variable (HSL for Shadcn UI)
    root.style.setProperty('--primary', hexToHSL(theme.primaryColor))
    root.style.setProperty('--theme-primary-hex', theme.primaryColor)

    // Calculate primary dark (10% darker)
    const primaryDark = adjustBrightness(theme.primaryColor, -10)
    root.style.setProperty('--primary-dark', primaryDark)

    // Calculate primary light (90% lighter / more transparent)
    const primaryLight = adjustBrightness(theme.primaryColor, 85)
    root.style.setProperty('--primary-light', primaryLight)

    // Apply secondary and accent colors
    root.style.setProperty('--secondary-theme', hexToHSL(theme.secondaryColor))
    root.style.setProperty('--accent-theme', hexToHSL(theme.accentColor))

    // Apply dark mode if enabled and active
    if (theme.darkModeEnabled && isDark) {
      root.classList.add('dark')
      root.style.setProperty('--background', hexToHSL(theme.darkBgColor))
      root.style.setProperty('--foreground', hexToHSL(theme.darkTextColor))
      root.style.setProperty('--card', hexToHSL(theme.darkCardBgColor))
      root.style.setProperty('--primary', hexToHSL(theme.darkPrimaryColor))
    } else {
      root.classList.remove('dark')
      // Reset to light mode defaults
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--foreground', '0 0% 3.9%')
      root.style.setProperty('--card', '0 0% 100%')
    }

    // Update favicon if set
    if (theme.favicon) {
      const existingFavicon = document.querySelector('link[rel="icon"]')
      if (existingFavicon) {
        existingFavicon.setAttribute('href', theme.favicon)
      } else {
        const link = document.createElement('link')
        link.rel = 'icon'
        link.href = theme.favicon
        document.head.appendChild(link)
      }
    }
  }, [theme, isDark])

  const toggleDarkMode = () => {
    if (!theme?.darkModeEnabled) return
    const newValue = !isDark
    setIsDark(newValue)
    localStorage.setItem('theme-mode', newValue ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleDarkMode, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Helper function to adjust brightness
function adjustBrightness(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '')
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.min(255, Math.max(0, r + (percent / 100) * 255))
  g = Math.min(255, Math.max(0, g + (percent / 100) * 255))
  b = Math.min(255, Math.max(0, b + (percent / 100) * 255))

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}
