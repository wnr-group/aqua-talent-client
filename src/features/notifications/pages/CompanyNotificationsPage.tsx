import CompanyPageContainer from '@/features/company/components/CompanyPageContainer'
import NotificationsContent from '@/features/notifications/components/NotificationsContent'

/**
 * Company portal notifications page — white / gray light theme.
 * Wrapped in CompanyPageContainer so CompanyHeader + CompanySidebar are shown.
 */
export default function CompanyNotificationsPage() {
  return (
    <CompanyPageContainer>
      <div className="max-w-2xl">
        <NotificationsContent theme="light" />
      </div>
    </CompanyPageContainer>
  )
}
