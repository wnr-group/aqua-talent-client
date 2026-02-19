import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { InAppNotificationProvider } from '@/contexts/InAppNotificationContext'
import NotificationToast from '@/components/common/NotificationToast'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { UserType } from '@/types'
import { getPortalType } from '@/utils/subdomain'

// Public pages
import LandingPage from '@/features/public/pages/LandingPage'
import PublicJobsPage from '@/features/public/pages/PublicJobsPage'
import PublicJobDetailPage from '@/features/public/pages/PublicJobDetailPage'

// Auth pages
import LoginPage from '@/features/auth/pages/LoginPage'
import CompanyRegisterPage from '@/features/auth/pages/CompanyRegisterPage'
import StudentRegisterPage from '@/features/auth/pages/StudentRegisterPage'

// Company portal pages
import CompanyDashboard from '@/features/company/pages/CompanyDashboard'
import CompanyJobList from '@/features/company/pages/CompanyJobList'
import CompanyJobCreate from '@/features/company/pages/CompanyJobCreate'
import CompanyJobDetail from '@/features/company/pages/CompanyJobDetail'
import CompanyApplications from '@/features/company/pages/CompanyApplications'
import CompanyProfile from '@/features/company/pages/CompanyProfile'

// Student portal pages
import StudentDashboard from '@/features/student/pages/StudentDashboard'
import StudentApplications from '@/features/student/pages/StudentApplications'
import StudentProfile from '@/features/student/pages/StudentProfile'
import SubscriptionPage from '@/features/student/pages/SubscriptionPage'
import PaymentSuccessPage from '@/features/student/pages/PaymentSuccessPage'

// Admin portal pages
import AdminDashboard from '@/features/admin/pages/AdminDashboard'
import AdminCompanies from '@/features/admin/pages/AdminCompanies'
import AdminJobs from '@/features/admin/pages/AdminJobs'
import AdminApplications from '@/features/admin/pages/AdminApplications'
import AdminCompanyProfile from '@/features/admin/pages/AdminCompanyProfile'

// Portal-specific notification pages
import NotificationsPage from '@/features/notifications/pages/NotificationsPage'
import CompanyNotificationsPage from '@/features/notifications/pages/CompanyNotificationsPage'
import AdminNotificationsPage from '@/features/notifications/pages/AdminNotificationsPage'

// Get portal type based on subdomain
const portalType = getPortalType()

function PublicRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/jobs" element={<PublicJobsPage />} />
      <Route path="/jobs/:jobId" element={<PublicJobDetailPage />} />

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/company" element={<CompanyRegisterPage />} />
      <Route path="/register/student" element={<StudentRegisterPage />} />

      {/* Student portal routes (on main domain) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
            <StudentApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription/success"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function CompanyPortalRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<CompanyRegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
            <CompanyJobList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/new"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
            <CompanyJobCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
            <CompanyJobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
            <CompanyApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
            <CompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
            <CompanyNotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AdminPortalRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
            <AdminCompanies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies/profiles"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
            <AdminCompanyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies/profiles/:companyId"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
            <AdminCompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
            <AdminJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
            <AdminApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
            <AdminNotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppRoutes() {
  // Subdomain-based routing (company and admin only)
  switch (portalType) {
    case 'company':
      return <CompanyPortalRoutes />
    case 'admin':
      return <AdminPortalRoutes />
    default:
      // Main domain serves public pages + student portal
      return <PublicRoutes />
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <InAppNotificationProvider>
            <div className="min-h-screen bg-background">
              <AppRoutes />
              <NotificationToast />
            </div>
          </InAppNotificationProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
