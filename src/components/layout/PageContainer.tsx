import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface PageContainerProps {
  children: ReactNode
  title?: string
  description?: string
  showSidebar?: boolean
  actions?: ReactNode
}

export default function PageContainer({
  children,
  title,
  description,
  showSidebar = true,
  actions,
}: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {(title || actions) && (
              <div className="mb-8 flex items-start justify-between">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-3">{actions}</div>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
