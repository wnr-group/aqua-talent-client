import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import {
  LogOut,
  Briefcase,
  FileText,
  User,
  ExternalLink,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Logo from '@/components/common/Logo'

const statusConfig: Record<ApplicationStatus, { bg: string; text: string; border: string; icon: typeof Clock }> = {
  [ApplicationStatus.PENDING]: {
    bg: 'bg-sand/10',
    text: 'text-sand',
    border: 'border-sand/30',
    icon: Clock
  },
  [ApplicationStatus.REVIEWED]: {
    bg: 'bg-glow-blue/10',
    text: 'text-glow-blue',
    border: 'border-glow-blue/30',
    icon: AlertCircle
  },
  [ApplicationStatus.HIRED]: {
    bg: 'bg-glow-teal/10',
    text: 'text-glow-teal',
    border: 'border-glow-teal/30',
    icon: CheckCircle
  },
  [ApplicationStatus.REJECTED]: {
    bg: 'bg-coral/10',
    text: 'text-coral',
    border: 'border-coral/30',
    icon: XCircle
  },
  [ApplicationStatus.WITHDRAWN]: {
    bg: 'bg-muted/10',
    text: 'text-muted-foreground',
    border: 'border-border',
    icon: XCircle
  },
}

export default function StudentApplications() {
  const { logout } = useAuthContext()
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await api.get<{ applications: any[] }>('/student/applications')
        // Normalize backend response to match frontend types
        const normalizedApps: Application[] = data.applications.map(app => ({
          id: app.id || app._id || '',
          studentId: app.studentId,
          jobPostingId: typeof app.jobPostingId === 'object' ? (app.jobPostingId._id || app.jobPostingId.id) : app.jobPostingId,
          status: app.status,
          createdAt: app.createdAt,
          rejectionReason: app.rejectionReason,
          // Map populated jobPostingId to jobPosting
          jobPosting: app.jobPostingId && typeof app.jobPostingId === 'object' ? {
            id: app.jobPostingId._id || app.jobPostingId.id || '',
            title: app.jobPostingId.title,
            location: app.jobPostingId.location,
            jobType: app.jobPostingId.jobType,
            company: app.jobPostingId.companyId ? {
              id: app.jobPostingId.companyId._id || app.jobPostingId.companyId.id || '',
              name: app.jobPostingId.companyId.name,
            } : undefined,
          } : app.jobPosting,
        }))
        setApplications(normalizedApps)
      } catch {
        // Applications will remain empty
      } finally {
        setIsLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleWithdraw = async (applicationId: string) => {
    try {
      await api.patch(`/student/applications/${applicationId}/withdraw`)
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: ApplicationStatus.WITHDRAWN }
            : app
        )
      )
      success('Application withdrawn. You can now apply to another job.')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to withdraw application')
    }
  }

  // Active = NOT withdrawn (per WTD-8 requirements)
  const activeApplications = applications.filter(
    (app) => app.status !== ApplicationStatus.WITHDRAWN
  )

  // Can withdraw if not already withdrawn, hired, or rejected
  const canWithdraw = (status: ApplicationStatus) =>
    status !== ApplicationStatus.WITHDRAWN &&
    status !== ApplicationStatus.HIRED &&
    status !== ApplicationStatus.REJECTED

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
                className="text-foreground flex items-center gap-2"
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
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Active applications: {activeApplications.length} / 2
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-glow-cyan/20 to-glow-teal/20 flex items-center justify-center border border-glow-cyan/30">
              <FileText className="w-8 h-8 text-glow-cyan" />
            </div>
            <p className="text-muted-foreground mb-6">You haven't applied to any jobs yet.</p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep font-semibold glow-sm hover:glow-md transition-all"
            >
              <Briefcase className="w-5 h-5" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const config = statusConfig[app.status]
              const StatusIcon = config.icon

              return (
                <div key={app.id} className="glass rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/jobs/${app.jobPostingId}`}
                        className="text-lg font-display font-semibold text-foreground hover:text-glow-cyan transition-colors flex items-center gap-2"
                      >
                        {app.jobPosting?.title ?? 'Unknown Job'}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <p className="text-glow-cyan mt-1">
                        {app.jobPosting?.company?.name ?? 'Unknown Company'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text} border ${config.border}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {app.status}
                      </span>
                      {canWithdraw(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="px-4 py-2 rounded-xl border border-coral/30 text-coral hover:bg-coral/10 transition-colors text-sm font-medium"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {app.status === ApplicationStatus.HIRED && (
                    <div className="mt-4 p-4 rounded-xl bg-glow-teal/10 border border-glow-teal/30">
                      <p className="text-glow-teal text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Congratulations! You've been hired for this position.
                      </p>
                    </div>
                  )}

                  {app.status === ApplicationStatus.REJECTED && (
                    <div className="mt-4 p-4 rounded-xl bg-muted/10 border border-border">
                      <p className="text-muted-foreground text-sm">
                        This application was not successful. Keep searching!
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
