import { prisma } from '@/lib/db'
import ThemeSettings from './ThemeSettings'

const DEFAULT_SETTINGS = {
  'theme.primaryColor': '#3B82F6',
  'theme.secondaryColor': '#10B981',
  'theme.accentColor': '#F59E0B',
  'theme.logo': '',
  'theme.logoDark': '',
  'theme.favicon': '',
  'theme.siteName': '유니피벗',
  'theme.siteDescription': '',
  'theme.fontFamily': 'Pretendard',
  // Dark mode settings
  'theme.darkModeEnabled': 'false',
  'theme.darkModeDefault': 'light',
  'theme.darkBgColor': '#1a1a2e',
  'theme.darkTextColor': '#e2e8f0',
  'theme.darkPrimaryColor': '#60a5fa',
  'theme.darkSecondaryColor': '#34d399',
  'theme.darkCardBgColor': '#16213e',
}

async function getThemeSettings() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { startsWith: 'theme.' },
    },
  })

  const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
  settings.forEach((s) => {
    if (s.value) {
      settingsMap[s.key] = s.value
    }
  })

  return settingsMap
}

export default async function AdminDesignThemePage() {
  const settings = await getThemeSettings()

  return <ThemeSettings settings={settings} />
}
