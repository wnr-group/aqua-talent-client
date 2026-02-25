import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import {
  Briefcase,
  LogIn,
  UserPlus,
  Menu,
  X,
} from 'lucide-react'

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3 md:gap-4">
              <NavLink
                to="/jobs"
                className="text-white/80 hover:text-white transition-colors font-medium text-sm md:text-base"
              >
                Browse Jobs
              </NavLink>
              <Link
                to="/login"
                className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all text-sm md:text-base"
              >
                Sign In
              </Link>
              <Link
                to="/register/student"
                className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-all text-sm md:text-base"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
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

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-blue-500/30">
            <div className="px-4 py-4 space-y-2 bg-blue-600">
              <NavLink
                to="/jobs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-white/90 hover:bg-blue-700/50 hover:text-white'
                  }`
                }
                onClick={closeMobileMenu}
              >
                <Briefcase className="w-5 h-5" />
                Browse Jobs
              </NavLink>

              <div className="pt-2 border-t border-blue-500/30 space-y-2">
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-white/90 hover:bg-blue-700/50 hover:text-white transition-colors"
                  onClick={closeMobileMenu}
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>

                <Link
                  to="/register/student"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium bg-white text-blue-600 hover:bg-gray-100 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <UserPlus className="w-5 h-5" />
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  )
}
