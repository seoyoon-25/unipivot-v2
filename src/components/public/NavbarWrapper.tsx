import { getNavigationMenu } from '@/lib/navigation'
import { prisma } from '@/lib/db'
import { Navbar } from './Navbar'

async function getLogoUrl() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'theme.logo' }
    })
    return setting?.value || ''
  } catch {
    return ''
  }
}

export async function NavbarWrapper() {
  const [menuItems, logoUrl] = await Promise.all([
    getNavigationMenu(),
    getLogoUrl()
  ])

  return <Navbar menuItems={menuItems} logoUrl={logoUrl} />
}
