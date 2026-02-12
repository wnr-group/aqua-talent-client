import { useAuthContext } from '@/contexts/AuthContext'
import { UserType } from '@/types'
import Button from '@/components/common/Button'
import { Droplet, LogOut, User } from 'lucide-react'

const userTypeLabels: Record<UserType, string> = {
  [UserType.COMPANY]: 'Company Portal',
  [UserType.STUDENT]: 'Student Portal',
  [UserType.ADMIN]: 'Admin Portal',
}

const userTypeColors: Record<UserType, string> = {
  [UserType.COMPANY]: 'bg-purple-100 text-purple-700',
  [UserType.STUDENT]: 'bg-blue-100 text-blue-700',
  [UserType.ADMIN]: 'bg-orange-100 text-orange-700',
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
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Aqua Talent</h1>
          </div>
          {user && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${userTypeColors[user.userType]}`}>
              {userTypeLabels[user.userType]}
            </span>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <span className="font-medium text-gray-900">{user.username}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
