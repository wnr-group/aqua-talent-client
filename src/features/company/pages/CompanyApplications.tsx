import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
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
  UserX,
  FileText,
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const statusConfig: Record<ApplicationStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive'; label: string }> = {
  [ApplicationStatus.PENDING]: { variant: 'warning', label: 'Pending' },
  [ApplicationStatus.REVIEWED]: { variant: 'primary', label: 'New Applicant' },
  [ApplicationStatus.HIRED]: { variant: 'success', label: 'Hired' },
  [ApplicationStatus.REJECTED]: { variant: 'destructive', label: 'Rejected' },
  [ApplicationStatus.WITHDRAWN]: { variant: 'default', label: 'Withdrawn' },
}

type FilterStatus = 'all' | ApplicationStatus.REVIEWED | ApplicationStatus.HIRED | ApplicationStatus.REJECTED

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
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

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

  const handleHire = async (applicationId: string) => {
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
      success('Applicant has been hired!')
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

  return (
    <PageContainer
      title="Applications"
      description={`Review applicants for your job postings${newApplicantsCount > 0 ? ` • ${newApplicantsCount} new` : ''}`}
    >
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', ApplicationStatus.REVIEWED, ApplicationStatus.HIRED, ApplicationStatus.REJECTED] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : statusConfig[status].label}
              {status === ApplicationStatus.REVIEWED && newApplicantsCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
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
          />
          <Input
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <Card>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
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
              <Card key={app.id} hover={app.status === ApplicationStatus.REVIEWED}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          app.status === ApplicationStatus.HIRED ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {app.status === ApplicationStatus.HIRED ? (
                            <UserCheck className="w-6 h-6 text-green-600" />
                          ) : (
                            <User className="w-6 h-6 text-blue-600" />
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

                          {app.student?.profileLink && (
                            <a
                              href={app.student.profileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-3"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Profile
                            </a>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              <Link
                                to={`/jobs/${app.jobPostingId}`}
                                className="hover:text-blue-600 transition-colors"
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

                    {app.status === ApplicationStatus.REVIEWED && (
                      <div className="flex-shrink-0 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleHire(app.id)}
                          disabled={processingId === app.id}
                          isLoading={processingId === app.id}
                          leftIcon={<UserCheck className="w-4 h-4" />}
                        >
                          Mark as Hired
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
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
    </PageContainer>
  )
}
