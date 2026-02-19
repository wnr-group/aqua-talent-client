import { useEffect, useState, useCallback } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { api } from '@/services/api/client'
import { useInAppNotifications } from '@/contexts/InAppNotificationContext'
import type { InAppNotification } from '@/types/entities'
import NotificationItem from '@/components/common/NotificationItem'

interface NotificationsContentProps {
  /** 'ocean' = student dark glass theme | 'light' = company/admin white theme */
  theme?: 'ocean' | 'light'
}

const LIMIT = 20

export default function NotificationsContent({ theme = 'ocean' }: NotificationsContentProps) {
  const { markRead, markAllRead, unreadCount } = useInAppNotifications()
  const [allNotifications, setAllNotifications] = useState<InAppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchPage = useCallback(async (p: number) => {
    setIsLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await api.get<{ notifications: any[]; total: number }>(
        '/notifications',
        { page: p, limit: LIMIT }
      )
      // Normalize backend response (_id -> id)
      const normalized: InAppNotification[] = (data.notifications ?? []).map((n) => ({
        id: n.id || n._id,
        recipientId: n.recipientId,
        recipientType: n.recipientType,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }))
      setAllNotifications(normalized)
      setTotal(data.total ?? 0)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage(page)
  }, [fetchPage, page])

  const handleMarkRead = useCallback(
    async (id: string) => {
      // Optimistic: update local state immediately so blue dot disappears
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      // Context handles badge count optimistic update + API call
      await markRead(id)
    },
    [markRead]
  )

  const handleMarkAllRead = useCallback(async () => {
    // Optimistic: update all local notifications immediately
    setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    // Context handles badge count reset + API call
    await markAllRead()
  }, [markAllRead])

  const totalPages = Math.ceil(total / LIMIT)
  const isOcean = theme === 'ocean'

  // ─── theme tokens ───────────────────────────────────────────────────────────
  const headingClass = isOcean
    ? 'text-2xl font-display font-bold text-foreground'
    : 'text-2xl font-bold text-gray-900'

  const subClass = isOcean
    ? 'text-sm text-muted-foreground mt-1'
    : 'text-sm text-gray-500 mt-1'

  const markAllBtnClass = isOcean
    ? 'flex items-center gap-2 px-4 py-2 rounded-xl border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/10 text-sm font-medium transition-colors'
    : 'flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors'

  const listContainerClass = isOcean
    ? 'glass rounded-2xl border border-glow-cyan/20 overflow-hidden'
    : 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'

  const emptyIconClass = isOcean ? 'text-muted-foreground' : 'text-gray-400'
  const emptyTitleClass = isOcean ? 'text-base font-medium text-muted-foreground' : 'text-base font-medium text-gray-500'
  const emptySubClass = isOcean ? 'text-sm text-muted-foreground' : 'text-sm text-gray-400'

  const divideClass = isOcean ? 'divide-y divide-border/50' : 'divide-y divide-gray-100'

  const paginationBtnClass = isOcean
    ? 'px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors'
    : 'px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors'

  const paginationInfoClass = isOcean
    ? 'px-4 py-2 text-sm text-muted-foreground'
    : 'px-4 py-2 text-sm text-gray-500'
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={headingClass}>Notifications</h1>
          <p className={subClass}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className={markAllBtnClass}>
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className={listContainerClass}>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className={`w-6 h-6 animate-spin ${isOcean ? 'text-glow-cyan' : 'text-blue-500'}`} />
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Bell className={`w-10 h-10 opacity-40 ${emptyIconClass}`} />
            <p className={emptyTitleClass}>No notifications yet</p>
            <p className={emptySubClass}>Activity and alerts will appear here.</p>
          </div>
        ) : (
          <div className={divideClass}>
            {allNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={paginationBtnClass}
          >
            Previous
          </button>
          <span className={paginationInfoClass}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={paginationBtnClass}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
