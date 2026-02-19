import NotificationsContent from '@/features/notifications/components/NotificationsContent'
import StudentNavbar from '@/components/layout/StudentNavbar'

/**
 * Student portal notifications page — light theme.
 * The student layout has no sidebar, so we centre the content inline.
 */
export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />
      <main className="max-w-2xl mx-auto px-4 pt-28 pb-10">
        <NotificationsContent theme="light" />
      </main>
    </div>
  )
}
