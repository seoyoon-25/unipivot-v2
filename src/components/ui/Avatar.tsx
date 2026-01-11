import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name = '?', size = 'md', className }: AvatarProps) {
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

export function AvatarGroup({ avatars, max = 4, size = 'md' }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  const overlapClasses = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
  }

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
              {
                'w-6 h-6 text-xs': size === 'xs',
                'w-8 h-8 text-xs': size === 'sm',
                'w-10 h-10 text-sm': size === 'md',
                'w-12 h-12 text-sm': size === 'lg',
              }
            )}
          >
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  )
}
