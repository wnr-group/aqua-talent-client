import { useState } from 'react'
import { Bell } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import { useInAppNotifications } from '@/contexts/InAppNotificationContext'

interface NotificationBellProps {
  /** Path used by the "View all" link inside the dropdown */
  notificationsPath?: string
  /** Style variant — 'dark' for teal navbars (student), 'light' for white header (company/admin) */
  variant?: 'dark' | 'light'
}

export default function NotificationBell({
  notificationsPath = '/notifications',
  variant = 'dark',
}: NotificationBellProps) {
  const { unreadCount } = useInAppNotifications()
  const [open, setOpen] = useState(false)

  // Button styling for the bell icon
  const buttonClass =
    variant === 'dark'
      ? 'p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all'
      : 'p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors'

  // Map variant to dropdown theme
  const dropdownTheme = variant === 'dark' ? 'light' : 'light'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`${buttonClass} relative`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          notificationsPath={notificationsPath}
          theme={dropdownTheme}
        />
      )}
    </div>
  )
}
