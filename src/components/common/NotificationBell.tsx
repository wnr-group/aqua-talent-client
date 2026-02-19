import { useState } from 'react'
import { Bell } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import { useInAppNotifications } from '@/contexts/InAppNotificationContext'

interface NotificationBellProps {
  /** Path used by the "View all" link inside the dropdown */
  notificationsPath?: string
  /** Style variant — 'dark' for ocean/glass navbars, 'light' for white header */
  variant?: 'dark' | 'light'
}

export default function NotificationBell({
  notificationsPath = '/notifications',
  variant = 'dark',
}: NotificationBellProps) {
  const { unreadCount } = useInAppNotifications()
  const [open, setOpen] = useState(false)

  const buttonClass =
    variant === 'dark'
      ? 'p-2.5 rounded-xl glass hover:border-glow-cyan/30 text-muted-foreground hover:text-foreground transition-all'
      : 'p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`${buttonClass} relative`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          notificationsPath={notificationsPath}
        />
      )}
    </div>
  )
}
