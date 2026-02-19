import { PageContainer } from '@/components/layout'
import NotificationsContent from '@/features/notifications/components/NotificationsContent'

/**
 * Admin portal notifications page — white / gray light theme.
 * Wrapped in PageContainer so the shared Header + Sidebar are shown.
 */
export default function AdminNotificationsPage() {
  return (
    <PageContainer>
      <div className="max-w-2xl">
        <NotificationsContent theme="light" />
      </div>
    </PageContainer>
  )
}
