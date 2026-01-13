"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image"

import { cn, getInitials } from "@/lib/utils"

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
AvatarRoot.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Legacy Avatar component with size prop
const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const imageSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

function Avatar({ src, name = '?', size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0',
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}

interface AvatarGroupProps {
  avatars: { src?: string | null; name: string }[]
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const overlapClasses = {
  xs: '-ml-1.5',
  sm: '-ml-2',
  md: '-ml-2.5',
  lg: '-ml-3',
}

function AvatarGroup({ avatars, max = 4, size = 'md' }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div className="flex items-center">
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'ring-2 ring-white rounded-full',
            index > 0 && overlapClasses[size]
          )}
        >
          <Avatar src={avatar.src} name={avatar.name} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'ring-2 ring-white rounded-full',
            overlapClasses[size]
          )}
        >
          <div
            className={cn(
              'rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold',
              sizeClasses[size]
            )}
          >
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  )
}

export {
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  Avatar,
  AvatarGroup,
}
