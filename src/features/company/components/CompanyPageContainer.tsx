import { ReactNode } from 'react'
import CompanyHeader from './CompanyHeader'
import CompanySidebar from './CompanySidebar'

interface CompanyPageContainerProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  showSidebar?: boolean
}

export default function CompanyPageContainer({
  children,
  title,
  description,
  actions,
  showSidebar = true,
}: CompanyPageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <CompanyHeader />
      <div className="flex">
        {showSidebar && <CompanySidebar />}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {(title || actions) && (
              <div className="mb-8 flex items-start justify-between">
                <div>
                  {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                  {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
