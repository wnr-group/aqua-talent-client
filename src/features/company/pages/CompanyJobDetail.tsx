import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Alert from '@/components/common/Alert'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { JobPosting, JobStatus, Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserCheck,
  UserX,
  User,
  Calendar,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react'

const statusStyles: Record<JobStatus, { bg: string; text: string }> = {
  [JobStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [JobStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [JobStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
  [JobStatus.CLOSED]: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

const appStatusConfig: Record<ApplicationStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive'; label: string }> = {
  [ApplicationStatus.PENDING]: { variant: 'warning', label: 'Pending' },
  [ApplicationStatus.REVIEWED]: { variant: 'primary', label: 'New Applicant' },
  [ApplicationStatus.HIRED]: { variant: 'success', label: 'Hired' },
  [ApplicationStatus.REJECTED]: { variant: 'destructive', label: 'Rejected' },
  [ApplicationStatus.WITHDRAWN]: { variant: 'default', label: 'Withdrawn' },
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

type AppFilterStatus = 'all' | ApplicationStatus.REVIEWED | ApplicationStatus.HIRED | ApplicationStatus.REJECTED

export default function CompanyJobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Application filters
  const [appFilter, setAppFilter] = useState<AppFilterStatus>('all')
  const [appSearch, setAppSearch] = useState('')
  const [appPage, setAppPage] = useState(1)
  const [appPagination, setAppPagination] = useState<Pagination | null>(null)
  const [isLoadingApps, setIsLoadingApps] = useState(false)

  // Processing state
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [closeJobModalOpen, setCloseJobModalOpen] = useState(false)
  const [isClosingJob, setIsClosingJob] = useState(false)

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await api.get<JobPosting & { _id?: string }>(`/company/jobs/${jobId}`)
        setJob({
          ...jobData,
          id: jobData.id || jobData._id || jobId || '',
        })
      } catch {
        showError('Failed to load job details')
        navigate('/jobs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [jobId, navigate, showError])

  // Fetch applications with filters
  useEffect(() => {
    const fetchApplications = async () => {
      if (!jobId) return
      setIsLoadingApps(true)
      try {
        const params = new URLSearchParams()
        if (appFilter !== 'all') params.append('status', appFilter)
        if (appSearch) params.append('search', appSearch)
        params.append('page', appPage.toString())
        params.append('limit', '15')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const appData = await api.get<{ applications: any[]; pagination: Pagination }>(
          `/company/jobs/${jobId}/applications?${params.toString()}`
        )
        const normalizedApplications: Application[] = (appData.applications || []).map(app => ({
          id: app.id || app._id || '',
          studentId: typeof app.studentId === 'object' ? (app.studentId._id || app.studentId.id) : app.studentId,
          jobPostingId: typeof app.jobPostingId === 'object' ? (app.jobPostingId._id || app.jobPostingId.id) : app.jobPostingId,
          status: app.status,
          createdAt: app.createdAt,
          rejectionReason: app.rejectionReason,
          student: app.studentId && typeof app.studentId === 'object' ? {
            id: app.studentId._id || app.studentId.id || '',
            fullName: app.studentId.fullName,
            email: app.studentId.email,
            profileLink: app.studentId.profileLink,
          } : app.student,
        }))
        setApplications(normalizedApplications)
        setAppPagination(appData.pagination)
      } catch {
        setApplications([])
      } finally {
        setIsLoadingApps(false)
      }
    }

    const debounce = setTimeout(fetchApplications, 300)
    return () => clearTimeout(debounce)
  }, [jobId, appFilter, appSearch, appPage])

  // Reset page when filters change
  useEffect(() => {
    setAppPage(1)
  }, [appFilter, appSearch])

  const handleCloseJob = async () => {
    if (!job) return
    setIsClosingJob(true)
    try {
      await api.patch(`/company/jobs/${jobId}`, { status: JobStatus.CLOSED })
      setJob({ ...job, status: JobStatus.CLOSED })
      success('Job closed successfully')
      setCloseJobModalOpen(false)
    } catch {
      showError('Failed to close job')
    } finally {
      setIsClosingJob(false)
    }
  }

  const handleHireApplicant = async (applicationId: string) => {
    setProcessingId(applicationId)
    try {
      await api.patch(`/company/applications/${applicationId}`, {
        status: ApplicationStatus.HIRED,
      })
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: ApplicationStatus.HIRED } : app
        )
      )
      success('Applicant marked as hired!')
    } catch {
      showError('Failed to update application')
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectModal = (application: Application) => {
    setSelectedApplication(application)
    setRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!selectedApplication) return
    setProcessingId(selectedApplication.id)
    try {
      await api.patch(`/company/applications/${selectedApplication.id}`, {
        status: ApplicationStatus.REJECTED,
      })
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? { ...app, status: ApplicationStatus.REJECTED } : app
        )
      )
      success('Application has been rejected')
      setRejectModalOpen(false)
      setSelectedApplication(null)
    } catch {
      showError('Failed to reject application')
    } finally {
      setProcessingId(null)
    }
  }

  const newApplicantsCount = applications.filter((a) => a.status === ApplicationStatus.REVIEWED).length

  if (isLoading) {
    return (
      <PageContainer title="Job Details">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    )
  }

  if (!job) return null

  return (
    <PageContainer title={job.title}>
      {/* Back Link */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      {/* Job Details Card */}
      <Card className="mb-8">
        <CardContent>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusStyles[job.status].bg
                  } ${statusStyles[job.status].text}`}
                >
                  {job.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {job.jobType}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Posted {format(new Date(job.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>
            </div>
            {job.status === JobStatus.APPROVED && (
              <Button variant="outline" onClick={() => setCloseJobModalOpen(true)}>
                Close Job
              </Button>
            )}
          </div>

          {job.status === JobStatus.REJECTED && job.rejectionReason && (
            <Alert variant="error" className="mb-6">
              Rejection reason: {job.rejectionReason}
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
            </div>
            {job.requirements && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Applications {appPagination ? `(${appPagination.total})` : ''}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and manage applicants for this position
              {newApplicantsCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {newApplicantsCount} new
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['all', ApplicationStatus.REVIEWED, ApplicationStatus.HIRED, ApplicationStatus.REJECTED] as const).map((status) => (
              <button
                key={status}
                onClick={() => setAppFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  appFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : appStatusConfig[status].label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="sm:ml-auto sm:w-72">
            <Input
              placeholder="Search by name or email..."
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Applications List */}
        {isLoadingApps ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
              <p className="text-gray-500">
                {appSearch || appFilter !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'No applications have been received yet.'}
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {applications.map((app) => (
                <Card key={app.id} hover={app.status === ApplicationStatus.REVIEWED}>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                        app.status === ApplicationStatus.HIRED
                          ? 'bg-green-100'
                          : app.status === ApplicationStatus.REJECTED
                          ? 'bg-red-50'
                          : 'bg-blue-100'
                      }`}>
                        {app.status === ApplicationStatus.HIRED ? (
                          <UserCheck className="w-7 h-7 text-green-600" />
                        ) : app.status === ApplicationStatus.REJECTED ? (
                          <UserX className="w-7 h-7 text-red-400" />
                        ) : (
                          <User className="w-7 h-7 text-blue-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {app.student?.fullName ?? 'Unknown Applicant'}
                              </h3>
                              <Badge variant={appStatusConfig[app.status].variant}>
                                {appStatusConfig[app.status].label}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              {app.student?.email && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-4 h-4" />
                                  {app.student.email}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                              </div>
                            </div>

                            {app.student?.profileLink && (
                              <a
                                href={app.student.profileLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Profile
                              </a>
                            )}
                          </div>

                          {/* Actions */}
                          {app.status === ApplicationStatus.REVIEWED && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleHireApplicant(app.id)}
                                disabled={processingId === app.id}
                                isLoading={processingId === app.id}
                                leftIcon={<UserCheck className="w-4 h-4" />}
                              >
                                Hire
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectModal(app)}
                                disabled={processingId === app.id}
                                leftIcon={<UserX className="w-4 h-4" />}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {appPagination && appPagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Showing {((appPage - 1) * appPagination.limit) + 1} to {Math.min(appPage * appPagination.limit, appPagination.total)} of {appPagination.total} applications
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppPage(p => p - 1)}
                    disabled={appPage === 1}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {appPage} of {appPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppPage(p => p + 1)}
                    disabled={appPage === appPagination.totalPages}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false)
          setSelectedApplication(null)
        }}
        title="Reject Application"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to reject the application from{' '}
            <span className="font-medium text-gray-900">
              {selectedApplication?.student?.fullName ?? 'this applicant'}
            </span>
            ?
          </p>
          <p className="text-sm text-gray-500">
            This action will notify the applicant that their application has been rejected.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRejectModalOpen(false)
                setSelectedApplication(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              isLoading={processingId === selectedApplication?.id}
              leftIcon={<UserX className="w-4 h-4" />}
            >
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Job Confirmation Modal */}
      <Modal
        isOpen={closeJobModalOpen}
        onClose={() => setCloseJobModalOpen(false)}
        title="Close Job Posting"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Warning</p>
              <p className="text-sm text-yellow-700 mt-1">
                Closing this job will automatically reject all pending applications.
              </p>
            </div>
          </div>
          <p className="text-gray-600">
            Are you sure you want to close <span className="font-medium text-gray-900">"{job?.title}"</span>?
          </p>
          <p className="text-sm text-gray-500">
            This job will no longer accept new applications and all pending applicants will be notified.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setCloseJobModalOpen(false)}
              disabled={isClosingJob}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCloseJob}
              isLoading={isClosingJob}
            >
              Close Job
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
