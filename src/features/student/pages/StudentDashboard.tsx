import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Badge from '@/components/common/Badge'
import { api } from '@/services/api/client'
import ProfileCompleteness from '@/features/student/components/ProfileCompleteness'
import type { ProfileCompletenessData } from '@/features/student/types'
import {
  FileText,
  Clock,
  Trophy,
  Search,
  User,
  ArrowRight,
  LogOut,
  Briefcase,
  Gem
} from 'lucide-react'
import Logo from '@/components/common/Logo'
import NotificationBell from '@/components/common/NotificationBell'

interface DashboardStats {
  applicationsUsed: number
  applicationLimit?: number | null
  pendingApplications: number
  isHired: boolean
}

interface SubscriptionStatus {
  subscriptionTier: 'free' | 'paid'
}

export default function StudentDashboard() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completeness, setCompleteness] = useState<ProfileCompletenessData | null>(null)
  const [isCompletenessLoading, setIsCompletenessLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardData, subscriptionData] = await Promise.all([
          api.get<DashboardStats>('/student/dashboard'),
          api.get<SubscriptionStatus>('/student/subscription'),
        ])
        setStats(dashboardData)
        setSubscription(subscriptionData)
      } catch {
        // Data will remain null
      } finally {
        setIsLoading(false)
      }
    }
    const fetchProfileHealth = async () => {
      try {
        const data = await api.get<ProfileCompletenessData>('/student/profile/completeness')
        setCompleteness(data)
      } catch {
        setCompleteness(null)
      } finally {
        setIsCompletenessLoading(false)
      }
    }

    fetchStats()
    fetchProfileHealth()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const applicationLimit = stats?.applicationLimit
  const hasUnlimitedApplications = applicationLimit === Number.POSITIVE_INFINITY
  const applicationsRemaining = hasUnlimitedApplications
    ? null
    : (applicationLimit ?? 0) - (stats?.applicationsUsed ?? 0)
  const limitedApplicationsRemaining = applicationsRemaining ?? 0
  const usageText = hasUnlimitedApplications
    ? 'Unlimited applications'
    : `${stats?.applicationsUsed ?? 0} / ${applicationLimit ?? '-'} applications`
  const isFreeTier = (subscription?.subscriptionTier ?? 'free') === 'free'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-teal-600 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <Logo size="md" />
            </Link>

            <div className="flex items-center gap-6">
              <Link
                to="/jobs"
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Link>
              <Link
                to="/my-applications"
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                My Applications
              </Link>
              <Link
                to="/profile"
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                to="/subscription"
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
              >
                <Gem className="w-4 h-4" />
                Subscription
              </Link>
              <NotificationBell notificationsPath="/notifications" variant="dark" />
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Welcome back, {user?.student?.fullName || user?.username}!
          </h1>
          <p className="text-gray-500">Here's your job search overview</p>
        </div>

        {/* Hired Status Banner */}
        {stats?.isHired && (
          <div className="mb-8 p-6 rounded-2xl bg-teal-50 border border-teal-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-teal-700">Congratulations!</h2>
                <p className="text-gray-500">You have been hired. Your job search journey is complete.</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {/* Subscription Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Gem className="w-7 h-7 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subscription</p>
                    <div className="mt-1">
                      <Badge
                        variant={isFreeTier ? 'secondary' : 'primary'}
                        className={isFreeTier ? '' : 'bg-teal-100 text-teal-700'}
                      >
                        {isFreeTier ? 'Free Tier' : 'Paid Tier'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">
                    {usageText}
                  </p>
                  {isFreeTier && (
                    <Link
                      to="/subscription"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
                    >
                      Upgrade
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Applications Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <p className="text-3xl font-display font-bold text-gray-900">
                      {stats?.applicationsUsed ?? 0}
                      {!hasUnlimitedApplications && (
                        <span className="text-lg font-normal text-gray-500"> / {applicationLimit ?? '-'}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {hasUnlimitedApplications
                      ? 'Unlimited applications available'
                      : limitedApplicationsRemaining > 0
                      ? `${limitedApplicationsRemaining} application${limitedApplicationsRemaining > 1 ? 's' : ''} remaining`
                      : 'Application limit reached'}
                  </p>
                </div>
              </div>

              {/* Pending Review Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
                    <p className="text-3xl font-display font-bold text-gray-900">
                      {stats?.pendingApplications ?? 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Awaiting employer response</p>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    stats?.isHired
                      ? 'bg-green-100'
                      : 'bg-purple-100'
                  }`}>
                    <Trophy className={`w-7 h-7 ${stats?.isHired ? 'text-green-600' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        stats?.isHired
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {stats?.isHired ? 'Hired' : 'Searching'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {stats?.isHired ? 'Journey complete' : 'Keep applying to find your match'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <ProfileCompleteness
                percentage={completeness?.percentage}
                missingItems={completeness?.missingItems}
                isLoading={isCompletenessLoading}
                description="Improve your match rate by finishing these items."
                actionSlot={
                  completeness && completeness.percentage < 100 ? (
                    <Link
                      to="/profile"
                      className="inline-flex items-center justify-center w-full md:w-auto px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
                    >
                      Update profile
                    </Link>
                  ) : null
                }
              />
            </div>

            {/* Quick Actions */}
            {!stats?.isHired && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/jobs" className="group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-teal-600" />
                        <span className="font-medium text-gray-900">Browse Jobs</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link to="/my-applications" className="group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-teal-600" />
                        <span className="font-medium text-gray-900">View Applications</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link to="/profile" className="group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-teal-600" />
                        <span className="font-medium text-gray-900">Update Profile</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {completeness && completeness.percentage < 80 && !stats?.isHired && (
              <div className="mt-6 p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Complete your profile to unlock more matches.</p>
                  <p className="text-sm text-gray-500">Add your resume, skills, and experience to reach 80%.</p>
                </div>
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Complete profile
                </Link>
              </div>
            )}

            {/* Warning for application limit */}
            {!hasUnlimitedApplications && applicationsRemaining === 0 && !stats?.isHired && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <p className="text-yellow-700 text-sm">
                  You have reached your application limit. Withdraw an existing application to apply to new jobs.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
