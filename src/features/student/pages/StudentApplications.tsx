import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '@/contexts/NotificationContext'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StudentNavbar from '@/components/layout/StudentNavbar'
import ApplicationStatusTimeline from '@/features/student/components/ApplicationStatusTimeline'
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
  PartyPopper,
} from 'lucide-react'

interface StudentApplication extends Application {
  studentFacingStatus?: string
  statusMessage?: string
}

const statusConfig: Record<ApplicationStatus, { bg: string; text: string; border: string; icon: typeof Clock }> = {
  [ApplicationStatus.PENDING]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Clock
  },
  [ApplicationStatus.REVIEWED]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Clock
  },
  [ApplicationStatus.INTERVIEW_SCHEDULED]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: AlertCircle
  },
  [ApplicationStatus.OFFER_EXTENDED]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: AlertCircle
  },
  [ApplicationStatus.HIRED]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: PartyPopper
  },
  [ApplicationStatus.REJECTED]: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    icon: XCircle
  },
  [ApplicationStatus.WITHDRAWN]: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    icon: XCircle
  },
  [ApplicationStatus.WITHDRAWAL_REQUESTED]: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: Clock
  },
}

interface DashboardStats {
  applicationLimit?: number | null
  applicationsUsed?: number
}

export default function StudentApplications() {
  const { success, error: showError } = useNotification()
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const formatInterviewDateLocal = (interviewDate?: string | null): string | null => {
    if (!interviewDate || typeof interviewDate !== 'string') {
      return null
    }

    const parsedDate = new Date(interviewDate)
    if (Number.isNaN(parsedDate.getTime())) {
      return null
    }

    const userLocale = typeof navigator !== 'undefined' ? navigator.language : undefined
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    try {
      return new Intl.DateTimeFormat(userLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: userTimeZone,
      }).format(parsedDate)
    } catch {
      return new Intl.DateTimeFormat(userLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(parsedDate)
    }
  }

  const getStudentFacingFallback = (status: string, interviewDate?: string | null): { label: string; message: string } => {
    const normalized = String(status).toUpperCase()

    switch (normalized) {
      case 'PENDING':
        return {
          label: 'Shortlisted',
          message: "Your application is shortlisted. We'll notify you of any updates.",
        }
      case 'REVIEWED':
        return {
          label: 'Shortlisted',
          message: "Your application is shortlisted. We'll notify you of any updates.",
        }
      case 'INTERVIEW_SCHEDULED':
        {
          const localInterviewDate = formatInterviewDateLocal(interviewDate)
          if (localInterviewDate) {
            return {
              label: 'Interview Scheduled',
              message: `Great news! Your interview is scheduled for ${localInterviewDate}.`,
            }
          }
        }

        return {
          label: 'Interview Scheduled',
          message: 'Great news! Check your email for interview details.',
        }
      case 'OFFER_EXTENDED':
        return {
          label: 'Offer Extended',
          message: 'Exciting update! You have received an offer. Review the next steps carefully.',
        }
      case 'HIRED':
        return {
          label: 'Hired! Congratulations!',
          message: "Amazing news — you've been selected for this role.",
        }
      case 'REJECTED':
        return {
          label: 'Application Closed',
          message: 'This position has been filled. Keep applying!',
        }
      case 'WITHDRAWN':
        return {
          label: 'Withdrawn',
          message: 'You withdrew this application.',
        }
      default:
        return {
          label: 'Shortlisted',
          message: "Your application is shortlisted. We'll notify you of any updates.",
        }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch applications and dashboard stats in parallel
        const [applicationsData, statsData] = await Promise.all([
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          api.get<{ applications: any[] }>('/student/applications'),
          api.get<DashboardStats>('/student/dashboard'),
        ])

        // Normalize backend response to match frontend types
        const normalizedApps: StudentApplication[] = applicationsData.applications.map(app => ({
          id: app.id || app._id || '',
          studentId: app.studentId,
          jobPostingId: typeof app.jobPostingId === 'object' ? (app.jobPostingId._id || app.jobPostingId.id) : app.jobPostingId,
          status: app.status,
          createdAt: app.createdAt,
          rejectionReason: undefined,
          interviewDate: app.interviewDate,
          interviewNotes: app.interviewNotes,
          offerDetails: app.offerDetails,
          studentFacingStatus: app.studentFacingStatus,
          statusMessage: app.statusMessage,
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
        setDashboardStats(statsData)
      } catch {
        // Applications will remain empty
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

 const handleWithdraw = async (applicationId: string) => {
  try {
    await api.patch(`/student/applications/${applicationId}/withdraw`)

    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: 'withdrawn' as ApplicationStatus,
              studentFacingStatus: 'Withdrawn',
              statusMessage: 'You have withdrawn this application.',
            }
          : app
      )
    )

    success('Application withdrawn successfully.')
  } catch (err) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (err instanceof Error ? err.message : 'Failed to withdraw application')
    showError(message)
  }
}

  // Get application limit from dashboard API
  const applicationLimit = dashboardStats?.applicationLimit
  const applicationsUsed = dashboardStats?.applicationsUsed ?? 0
  const hasUnlimitedApplications = applicationLimit === null || applicationLimit === undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 sm:pb-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Active applications: {hasUnlimitedApplications
              ? `${applicationsUsed} (Unlimited)`
              : `${applicationsUsed} / ${applicationLimit}`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <p className="text-sm sm:text-base text-gray-500 mb-6">You haven't applied to any jobs yet.</p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-blue-600 text-white text-sm sm:text-base font-semibold hover:bg-blue-700 transition-all shadow-sm"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const config = statusConfig[app.status]
              const StatusIcon = config.icon
              const fallback = getStudentFacingFallback(app.status, app.interviewDate)
              const statusLabel = app.studentFacingStatus || fallback.label
              const statusMessage = app.status === ApplicationStatus.INTERVIEW_SCHEDULED
                ? fallback.message
                : app.statusMessage || fallback.message
              const canWithdraw = app.status === 'pending'

              return (
                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  {/* Mobile layout: stack vertically */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/jobs/${app.jobPostingId}`}
                        className="text-base sm:text-lg font-display font-semibold text-gray-900 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                      >
                        <span className="break-words">{app.jobPosting?.title ?? 'Unknown Job'}</span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      </Link>
                      <p className="text-sm sm:text-base text-blue-600 mt-1">
                        {app.jobPosting?.company?.name ?? 'Unknown Company'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:flex-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${config.bg} ${config.text} border ${config.border}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{statusLabel}</span>
                      </span>
                      {canWithdraw && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleWithdraw(app.id)}
                          className="text-xs sm:text-sm"
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl border ${config.bg} ${config.border}`}>
                    <p className={`text-xs sm:text-sm font-medium flex items-start sm:items-center gap-2 ${config.text}`}>
                      {app.status === ApplicationStatus.HIRED ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" /> : null}
                      <span>{statusMessage}</span>
                    </p>
                  </div>

                  {/* Timeline - hidden on small screens */}
                  <div className="hidden sm:block">
                    <ApplicationStatusTimeline status={app.status} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
