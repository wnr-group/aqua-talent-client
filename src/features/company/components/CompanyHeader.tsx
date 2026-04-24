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
    <header className="bg-[#0a1628] border-b border-[rgba(0,240,255,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-white">
          <Logo size="md" variant="dark" />
       
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
            Company Portal
          </span>
        </Link>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-teal-600" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{companyName}</p>
                <p className="text-xs text-white/50">{user.username}</p>
              </div>
            </div>

            <NotificationBell notificationsPath="/notifications" variant="dark" />

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/70 border border-white/10 bg-white/5 hover:text-white hover:bg-white/10 transition-colors"
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
