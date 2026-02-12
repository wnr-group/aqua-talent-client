import { NavLink } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { UserType } from '@/types'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Building2,
  Search,
  CheckSquare,
} from 'lucide-react'
import { ReactNode } from 'react'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
}

const companyNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/company', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Job Postings', path: '/company/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="w-5 h-5" /> },
]

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Browse Jobs', path: '/student/jobs', icon: <Search className="w-5 h-5" /> },
  { label: 'My Applications', path: '/student/applications', icon: <FileText className="w-5 h-5" /> },
  { label: 'Profile', path: '/student/profile', icon: <User className="w-5 h-5" /> },
]

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Companies', path: '/admin/companies', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Job Postings', path: '/admin/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Applications', path: '/admin/applications', icon: <CheckSquare className="w-5 h-5" /> },
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
                end={item.path === '/company' || item.path === '/student' || item.path === '/admin'}
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
