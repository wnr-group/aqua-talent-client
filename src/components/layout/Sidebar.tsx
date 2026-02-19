import { NavLink } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { UserType } from '@/types'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Building2,
  CheckSquare,
} from 'lucide-react'
import { ReactNode } from 'react'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
}

// Company portal routes (on company.aquatalent.local subdomain)
const companyNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Job Postings', path: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Applications', path: '/applications', icon: <FileText className="w-5 h-5" /> },
  { label: 'Company Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
]

// Student portal routes (on main domain)
const studentNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Browse Jobs', path: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'My Applications', path: '/my-applications', icon: <FileText className="w-5 h-5" /> },
  { label: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
]

// Admin portal routes (on admin.aquatalent.local subdomain)
const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Companies', path: '/companies', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Job Postings', path: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Applications', path: '/applications', icon: <CheckSquare className="w-5 h-5" /> },
  { label: 'Company Profiles', path: '/companies/profiles', icon: <User className="w-5 h-5" /> },
]

const navItemsByUserType: Record<UserType, NavItem[]> = {
  [UserType.COMPANY]: companyNavItems,
  [UserType.STUDENT]: studentNavItems,
  [UserType.ADMIN]: adminNavItems,
}

export default function Sidebar() {
  const { user } = useAuthContext()

  if (!user) return null

  const navItems = navItemsByUserType[user.userType]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-65px)]">
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/' || item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
