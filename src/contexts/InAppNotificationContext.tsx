import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react'
import { api } from '@/services/api/client'
import type { InAppNotification } from '@/types/entities'
import { useAuthContext } from '@/contexts/AuthContext'

const POLL_INTERVAL_MS = 30_000
const DROPDOWN_LIMIT = 7

interface InAppNotificationContextType {
  notifications: InAppNotification[]
  unreadCount: number
  isLoading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => void
}

const InAppNotificationContext = createContext<InAppNotificationContextType | undefined>(undefined)

export function InAppNotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext()
  // Single source of truth — all fetched notifications live here
  const [allNotifications, setAllNotifications] = useState<InAppNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Derived state ────────────────────────────────────────────────────────
  // unreadCount is ALWAYS derived from allNotifications — never stored separately
  const unreadCount = useMemo(
    () => allNotifications.filter((n) => !n.isRead).length,
    [allNotifications]
  )

  // Dropdown receives only the most recent DROPDOWN_LIMIT notifications
  const notifications = useMemo(
    () => allNotifications.slice(0, DROPDOWN_LIMIT),
    [allNotifications]
  )

  // ── Fetch (single call — no separate unread-count endpoint) ──────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await api.get<{ notifications: InAppNotification[] }>(
        '/notifications',
        { limit: 100 }
      )
      setAllNotifications(data.notifications ?? [])
    } catch {
      // silently ignore — non-critical feature
    }
  }, [isAuthenticated])

  const refresh = useCallback(() => {
    setIsLoading(true)
    fetchNotifications().finally(() => setIsLoading(false))
  }, [fetchNotifications])

  // ── Mutations ────────────────────────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    // Optimistic update — unreadCount auto-recalculates via useMemo
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch {
      // Revert on failure
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      )
    }
  }, [])

  const markAllRead = useCallback(async () => {
    // Optimistic update — unreadCount becomes 0 via useMemo
    setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await api.patch('/notifications/read-all')
    } catch {
      // Revert on failure — re-fetch to restore true state
      refresh()
    }
  }, [refresh])

  // ── Lifecycle: initial fetch + polling ──────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setAllNotifications([])
      return
    }

    refresh()

    timerRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isAuthenticated, refresh, fetchNotifications])

  return (
    <InAppNotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, markRead, markAllRead, refresh }}
    >
      {children}
    </InAppNotificationContext.Provider>
  )
}

export function useInAppNotifications() {
  const ctx = useContext(InAppNotificationContext)
  if (!ctx) throw new Error('useInAppNotifications must be used within InAppNotificationProvider')
  return ctx
}
