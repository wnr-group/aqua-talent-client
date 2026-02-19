import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

const navItems = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Job Postings', path: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Applications', path: '/applications', icon: <FileText className="w-5 h-5" /> },
  { label: 'Company Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
]

export default function CompanySidebar() {
  const { user } = useAuthContext()

  if (!user) return null

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
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
        ))}
      </nav>
    </aside>
  )
}
