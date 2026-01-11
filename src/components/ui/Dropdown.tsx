'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect, type ReactNode } from 'react'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute top-full pt-2 z-50',
            align === 'left' ? 'left-0' : 'right-0',
            className
          )}
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] animate-slide-down">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
}

export function DropdownItem({
  children,
  onClick,
  href,
  icon,
  danger = false,
  disabled = false,
}: DropdownItemProps) {
  const className = cn(
    'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors',
    danger
      ? 'text-red-600 hover:bg-red-50'
      : 'text-gray-700 hover:bg-primary-light hover:text-primary',
    disabled && 'opacity-50 cursor-not-allowed'
  )

  if (href && !disabled) {
    return (
      <a href={href} className={className}>
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </a>
    )
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={className}
      disabled={disabled}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  )
}

export function DropdownDivider() {
  return <div className="my-2 border-t border-gray-100" />
}

interface NavDropdownProps {
  label: string
  items: { label: string; href: string; description?: string }[]
  className?: string
}

export function NavDropdown({ label, items, className }: NavDropdownProps) {
  return (
    <div className={cn('dropdown relative', className)}>
      <button className="nav-link px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-1">
        {label}
        <ChevronDown className="w-4 h-4" />
      </button>
      <div className="dropdown-menu absolute top-full left-0 pt-2 w-48">
        <div className="bg-white rounded-xl shadow-xl py-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 text-gray-700 hover:bg-primary-light hover:text-primary transition-colors"
            >
              <span className="font-medium">{item.label}</span>
              {item.description && (
                <span className="block text-xs text-gray-400 mt-0.5">{item.description}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
