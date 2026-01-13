import { prisma } from '@/lib/db'
import MenuManager from './MenuManager'

async function getMenus() {
  const menus = await prisma.menu.findMany({
    orderBy: [{ location: 'asc' }, { position: 'asc' }],
  })

  // Organize menus by location
  const headerMenus = menus.filter(m => m.location === 'HEADER')
  const footerMenus = menus.filter(m => m.location === 'FOOTER')

  // Build tree structure
  const buildTree = (items: typeof menus, parentId: string | null = null): any[] => {
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.position - b.position)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id),
      }))
  }

  return {
    headerMenus: buildTree(headerMenus),
    footerMenus: buildTree(footerMenus),
    allMenus: menus,
  }
}

export default async function AdminDesignMenusPage() {
  const { headerMenus, footerMenus, allMenus } = await getMenus()

  return (
    <MenuManager
      headerMenus={headerMenus}
      footerMenus={footerMenus}
      allMenus={allMenus}
    />
  )
}
