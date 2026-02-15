import { Link, NavLink } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import {
  Briefcase,
  FileText,
  User,
  LayoutDashboard,
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
      isActive ? 'text-glow-cyan' : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
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
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User info */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-glow-cyan to-glow-teal flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-ocean-deep" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {user?.student?.fullName}
              </span>
            </div>

            {showDashboardButton && (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep font-semibold glow-sm hover:glow-md transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            <button
              onClick={logout}
              className="p-2.5 rounded-xl glass hover:border-coral/30 text-muted-foreground hover:text-coral transition-all"
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
