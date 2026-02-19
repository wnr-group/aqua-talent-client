import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CompanyPageContainer from '@/features/company/components/CompanyPageContainer'
import {
  COMPANY_INPUT_STYLES,
  COMPANY_SELECT_STYLES,
} from '@/features/company/components/companyFormStyles'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useNotification } from '@/contexts/NotificationContext'
import { JobPosting, JobStatus, JOB_TYPES } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import { Search, MapPin, ChevronLeft, ChevronRight, Briefcase, Pencil, Send, EyeOff, RefreshCw } from 'lucide-react'

const statusStyles: Record<JobStatus, string> = {
  [JobStatus.DRAFT]: 'bg-gray-100 text-gray-600',
  [JobStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [JobStatus.APPROVED]: 'bg-green-100 text-green-800',
  [JobStatus.REJECTED]: 'bg-red-100 text-red-800',
  [JobStatus.UNPUBLISHED]: 'bg-orange-100 text-orange-800',
  [JobStatus.CLOSED]: 'bg-gray-200 text-gray-700',
}

const statusLabels: Record<JobStatus, string> = {
  [JobStatus.DRAFT]: 'Draft',
  [JobStatus.PENDING]: 'Pending',
  [JobStatus.APPROVED]: 'Approved',
  [JobStatus.REJECTED]: 'Rejected',
  [JobStatus.UNPUBLISHED]: 'Unpublished',
  [JobStatus.CLOSED]: 'Closed',
}

const CARD_BASE_CLASSES = 'bg-white border border-gray-200 rounded-xl shadow-sm'
interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CompanyJobList() {
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<JobStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') params.append('status', filter)
        if (search) params.append('search', search)
        if (location) params.append('location', location)
        if (jobType) params.append('jobType', jobType)
        params.append('page', page.toString())
        params.append('limit', '10')

        const data = await api.get<{ jobs: (JobPosting & { _id?: string })[]; pagination: Pagination }>(
          `/company/jobs?${params.toString()}`
        )
        // Normalize MongoDB _id to id
        const normalizedJobs = data.jobs.map(job => ({
          ...job,
          id: job.id || job._id || '',
        }))
        setJobs(normalizedJobs)
        setPagination(data.pagination)
      } catch {
        // Jobs will remain empty
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchJobs, 300)
    return () => clearTimeout(debounce)
  }, [filter, search, location, jobType, page])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [filter, search, location, jobType])

  const refetchJobs = () => {
    // Trigger re-fetch by toggling a dummy dep — simplest approach is to
    // just re-set page which is already a dep of the fetch effect
    setPage((p) => p)
  }

  const handleSubmitDraft = async (jobId: string) => {
    setActionLoading(jobId)
    try {
      await api.patch(`/company/jobs/${jobId}`, { status: 'pending' })
      success('Job submitted for review!')
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: JobStatus.PENDING } : j)))
    } catch {
      showError('Failed to submit job')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnpublish = async (jobId: string) => {
    setActionLoading(jobId)
    try {
      await api.patch(`/company/jobs/${jobId}/unpublish`, {})
      success('Job unpublished. Students can no longer see it.')
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: JobStatus.UNPUBLISHED } : j)))
    } catch {
      showError('Failed to unpublish job')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRepublish = async (jobId: string) => {
    setActionLoading(jobId)
    try {
      await api.patch(`/company/jobs/${jobId}/republish`, {})
      success('Job resubmitted for review.')
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: JobStatus.PENDING } : j)))
    } catch {
      showError('Failed to republish job')
    } finally {
      setActionLoading(null)
    }
  }

  void refetchJobs // suppress unused warning – exists as a util

  return (
    <CompanyPageContainer
      title="Job Postings"
      actions={
        <Link to="/jobs/new">
          <Button>Create New Job</Button>
        </Link>
      }
    >
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', JobStatus.DRAFT, JobStatus.PENDING, JobStatus.APPROVED, JobStatus.UNPUBLISHED, JobStatus.REJECTED, JobStatus.CLOSED] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  filter === status
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status === 'all'
                  ? 'All'
                  : statusLabels[status]}
              </button>
            )
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={COMPANY_INPUT_STYLES}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Input
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={COMPANY_INPUT_STYLES}
            leftIcon={<MapPin className="w-4 h-4" />}
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
      ) : jobs.length === 0 ? (
        <Card className={`${CARD_BASE_CLASSES} text-gray-900`}>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {search || location || jobType || filter !== 'all'
                ? 'Try adjusting your search criteria.'
                : "You haven't posted any jobs yet."}
            </p>
            <Link to="/jobs/new">
              <Button>Post Your First Job</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className={`${CARD_BASE_CLASSES} text-gray-900`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to={job.status === JobStatus.DRAFT ? `/jobs/${job.id}/edit` : `/jobs/${job.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {job.title || '(Untitled Draft)'}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {job.location && <span>{job.location}</span>}
                      {job.jobType && <span>{job.jobType}</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[job.status]}`}
                    >
                      {statusLabels[job.status]}
                    </span>

                    {/* Contextual actions */}
                    {job.status === JobStatus.DRAFT && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/jobs/${job.id}/edit`)}
                          leftIcon={<Pencil className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitDraft(job.id)}
                          isLoading={actionLoading === job.id}
                          disabled={!!actionLoading}
                          leftIcon={<Send className="w-4 h-4" />}
                        >
                          Submit
                        </Button>
                      </>
                    )}

                    {job.status === JobStatus.APPROVED && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnpublish(job.id)}
                          isLoading={actionLoading === job.id}
                          disabled={!!actionLoading}
                          leftIcon={<EyeOff className="w-4 h-4" />}
                        >
                          Unpublish
                        </Button>
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </>
                    )}

                    {job.status === JobStatus.UNPUBLISHED && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleRepublish(job.id)}
                          isLoading={actionLoading === job.id}
                          disabled={!!actionLoading}
                          leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                          Republish
                        </Button>
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </>
                    )}

                    {(job.status === JobStatus.PENDING ||
                      job.status === JobStatus.REJECTED ||
                      job.status === JobStatus.CLOSED) && (
                      <Link to={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} jobs
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
                <span className="px-3 py-1 text-sm text-muted-foreground">
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
    </CompanyPageContainer>
  )
}
