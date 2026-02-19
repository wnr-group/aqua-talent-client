import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CompanyPageContainer from '@/features/company/components/CompanyPageContainer'
import {
  COMPANY_INPUT_STYLES,
  COMPANY_SELECT_STYLES,
} from '@/features/company/components/companyFormStyles'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { JobPosting, JobStatus, JOB_TYPES } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import { Search, MapPin, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'

const statusStyles: Record<JobStatus, string> = {
  [JobStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [JobStatus.APPROVED]: 'bg-green-100 text-green-800',
  [JobStatus.REJECTED]: 'bg-red-100 text-red-800',
  [JobStatus.CLOSED]: 'bg-gray-100 text-gray-700',
}

const CARD_BASE_CLASSES = 'bg-white border border-gray-200 rounded-xl shadow-sm'
interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CompanyJobList() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<JobStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)

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
          {(['all', JobStatus.PENDING, JobStatus.APPROVED, JobStatus.REJECTED, JobStatus.CLOSED] as const).map(
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
                  : status.charAt(0).toUpperCase() + status.slice(1)}
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
                      to={`/jobs/${job.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span>{job.jobType}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[job.status]}`}
                    >
                      {job.status}
                    </span>
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
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
