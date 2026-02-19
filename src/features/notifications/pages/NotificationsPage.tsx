import NotificationsContent from '@/features/notifications/components/NotificationsContent'

/**
 * Student portal notifications page — ocean dark theme.
 * The student layout has no sidebar, so we centre the content inline.
 */
export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <NotificationsContent theme="ocean" />
    </div>
  )
}
