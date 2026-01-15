import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Default theme settings
const DEFAULT_SETTINGS: Record<string, string> = {
  'theme.primaryColor': '#F97316',
  'theme.secondaryColor': '#10B981',
  'theme.accentColor': '#F59E0B',
  'theme.logo': '',
  'theme.logoDark': '',
  'theme.favicon': '',
  'theme.siteName': '유니피벳',
  'theme.siteDescription': '',
  'theme.fontFamily': 'Pretendard',
  'theme.darkModeEnabled': 'false',
  'theme.darkModeDefault': 'light',
  'theme.darkBgColor': '#1a1a2e',
  'theme.darkTextColor': '#e2e8f0',
  'theme.darkPrimaryColor': '#60a5fa',
  'theme.darkSecondaryColor': '#34d399',
  'theme.darkCardBgColor': '#16213e',
}

// Helper function to convert hex to HSL
function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '')

  // Parse the hex color
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
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: { startsWith: 'theme.' },
      },
    })

    // Merge with defaults
    const themeSettings: Record<string, string> = { ...DEFAULT_SETTINGS }
    settings.forEach((s) => {
      if (s.value) {
        themeSettings[s.key] = s.value
      }
    })

    // Convert colors to HSL for CSS variables
    const cssVariables: Record<string, string> = {
      '--theme-primary': hexToHSL(themeSettings['theme.primaryColor']),
      '--theme-secondary': hexToHSL(themeSettings['theme.secondaryColor']),
      '--theme-accent': hexToHSL(themeSettings['theme.accentColor']),
      '--theme-primary-hex': themeSettings['theme.primaryColor'],
      '--theme-secondary-hex': themeSettings['theme.secondaryColor'],
      '--theme-accent-hex': themeSettings['theme.accentColor'],
    }

    // Add dark mode colors if enabled
    if (themeSettings['theme.darkModeEnabled'] === 'true') {
      cssVariables['--theme-dark-bg'] = themeSettings['theme.darkBgColor']
      cssVariables['--theme-dark-text'] = themeSettings['theme.darkTextColor']
      cssVariables['--theme-dark-primary'] = hexToHSL(themeSettings['theme.darkPrimaryColor'])
      cssVariables['--theme-dark-secondary'] = hexToHSL(themeSettings['theme.darkSecondaryColor'])
      cssVariables['--theme-dark-card-bg'] = themeSettings['theme.darkCardBgColor']
    }

    return NextResponse.json({
      settings: themeSettings,
      cssVariables,
      darkModeEnabled: themeSettings['theme.darkModeEnabled'] === 'true',
      darkModeDefault: themeSettings['theme.darkModeDefault'],
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    })
  } catch (error) {
    console.error('Error fetching public theme settings:', error)
    return NextResponse.json(
      {
        settings: DEFAULT_SETTINGS,
        cssVariables: {},
        darkModeEnabled: false,
        darkModeDefault: 'light',
      },
      { status: 200 }
    )
  }
}
