import { ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type AlertVariant = 'success' | 'error' | 'warning' | 'info'

interface AlertProps {
  variant: AlertVariant
  children: ReactNode
  title?: string
  className?: string
  onClose?: () => void
}

const variantStyles: Record<AlertVariant, { container: string; text: string; icon: string }> = {
  success: {
    container: 'bg-emerald-500/15 border-emerald-500/40',
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
  },
  error: {
    container: 'bg-red-500/15 border-red-500/40',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  warning: {
    container: 'bg-amber-500/15 border-amber-500/40',
    text: 'text-amber-400',
    icon: 'text-amber-400',
  },
  info: {
    container: 'bg-cyan-500/15 border-cyan-500/40',
    text: 'text-cyan-400',
    icon: 'text-cyan-400',
  },
}

const icons: Record<AlertVariant, ReactNode> = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
}

export default function Alert({ variant, children, title, className = '', onClose }: AlertProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`
        rounded-xl border p-4 backdrop-blur-sm
        ${styles.container}
        ${className}
      `}
      role="alert"
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {icons[variant]}
        </div>
        <div className={`ml-3 flex-1 ${styles.text}`}>
          {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`
                inline-flex rounded-md p-1.5
                ${styles.text} hover:bg-white/10
                focus:outline-none focus:ring-2 focus:ring-white/20
                transition-colors
              `}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
