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
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    icon: Clock
  },
  [ApplicationStatus.REVIEWED]: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
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

export default function StudentApplications() {
  const { success, error: showError } = useNotification()
  const [applications, setApplications] = useState<StudentApplication[]>([])
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
    const fetchApplications = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await api.get<{ applications: any[] }>('/student/applications')
        // Normalize backend response to match frontend types
        const normalizedApps: StudentApplication[] = data.applications.map(app => ({
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

  // Active = NOT withdrawn (per WTD-8 requirements)
  const activeApplications = applications.filter(
    (app) => app.status !== ApplicationStatus.WITHDRAWN
  )

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
              const fallback = getStudentFacingFallback(app.status, app.interviewDate)
              const statusLabel = app.studentFacingStatus || fallback.label
              const statusMessage = app.status === ApplicationStatus.INTERVIEW_SCHEDULED
                ? fallback.message
                : app.statusMessage || fallback.message
              const canWithdraw = app.status === 'pending'

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
                        {statusLabel}
                      </span>
                      {canWithdraw && (
                          <Button
                            variant="destructive"
                            onClick={() => handleWithdraw(app.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                    </div>
                  </div>

                  <div className={`mt-4 p-4 rounded-xl border ${config.bg} ${config.border}`}>
                    <p className={`text-sm font-medium flex items-center gap-2 ${config.text}`}>
                      {app.status === ApplicationStatus.HIRED ? <CheckCircle className="w-5 h-5" /> : null}
                      {statusMessage}
                    </p>
                  </div>

                  <ApplicationStatusTimeline status={app.status} />
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
