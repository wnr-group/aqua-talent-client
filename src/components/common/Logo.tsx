interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'light' | 'dark'
  className?: string
}

export default function Logo({ size = 'md', showText = true, variant = 'dark', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-8', text: 'text-lg' },
    md: { icon: 'h-10', text: 'text-xl' },
    lg: { icon: 'h-14', text: 'text-2xl' },
  }

  const { icon, text } = sizes[size]

  // dark variant = white text (for colored navbar backgrounds)
  // light variant = colored text (for light page backgrounds)
  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-900'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="AquaTalentz"
        className={`${icon} w-auto object-contain`}
      />

      {showText && (
        <span className={`font-display font-bold ${text} ${textColor}`}>
          AquaTalentz
        </span>
      )}
    </div>
  )
}
