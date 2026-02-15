interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-8', text: 'text-lg' },
    md: { icon: 'h-10', text: 'text-xl' },
    lg: { icon: 'h-14', text: 'text-2xl' },
  }

  const { icon, text } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="AquaTalentz"
        className={`${icon} w-auto object-contain`}
      />

      {showText && (
        <span className={`font-display font-bold ${text}`}>
          <span className="text-glow-cyan">Aqua</span>
          <span className="text-glow-teal">Talentz</span>
        </span>
      )}
    </div>
  )
}
