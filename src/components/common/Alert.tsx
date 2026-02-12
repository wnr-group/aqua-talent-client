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

const variantStyles: Record<AlertVariant, { bg: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: 'text-green-500',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-500',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-500',
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
        rounded-lg border p-4
        ${styles.bg}
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
                inline-flex rounded-md p-1
                ${styles.text} hover:bg-white/50
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
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
