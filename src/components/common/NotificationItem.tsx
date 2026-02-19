import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Briefcase, Building2, CheckCircle, Info } from 'lucide-react'
import type { InAppNotification, InAppNotificationType } from '@/types/entities'

const TYPE_ICON_OCEAN: Record<InAppNotificationType, React.ReactNode> = {
  application_status: <CheckCircle className="w-4 h-4 text-glow-cyan" />,
  new_application: <Briefcase className="w-4 h-4 text-glow-teal" />,
  company_status: <Building2 className="w-4 h-4 text-glow-purple" />,
  system: <Info className="w-4 h-4 text-yellow-400" />,
}

const TYPE_ICON_LIGHT: Record<InAppNotificationType, React.ReactNode> = {
  application_status: <CheckCircle className="w-4 h-4 text-green-600" />,
  new_application: <Briefcase className="w-4 h-4 text-blue-600" />,
  company_status: <Building2 className="w-4 h-4 text-purple-600" />,
  system: <Info className="w-4 h-4 text-yellow-600" />,
}

interface NotificationItemProps {
  notification: InAppNotification
  onMarkRead: (id: string) => void
  onClose?: () => void
  /** 'ocean' = student dark theme | 'light' = company / admin white theme */
  theme?: 'ocean' | 'light'
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onClose,
  theme = 'ocean',
}: NotificationItemProps) {
  const TYPE_ICON = theme === 'ocean' ? TYPE_ICON_OCEAN : TYPE_ICON_LIGHT
  const icon = TYPE_ICON[notification.type] ?? <Bell className="w-4 h-4 text-gray-400" />

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })

  const handleClick = () => {
    if (!notification.isRead) onMarkRead(notification.id)
    if (onClose) onClose()
  }

  // ─── Ocean dark theme ─────────────────────────────────────────────────────
  const oceanRowClass = notification.isRead
    ? 'hover:bg-ocean-dark/30'
    : 'bg-glow-cyan/5 hover:bg-glow-cyan/10 border-l-2 border-glow-cyan'
  const oceanTitleClass = notification.isRead ? 'text-muted-foreground' : 'text-foreground'
  const oceanSubClass = 'text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2'
  const oceanTimeClass = 'text-xs text-muted-foreground/60 mt-1'
  const oceanDotClass = 'bg-glow-cyan'

  // ─── Light (company / admin) theme ───────────────────────────────────────
  const lightRowClass = notification.isRead
    ? 'hover:bg-gray-50'
    : 'bg-blue-50 hover:bg-blue-50 border-l-2 border-blue-500'
  const lightTitleClass = notification.isRead ? 'text-gray-500' : 'text-gray-900'
  const lightSubClass = 'text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2'
  const lightTimeClass = 'text-xs text-gray-400 mt-1'
  const lightDotClass = 'bg-blue-500'

  const isOcean = theme === 'ocean'

  const content = (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
        isOcean ? oceanRowClass : lightRowClass
      }`}
      onClick={!notification.link ? handleClick : undefined}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${isOcean ? oceanTitleClass : lightTitleClass}`}>
          {notification.title}
        </p>
        <p className={isOcean ? oceanSubClass : lightSubClass}>
          {notification.message}
        </p>
        <p className={isOcean ? oceanTimeClass : lightTimeClass}>{timeAgo}</p>
      </div>
      {!notification.isRead && (
        <div className={`flex-shrink-0 mt-1.5 w-2 h-2 rounded-full ${isOcean ? oceanDotClass : lightDotClass}`} />
      )}
    </div>
  )

  if (notification.link) {
    return (
      <Link to={notification.link} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return content
}
