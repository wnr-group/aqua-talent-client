import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import NotificationToast from '@/components/common/NotificationToast'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { UserType } from '@/types'

// Auth pages (lazy loaded later, using placeholders for now)
import LoginPage from '@/features/auth/pages/LoginPage'
import CompanyRegisterPage from '@/features/auth/pages/CompanyRegisterPage'
import StudentRegisterPage from '@/features/auth/pages/StudentRegisterPage'

// Company portal pages
import CompanyDashboard from '@/features/company/pages/CompanyDashboard'
import CompanyJobList from '@/features/company/pages/CompanyJobList'
import CompanyJobCreate from '@/features/company/pages/CompanyJobCreate'
import CompanyJobDetail from '@/features/company/pages/CompanyJobDetail'
import CompanyApplications from '@/features/company/pages/CompanyApplications'

// Student portal pages
import StudentDashboard from '@/features/student/pages/StudentDashboard'
import StudentJobSearch from '@/features/student/pages/StudentJobSearch'
import StudentJobDetail from '@/features/student/pages/StudentJobDetail'
import StudentApplications from '@/features/student/pages/StudentApplications'
import StudentProfile from '@/features/student/pages/StudentProfile'

// Admin portal pages
import AdminDashboard from '@/features/admin/pages/AdminDashboard'
import AdminCompanies from '@/features/admin/pages/AdminCompanies'
import AdminJobs from '@/features/admin/pages/AdminJobs'
import AdminApplications from '@/features/admin/pages/AdminApplications'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register/company" element={<CompanyRegisterPage />} />
              <Route path="/register/student" element={<StudentRegisterPage />} />

              {/* Company portal routes */}
              <Route
                path="/company"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
                    <CompanyJobList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs/new"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
                    <CompanyJobCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs/:jobId"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
                    <CompanyJobDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/applications"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.COMPANY]}>
                    <CompanyApplications />
                  </ProtectedRoute>
                }
              />

              {/* Student portal routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
                    <StudentJobSearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs/:jobId"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
                    <StudentJobDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applications"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
                    <StudentApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.STUDENT]}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin portal routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                    <AdminCompanies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                    <AdminJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
                    <AdminApplications />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <NotificationToast />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
