import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import NotificationItem from './NotificationItem'
import { useInAppNotifications } from '@/contexts/InAppNotificationContext'

interface NotificationDropdownProps {
  onClose: () => void
  /** Notifications page path — differs per portal */
  notificationsPath?: string
}

export default function NotificationDropdown({
  onClose,
  notificationsPath = '/notifications',
}: NotificationDropdownProps) {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useInAppNotifications()

  const ref = useRef<HTMLDivElement>(null)

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

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 bg-[#0d1f2d] rounded-2xl border border-glow-cyan/20 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-glow-cyan hover:text-glow-teal transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[calc(min(420px,80vh))] overflow-y-auto divide-y divide-border/50">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-glow-cyan animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
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
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5">
        <Link
          to={notificationsPath}
          onClick={onClose}
          className="block text-center text-xs font-medium text-glow-cyan hover:text-glow-teal transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}
