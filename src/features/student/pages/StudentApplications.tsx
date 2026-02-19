import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '@/contexts/NotificationContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StudentNavbar from '@/components/layout/StudentNavbar'
import { Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import {
  Briefcase,
  FileText,
  ExternalLink,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

const statusConfig: Record<ApplicationStatus, { bg: string; text: string; border: string; icon: typeof Clock }> = {
  [ApplicationStatus.PENDING]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: Clock
  },
  [ApplicationStatus.REVIEWED]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: AlertCircle
  },
  [ApplicationStatus.HIRED]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: CheckCircle
  },
  [ApplicationStatus.REJECTED]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle
  },
  [ApplicationStatus.WITHDRAWN]: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    icon: XCircle
  },
}

export default function StudentApplications() {
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
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-500">
            Active applications: {activeApplications.length} / 2
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-200">
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-gray-500 mb-6">You haven't applied to any jobs yet.</p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all shadow-sm"
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
                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/jobs/${app.jobPostingId}`}
                        className="text-lg font-display font-semibold text-gray-900 hover:text-teal-600 transition-colors flex items-center gap-2"
                      >
                        {app.jobPosting?.title ?? 'Unknown Job'}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <p className="text-teal-600 mt-1">
                        {app.jobPosting?.company?.name ?? 'Unknown Company'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
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
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {app.status === ApplicationStatus.HIRED && (
                    <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Congratulations! You've been hired for this position.
                      </p>
                    </div>
                  )}

                  {app.status === ApplicationStatus.REJECTED && (
                    <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-gray-500 text-sm">
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
