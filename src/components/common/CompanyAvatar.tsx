import { Building2 } from 'lucide-react'

interface CompanyAvatarProps {
  name: string
  logoUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark'
  className?: string
}

const sizeClasses: Record<Required<CompanyAvatarProps>['size'], string> = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-xl',
}

const radiusClasses: Record<Required<CompanyAvatarProps>['size'], string> = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
}

const variantClasses: Record<Required<CompanyAvatarProps>['variant'], { image: string; fallback: string; border: string; icon: string }> = {
  light: {
    image: 'bg-white border border-gray-200',
    fallback: 'bg-gray-100 border border-gray-200 text-gray-700',
    border: 'border-gray-200',
    icon: 'text-blue-600',
  },
  dark: {
    image: 'bg-white/90 border border-white/15',
    fallback: 'bg-white/10 border border-white/15 text-foreground',
    border: 'border-white/15',
    icon: 'text-glow-teal',
  },
}

export default function CompanyAvatar({
  name,
  logoUrl,
  size = 'md',
  variant = 'light',
  className = '',
}: CompanyAvatarProps) {
  const fallbackInitial = name?.trim().charAt(0).toUpperCase() || 'C'
  const sizeClass = sizeClasses[size]
  const radiusClass = radiusClasses[size]
  const variantClass = variantClasses[variant]

  if (logoUrl) {
    return (
      <div className={`${sizeClass} ${radiusClass} ${variantClass.image} overflow-hidden ${className}`}>
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} ${radiusClass} ${variantClass.fallback} flex items-center justify-center font-semibold uppercase tracking-wide ${className}`}
    >
      {name ? fallbackInitial : <Building2 className={`h-1/2 w-1/2 ${variantClass.icon}`} />}
    </div>
  )
}
