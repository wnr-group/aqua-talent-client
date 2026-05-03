import { useState } from 'react'
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
  Menu,
  X,
} from 'lucide-react'

interface StudentNavbarProps {
  showDashboardButton?: boolean
}

export default function StudentNavbar({ showDashboardButton = true }: StudentNavbarProps) {
  const { user, logout } = useAuthContext()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-white' : 'text-white/80 hover:text-white'
    }`

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-white/90 hover:bg-blue-700/50 hover:text-white'
    }`

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628] border-b border-[rgba(0,240,255,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and nav links */}
            <div className="flex items-center gap-4 lg:gap-8">
              <Link to="/" className="flex-shrink-0">
                <Logo size="md" />
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center gap-6">
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

            {/* Right side - User info and actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User info - hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-white max-w-[120px] truncate">
                  {user?.student?.fullName}
                </span>
              </div>

              {/* Dashboard button - hide text on small screens */}
              {showDashboardButton && (
                <Link
                  to="/dashboard"
                  className="hidden sm:flex px-3 sm:px-4 py-2 rounded-xl bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-all items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
              )}

              <NotificationBell notificationsPath="/notifications" variant="dark" />

              {/* Logout button - desktop */}
              <button
                onClick={logout}
                className="hidden sm:block p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-blue-500/30">
            <div className="px-4 py-4 space-y-1 bg-[#0a1628]">
              {/* User info in mobile menu */}
              <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-blue-700/50">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user?.student?.fullName}
                  </p>
                  <p className="text-white/60 text-sm truncate">
                    {user?.student?.email}
                  </p>
                </div>
              </div>

              {/* Dashboard link in mobile */}
              {showDashboardButton && (
                <NavLink
                  to="/dashboard"
                  className={mobileNavLinkClass}
                  onClick={closeMobileMenu}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </NavLink>
              )}

              <NavLink
                to="/jobs"
                className={mobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                <Briefcase className="w-5 h-5" />
                Browse Jobs
              </NavLink>

              <NavLink
                to="/my-applications"
                className={mobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                <FileText className="w-5 h-5" />
                My Applications
              </NavLink>

              <NavLink
                to="/profile"
                className={mobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                <User className="w-5 h-5" />
                Profile
              </NavLink>

              <NavLink
                to="/subscription"
                className={mobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                <Gem className="w-5 h-5" />
                Subscription
              </NavLink>

              {/* Logout button in mobile menu */}
              <button
                onClick={() => {
                  closeMobileMenu()
                  logout()
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-white/90 hover:bg-red-500/20 hover:text-white transition-colors mt-2 border-t border-blue-500/30 pt-4"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  )
}
