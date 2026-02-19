import { Link, NavLink } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import NotificationBell from '@/components/common/NotificationBell'
import {
  Briefcase,
  FileText,
  User,
  LayoutDashboard,
  Gem,
  LogOut,
  GraduationCap,
} from 'lucide-react'

interface StudentNavbarProps {
  showDashboardButton?: boolean
}

export default function StudentNavbar({ showDashboardButton = true }: StudentNavbarProps) {
  const { user, logout } = useAuthContext()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-white' : 'text-white/80 hover:text-white'
    }`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-teal-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/">
              <Logo size="md" />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/jobs" className={navLinkClass}>
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Browse Jobs
                </span>
              </NavLink>
              <NavLink to="/my-applications" className={navLinkClass}>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  My Applications
                </span>
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </span>
              </NavLink>
              <NavLink to="/subscription" className={navLinkClass}>
                <span className="flex items-center gap-2">
                  <Gem className="w-4 h-4" />
                  Subscription
                </span>
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User info */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-sm font-medium text-white">
                {user?.student?.fullName}
              </span>
            </div>

            {showDashboardButton && (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-white text-teal-600 font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            <NotificationBell notificationsPath="/notifications" variant="dark" />

            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
