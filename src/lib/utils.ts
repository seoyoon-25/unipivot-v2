import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  if (!name) return '?'

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    // Single word - return first 1-2 characters
    return name.slice(0, 2).toUpperCase()
  }

  // Multiple words - return first letter of first two words
  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}
