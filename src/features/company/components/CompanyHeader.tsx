import { Link } from 'react-router-dom'
import { LogOut, Building2 } from 'lucide-react'
import Logo from '@/components/common/Logo'
import { useAuthContext } from '@/contexts/AuthContext'
import NotificationBell from '@/components/common/NotificationBell'

export default function CompanyHeader() {
  const { user, logout, isAuthenticated } = useAuthContext()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Notification context handles any errors
    }
  }

  const companyName = user?.company?.name || user?.username || 'Company'

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-gray-900">
          <Logo size="md" />
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Company Portal
          </span>
        </Link>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-900">{companyName}</p>
                <p className="text-xs text-gray-500">{user.username}</p>
              </div>
            </div>

            <NotificationBell notificationsPath="/notifications" variant="light" />

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:text-gray-900 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
