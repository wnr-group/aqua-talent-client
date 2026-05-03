import { useAuthContext } from '@/contexts/AuthContext'
import { UserType } from '@/types'
import Button from '@/components/common/Button'
import Logo from '@/components/common/Logo'
import NotificationBell from '@/components/common/NotificationBell'
import { LogOut, User } from 'lucide-react'

const userTypeLabels: Record<UserType, string> = {
  [UserType.COMPANY]: 'Company Portal',
  [UserType.STUDENT]: 'Student Portal',
  [UserType.ADMIN]: 'Admin Portal',
}

const userTypeColors: Record<UserType, string> = {
  [UserType.COMPANY]: 'bg-white/10 text-white border border-white/20',
  [UserType.STUDENT]: 'bg-white/10 text-white border border-white/20',
  [UserType.ADMIN]: 'bg-white/10 text-white border border-white/20',
}

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthContext()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Error handled by notification context
    }
  }

  return (
    <header className="bg-[#0a1628] border-b border-[rgba(0,240,255,0.15)]">
      <div className="flex items-center justify-between px-6 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Logo size="md" variant="light" />
          {user && (
            <span className={`hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${userTypeColors[user.userType]}`}>
              {userTypeLabels[user.userType]}
            </span>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white/70" />
              </div>
              <span className="font-medium text-white">{user.username}</span>
            </div>
            <NotificationBell notificationsPath="/notifications" variant="light" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
