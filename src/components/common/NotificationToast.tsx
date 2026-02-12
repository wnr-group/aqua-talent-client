import { useNotification } from '@/contexts/NotificationContext'
import Alert from './Alert'

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          variant={notification.type}
          onClose={() => removeNotification(notification.id)}
          className="shadow-lg"
        >
          {notification.message}
        </Alert>
      ))}
    </div>
  )
}
