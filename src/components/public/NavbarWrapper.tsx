import { getNavigationMenu } from '@/lib/navigation'
import { Navbar } from './Navbar'

export async function NavbarWrapper() {
  const menuItems = await getNavigationMenu()

  return <Navbar menuItems={menuItems} />
}
