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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <Logo size="md" variant="light" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3 md:gap-4">
              <NavLink
                to="/jobs"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base"
              >
                Browse Jobs
              </NavLink>
              <Link
                to="/login"
                className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all text-sm md:text-base"
              >
                Sign In
              </Link>
              <Link
                to="/register/student"
                className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all text-sm md:text-base"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
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
          <div className="sm:hidden border-t border-gray-200">
            <div className="px-4 py-4 space-y-2 bg-white">
              <NavLink
                to="/jobs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
                onClick={closeMobileMenu}
              >
                <Briefcase className="w-5 h-5" />
                Browse Jobs
              </NavLink>

              <div className="pt-2 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>

                <Link
                  to="/register/student"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
