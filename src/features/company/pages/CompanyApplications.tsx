import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CompanyPageContainer from '@/features/company/components/CompanyPageContainer'
import {
  COMPANY_INPUT_STYLES,
  COMPANY_SELECT_STYLES,
} from '@/features/company/components/companyFormStyles'
import StudentProfileModal from '@/features/company/components/StudentProfileModal'
import InterviewScheduleModal from '@/features/company/components/InterviewScheduleModal'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useNotification } from '@/contexts/NotificationContext'
import { Application, ApplicationStatus, JOB_TYPES } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import {
  User,
  Briefcase,
  Calendar,
  ExternalLink,
  UserCheck,
  FileText,
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react'

const statusConfig: Record<ApplicationStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive'; label: string }> = {
  [ApplicationStatus.PENDING]: { variant: 'warning', label: 'Pending' },
  [ApplicationStatus.REVIEWED]: { variant: 'primary', label: 'New Applicant' },
  [ApplicationStatus.INTERVIEW_SCHEDULED]: { variant: 'primary', label: 'Interview Scheduled' },
  [ApplicationStatus.OFFER_EXTENDED]: { variant: 'warning', label: 'Offer Extended' },
  [ApplicationStatus.HIRED]: { variant: 'success', label: 'Hired' },
  [ApplicationStatus.REJECTED]: { variant: 'destructive', label: 'Rejected' },
  [ApplicationStatus.WITHDRAWN]: { variant: 'default', label: 'Withdrawn' },
  [ApplicationStatus.WITHDRAWAL_REQUESTED]: { variant: 'warning', label: 'Withdrawal Requested' },
}

const CARD_BASE_CLASSES = 'bg-white border border-gray-200 rounded-xl shadow-sm'
type FilterStatus =
  | 'all'
  | ApplicationStatus.REVIEWED
  | ApplicationStatus.INTERVIEW_SCHEDULED
  | ApplicationStatus.OFFER_EXTENDED
  | ApplicationStatus.HIRED
  | ApplicationStatus.REJECTED

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CompanyApplications() {
  const { success, error: showError } = useNotification()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<Record<string, ApplicationStatus>>({})
  const [rejectionMessages, setRejectionMessages] = useState<Record<string, string>>({})
  const [interviewModalOpen, setInterviewModalOpen] = useState(false)
  const [interviewApplication, setInterviewApplication] = useState<Application | null>(null)

  // Student profile modal
  const [studentProfileModalOpen, setStudentProfileModalOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedStudentName, setSelectedStudentName] = useState<string>('')

  const openStudentProfile = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId)
    setSelectedStudentName(studentName)
    setStudentProfileModalOpen(true)
  }

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') params.append('status', filter)
        if (search) params.append('search', search)
        if (location) params.append('location', location)
        if (jobType) params.append('jobType', jobType)
        params.append('page', page.toString())
        params.append('limit', '15')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await api.get<{ applications: any[]; pagination: Pagination }>(
          `/company/applications?${params.toString()}`
        )
        // Normalize backend response to match frontend types
        const normalizedApplications: Application[] = data.applications.map(app => ({
          id: app.id || app._id || '',
          studentId: typeof app.studentId === 'object' ? (app.studentId._id || app.studentId.id) : app.studentId,
          jobPostingId: typeof app.jobPostingId === 'object' ? (app.jobPostingId._id || app.jobPostingId.id) : app.jobPostingId,
          status: app.status,
          createdAt: app.createdAt,
          rejectionReason: app.rejectionReason,
          // Map populated studentId to student
          student: app.studentId && typeof app.studentId === 'object' ? {
            id: app.studentId._id || app.studentId.id || '',
            fullName: app.studentId.fullName,
            email: app.studentId.email,
            profileLink: app.studentId.profileLink,
          } : app.student,
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
        setApplications(normalizedApplications)
        setPagination(data.pagination)
      } catch {
        // Applications will remain empty
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchApplications, 300)
    return () => clearTimeout(debounce)
  }, [filter, search, location, jobType, page])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [filter, search, location, jobType])

  const updateApplicationStatus = async (
    application: Application,
    nextStatus: ApplicationStatus,
    payload?: {
      interviewDate?: string
      interviewNotes?: string
      offerDetails?: string
      rejectionReason?: string | null
    }
  ) => {
    setProcessingId(application.id)
    try {
      await api.patch(`/company/applications/${application.id}`, {
        status: nextStatus,
        ...payload,
      })
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id
            ? {
                ...app,
                status: nextStatus,
                interviewDate: payload?.interviewDate ?? app.interviewDate,
                interviewNotes: payload?.interviewNotes ?? app.interviewNotes,
                offerDetails: payload?.offerDetails ?? app.offerDetails,
              }
            : app
        )
      )
      setSelectedStatus((prev) => ({ ...prev, [application.id]: nextStatus }))

      if (nextStatus === ApplicationStatus.INTERVIEW_SCHEDULED) {
        success('Interview scheduled successfully')
      } else if (nextStatus === ApplicationStatus.OFFER_EXTENDED) {
        success('Offer extended successfully')
      } else if (nextStatus === ApplicationStatus.HIRED) {
        success('Applicant has been hired!')
      } else if (nextStatus === ApplicationStatus.REJECTED) {
        success('Application has been rejected')
      } else {
        success('Application status updated')
      }
    } catch {
      showError('Failed to update application')
    } finally {
      setProcessingId(null)
    }
  }

  const getTransitionOptions = (status: ApplicationStatus): ApplicationStatus[] => {
    if (status === ApplicationStatus.REVIEWED) {
      return [
        ApplicationStatus.INTERVIEW_SCHEDULED,
        ApplicationStatus.OFFER_EXTENDED,
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
      ]
    }
    if (status === ApplicationStatus.INTERVIEW_SCHEDULED) {
      return [
        ApplicationStatus.OFFER_EXTENDED,
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
      ]
    }
    if (status === ApplicationStatus.OFFER_EXTENDED) {
      return [
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
      ]
    }
    return []
  }

  const handleStatusUpdate = async (application: Application) => {
    const nextStatus = selectedStatus[application.id]
    if (!nextStatus) {
      showError('Please select a status to update')
      return
    }

    if (nextStatus === ApplicationStatus.INTERVIEW_SCHEDULED) {
      setInterviewApplication(application)
      setInterviewModalOpen(true)
      return
    }

    if (nextStatus === ApplicationStatus.REJECTED) {
      const rejectionMessage = (rejectionMessages[application.id] || '').trim()
      await updateApplicationStatus(application, nextStatus, {
        rejectionReason: rejectionMessage.length > 0 ? rejectionMessage : null,
      })
      return
    }

    await updateApplicationStatus(application, nextStatus)
  }

  const handleConfirmInterview = async (interviewDate: string, interviewNotes: string) => {
    if (!interviewApplication) return
    await updateApplicationStatus(interviewApplication, ApplicationStatus.INTERVIEW_SCHEDULED, {
      interviewDate,
      interviewNotes,
    })
    setInterviewModalOpen(false)
    setInterviewApplication(null)
  }

  const newApplicantsCount = applications.filter((a) => a.status === ApplicationStatus.REVIEWED).length

  return (
    <CompanyPageContainer
      title="Applications"
      description={`Review applicants for your job postings${newApplicantsCount > 0 ? ` • ${newApplicantsCount} new` : ''}`}
    >
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            'all',
            ApplicationStatus.REVIEWED,
            ApplicationStatus.INTERVIEW_SCHEDULED,
            ApplicationStatus.OFFER_EXTENDED,
            ApplicationStatus.HIRED,
            ApplicationStatus.REJECTED,
          ] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                filter === status
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : statusConfig[status].label}
              {status === ApplicationStatus.REVIEWED && newApplicantsCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-100">
                  {newApplicantsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search student name, email, job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className={COMPANY_INPUT_STYLES}
          />
          <Input
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
            className={COMPANY_INPUT_STYLES}
          />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className={COMPANY_SELECT_STYLES}
          >
            <option value="">All Job Types</option>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <Card className={CARD_BASE_CLASSES}>
          <div className="text-center py-12 text-gray-900">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No applications found</h3>
            <p className="text-gray-500">
              {filter !== 'all' || search || location || jobType
                ? 'Try adjusting your search criteria.'
                : 'No applications have been approved by admin yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((app) => (
              <Card
                key={app.id}
                hover={app.status === ApplicationStatus.REVIEWED}
                className={`${CARD_BASE_CLASSES} text-gray-900`}
              >
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            app.status === ApplicationStatus.HIRED
                              ? 'bg-green-50 border-green-100 text-green-600'
                              : app.status === ApplicationStatus.REJECTED
                              ? 'bg-red-50 border-red-100 text-red-600'
                              : 'bg-teal-50 border-teal-100 text-teal-600'
                          }`}
                        >
                          {app.status === ApplicationStatus.HIRED ? (
                            <UserCheck className="w-6 h-6" />
                          ) : (
                            <User className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {app.student?.fullName ?? 'Unknown Applicant'}
                            </h3>
                            <Badge variant={statusConfig[app.status].variant}>
                              {statusConfig[app.status].label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <button
                              onClick={() => openStudentProfile(app.studentId, app.student?.fullName ?? 'Student')}
                              className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Full Profile
                            </button>
                            {app.student?.profileLink && (
                              <a
                                href={app.student.profileLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                External Link
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              <Link
                                to={`/jobs/${app.jobPostingId}`}
                                className="hover:text-teal-600 transition-colors"
                              >
                                {app.jobPosting?.title ?? 'Unknown Job'}
                              </Link>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(app.status === ApplicationStatus.REVIEWED ||
                      app.status === ApplicationStatus.INTERVIEW_SCHEDULED ||
                      app.status === ApplicationStatus.OFFER_EXTENDED) && (
                      <div className="flex-shrink-0 flex gap-2">
                        <select
                          value={selectedStatus[app.id] || ''}
                          onChange={(event) =>
                            setSelectedStatus((prev) => ({
                              ...prev,
                              [app.id]: event.target.value as ApplicationStatus,
                            }))
                          }
                          className={COMPANY_SELECT_STYLES}
                        >
                          <option value="">Update status...</option>
                          {getTransitionOptions(app.status).map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusConfig[statusOption].label}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(app)}
                          disabled={processingId === app.id || !selectedStatus[app.id]}
                          isLoading={processingId === app.id}
                          leftIcon={<Check className="w-4 h-4" />}
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>

                  {selectedStatus[app.id] === ApplicationStatus.REJECTED && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Message (Optional)
                      </label>
                      <textarea
                        value={rejectionMessages[app.id] || ''}
                        onChange={(event) =>
                          setRejectionMessages((prev) => ({
                            ...prev,
                            [app.id]: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Add an optional message for the candidate"
                        className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-colors duration-150 resize-y"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} applications
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <InterviewScheduleModal
        isOpen={interviewModalOpen}
        onClose={() => {
          setInterviewModalOpen(false)
          setInterviewApplication(null)
        }}
        onConfirm={handleConfirmInterview}
        applicantName={interviewApplication?.student?.fullName}
        jobTitle={interviewApplication?.jobPosting?.title}
        isSubmitting={processingId === interviewApplication?.id}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={studentProfileModalOpen}
        onClose={() => setStudentProfileModalOpen(false)}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
      />
    </CompanyPageContainer>
  )
}
