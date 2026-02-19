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
    <div className="min-h-screen ocean-bg">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <Logo size="md" />
            </Link>

            <div className="flex items-center gap-6">
              <Link
                to="/jobs"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Link>
              <Link
                to="/my-applications"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                My Applications
              </Link>
              <Link
                to="/profile"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                to="/subscription"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Gem className="w-4 h-4" />
                Subscription
              </Link>
              <NotificationBell notificationsPath="/notifications" variant="dark" />
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-coral transition-colors flex items-center gap-2"
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
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Welcome back, {user?.student?.fullName || user?.username}!
          </h1>
          <p className="text-muted-foreground">Here's your job search overview</p>
        </div>

        {/* Hired Status Banner */}
        {stats?.isHired && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-glow-teal/20 to-glow-cyan/20 border border-glow-teal/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-glow-teal to-glow-cyan flex items-center justify-center">
                <Trophy className="w-8 h-8 text-ocean-deep" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-glow-teal">Congratulations!</h2>
                <p className="text-muted-foreground">You have been hired. Your job search journey is complete.</p>
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
              <div className="glass rounded-2xl p-6 hover:border-glow-cyan/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-glow-cyan/20 to-glow-purple/20 flex items-center justify-center border border-glow-cyan/30">
                    <Gem className="w-7 h-7 text-glow-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                    <div className="mt-1">
                      <Badge
                        variant={isFreeTier ? 'secondary' : 'primary'}
                        className={isFreeTier ? 'bg-muted text-muted-foreground' : 'bg-glow-cyan/20 text-glow-cyan border border-glow-cyan/30'}
                      >
                        {isFreeTier ? 'Free Tier' : 'Paid Tier'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    {usageText}
                  </p>
                  {isFreeTier && (
                    <Link
                      to="/subscription"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Upgrade
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Applications Card */}
              <div className="glass rounded-2xl p-6 hover:border-glow-cyan/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-glow-cyan/20 to-glow-teal/20 flex items-center justify-center border border-glow-cyan/30">
                    <FileText className="w-7 h-7 text-glow-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Applications</p>
                    <p className="text-3xl font-display font-bold text-foreground">
                      {stats?.applicationsUsed ?? 0}
                      {!hasUnlimitedApplications && (
                        <span className="text-lg font-normal text-muted-foreground"> / {applicationLimit ?? '-'}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {hasUnlimitedApplications
                      ? 'Unlimited applications available'
                      : limitedApplicationsRemaining > 0
                      ? `${limitedApplicationsRemaining} application${limitedApplicationsRemaining > 1 ? 's' : ''} remaining`
                      : 'Application limit reached'}
                  </p>
                </div>
              </div>

              {/* Pending Review Card */}
              <div className="glass rounded-2xl p-6 hover:border-sand/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sand/20 to-coral/20 flex items-center justify-center border border-sand/30">
                    <Clock className="w-7 h-7 text-sand" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-3xl font-display font-bold text-foreground">
                      {stats?.pendingApplications ?? 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Awaiting employer response</p>
                </div>
              </div>

              {/* Status Card */}
              <div className="glass rounded-2xl p-6 hover:border-glow-teal/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${
                    stats?.isHired
                      ? 'bg-gradient-to-br from-glow-teal/20 to-glow-cyan/20 border-glow-teal/30'
                      : 'bg-gradient-to-br from-glow-purple/20 to-glow-blue/20 border-glow-purple/30'
                  }`}>
                    <Trophy className={`w-7 h-7 ${stats?.isHired ? 'text-glow-teal' : 'text-glow-purple'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        stats?.isHired
                          ? 'bg-glow-teal/20 text-glow-teal border border-glow-teal/30'
                          : 'bg-glow-purple/20 text-glow-purple border border-glow-purple/30'
                      }`}
                    >
                      {stats?.isHired ? 'Hired' : 'Searching'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
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
                      className="inline-flex items-center justify-center w-full md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep font-semibold"
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
                  <div className="glass rounded-xl p-5 hover:border-glow-cyan/30 transition-all hover:glow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-glow-cyan" />
                        <span className="font-medium text-foreground">Browse Jobs</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-glow-cyan transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link to="/my-applications" className="group">
                  <div className="glass rounded-xl p-5 hover:border-glow-teal/30 transition-all hover:glow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-glow-teal" />
                        <span className="font-medium text-foreground">View Applications</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-glow-teal transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link to="/profile" className="group">
                  <div className="glass rounded-xl p-5 hover:border-glow-purple/30 transition-all hover:glow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-glow-purple" />
                        <span className="font-medium text-foreground">Update Profile</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-glow-purple transition-colors" />
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {completeness && completeness.percentage < 80 && !stats?.isHired && (
              <div className="mt-6 p-4 rounded-xl bg-glow-purple/10 border border-glow-purple/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Complete your profile to unlock more matches.</p>
                  <p className="text-sm text-muted-foreground">Add your resume, skills, and experience to reach 80%.</p>
                </div>
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-glow-purple/40 text-glow-purple hover:bg-glow-purple/10"
                >
                  Complete profile
                </Link>
              </div>
            )}

            {/* Warning for application limit */}
            {!hasUnlimitedApplications && applicationsRemaining === 0 && !stats?.isHired && (
              <div className="mt-6 p-4 rounded-xl bg-sand/10 border border-sand/30">
                <p className="text-sand text-sm">
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
