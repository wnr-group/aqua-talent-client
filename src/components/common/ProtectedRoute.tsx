import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { UserType } from '@/types'
import { getPortalBaseUrl, getPortalType } from '@/utils/subdomain'
import { tokenManager } from '@/services/api/client'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes?: UserType[]
}

export default function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext()
  const location = useLocation()
  const currentPortal = getPortalType()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-bg">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // Check if user has access to this portal/route
  if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
    // If user is on a subdomain portal (company/admin) but logged in as wrong user type,
    // clear the token and redirect to login page on this portal
    if (currentPortal === 'admin' || currentPortal === 'company') {
      // Clear the invalid token for this subdomain and show login
      tokenManager.clearToken()
      return <Navigate to="/login" replace />
    }

    // On main domain, redirect to correct portal/path
    if (user.userType === UserType.STUDENT) {
      return <Navigate to="/dashboard" replace />
    } else if (user.userType === UserType.COMPANY) {
      window.location.href = getPortalBaseUrl('company')
      return null
    } else if (user.userType === UserType.ADMIN) {
      window.location.href = getPortalBaseUrl('admin')
      return null
    }

    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
