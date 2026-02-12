import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { UserType } from '@/types'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes?: UserType[]
}

export default function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
