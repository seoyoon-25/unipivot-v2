export type SubMenuItem = {
  label: string
  href: string
  description?: string
  external?: boolean
}

export type MenuItem = {
  label: string
  href?: string
  children?: SubMenuItem[]
  external?: boolean
}

export interface NavbarProps {
  menuItems?: MenuItem[]
  logoUrl?: string
}
