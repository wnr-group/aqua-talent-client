import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import NotificationItem from './NotificationItem'
import { useInAppNotifications } from '@/contexts/InAppNotificationContext'

interface NotificationDropdownProps {
  onClose: () => void
  /** Notifications page path — differs per portal */
  notificationsPath?: string
  /** 'ocean' = dark theme | 'light' = white theme */
  theme?: 'ocean' | 'light'
}

export default function NotificationDropdown({
  onClose,
  notificationsPath = '/notifications',
  theme = 'ocean',
}: NotificationDropdownProps) {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useInAppNotifications()

  const ref = useRef<HTMLDivElement>(null)
  const isLight = theme === 'light'

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Theme classes
  const containerClass = isLight
    ? 'absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden'
    : 'absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 bg-[#0d1f2d] rounded-2xl border border-glow-cyan/20 shadow-2xl overflow-hidden'

  const headerClass = isLight
    ? 'flex items-center justify-between px-4 py-3 border-b border-gray-200'
    : 'flex items-center justify-between px-4 py-3 border-b border-border'

  const titleClass = isLight ? 'text-sm font-semibold text-gray-900' : 'text-sm font-semibold text-foreground'

  const markAllClass = isLight
    ? 'flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors'
    : 'flex items-center gap-1.5 text-xs text-glow-cyan hover:text-glow-teal transition-colors'

  const bodyClass = isLight
    ? 'max-h-[calc(min(420px,80vh))] overflow-y-auto divide-y divide-gray-100'
    : 'max-h-[calc(min(420px,80vh))] overflow-y-auto divide-y divide-border/50'

  const loaderClass = isLight ? 'w-5 h-5 text-blue-500 animate-spin' : 'w-5 h-5 text-glow-cyan animate-spin'

  const emptyClass = isLight
    ? 'flex flex-col items-center gap-2 py-10 text-gray-400'
    : 'flex flex-col items-center gap-2 py-10 text-muted-foreground'

  const footerClass = isLight
    ? 'border-t border-gray-200 px-4 py-2.5'
    : 'border-t border-border px-4 py-2.5'

  const linkClass = isLight
    ? 'block text-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors'
    : 'block text-center text-xs font-medium text-glow-cyan hover:text-glow-teal transition-colors'

  return (
    <div ref={ref} className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <h3 className={titleClass}>Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className={markAllClass}>
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Body */}
      <div className={bodyClass}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className={loaderClass} />
          </div>
        ) : notifications.length === 0 ? (
          <div className={emptyClass}>
            <Bell className="w-8 h-8 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={markRead}
              onClose={onClose}
              theme={theme}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className={footerClass}>
        <Link to={notificationsPath} onClick={onClose} className={linkClass}>
          View all notifications
        </Link>
      </div>
    </div>
  )
}
