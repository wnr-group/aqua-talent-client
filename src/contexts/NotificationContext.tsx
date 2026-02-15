import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Generate unique ID with fallback for browsers without crypto.randomUUID
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (type: NotificationType, message: string, duration?: number) => void
  removeNotification: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration = 5000) => {
      const id = generateId()
      const notification: Notification = { id, type, message, duration }

      setNotifications((prev) => [...prev, notification])

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }
    },
    [removeNotification]
  )

  const success = useCallback(
    (message: string) => addNotification('success', message),
    [addNotification]
  )

  const error = useCallback(
    (message: string) => addNotification('error', message),
    [addNotification]
  )

  const warning = useCallback(
    (message: string) => addNotification('warning', message),
    [addNotification]
  )

  const info = useCallback(
    (message: string) => addNotification('info', message),
    [addNotification]
  )

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }

  return context
}
