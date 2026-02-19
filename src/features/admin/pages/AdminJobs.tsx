import { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { JobPosting, JobStatus, JOB_TYPES } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

const statusStyles: Record<JobStatus, { bg: string; text: string }> = {
  [JobStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [JobStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [JobStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
  [JobStatus.CLOSED]: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminJobs() {
  const { success, error: showError } = useNotification()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<JobStatus | 'all'>(JobStatus.PENDING)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

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
          `/admin/jobs?${params.toString()}`
        )
        // Normalize MongoDB _id to id
        const normalizedJobs = data.jobs.map(j => ({
          ...j,
          id: j.id || j._id || '',
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

  const handleApprove = async (jobId: string) => {
    try {
      await api.patch(`/admin/jobs/${jobId}`, { status: JobStatus.APPROVED })
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: JobStatus.APPROVED, rejectionReason: undefined } : j))
      )
      success('Job approved successfully')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to approve job')
    }
  }

  const handleSetPending = async (jobId: string) => {
    try {
      await api.patch(`/admin/jobs/${jobId}`, { status: JobStatus.PENDING })
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: JobStatus.PENDING } : j))
      )
      success('Job set to pending')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update job')
    }
  }

  const handleReject = async () => {
    if (!selectedJob) return
    try {
      await api.patch(`/admin/jobs/${selectedJob.id}`, {
        status: JobStatus.REJECTED,
        rejectionReason: rejectReason || undefined,
      })
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id
            ? { ...j, status: JobStatus.REJECTED, rejectionReason: rejectReason || undefined }
            : j
        )
      )
      success('Job rejected')
      setShowRejectModal(false)
      setSelectedJob(null)
      setRejectReason('')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reject job')
    }
  }

  const openRejectModal = (job: JobPosting) => {
    setSelectedJob(job)
    setShowRejectModal(true)
  }

  const openDetailModal = (job: JobPosting) => {
    setSelectedJob(job)
    setShowDetailModal(true)
  }

  return (
    <PageContainer title="Manage Job Postings">
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {([JobStatus.PENDING, JobStatus.APPROVED, JobStatus.REJECTED, JobStatus.CLOSED, 'all'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
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
            className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No jobs found.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <button
                      onClick={() => openDetailModal(job)}
                      className="font-semibold text-gray-900 hover:text-blue-600 text-left"
                    >
                      {job.title}
                    </button>
                    <p className="text-sm text-blue-600">
                      {job.company?.name ?? 'Unknown Company'}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span>{job.jobType}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </p>
                    {job.status === JobStatus.REJECTED && job.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        Rejection reason: {job.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusStyles[job.status].bg
                      } ${statusStyles[job.status].text}`}
                    >
                      {job.status}
                    </span>
                    {job.status === JobStatus.PENDING && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(job.id)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openRejectModal(job)}>
                          Reject
                        </Button>
                      </>
                    )}
                    {job.status === JobStatus.APPROVED && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => openRejectModal(job)}>
                          Reject
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSetPending(job.id)}>
                          Set Pending
                        </Button>
                      </>
                    )}
                    {job.status === JobStatus.REJECTED && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(job.id)}>
                          Re-approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSetPending(job.id)}>
                          Set Pending
                        </Button>
                      </>
                    )}
                    {job.status === JobStatus.CLOSED && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(job.id)}>
                          Re-approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSetPending(job.id)}>
                          Set Pending
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openDetailModal(job)}>
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
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

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setSelectedJob(null)
          setRejectReason('')
        }}
        title="Reject Job Posting"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Optionally provide a reason for rejecting{' '}
            <span className="font-medium">"{selectedJob?.title}"</span>.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter rejection reason (optional)..."
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false)
                setSelectedJob(null)
                setRejectReason('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleReject}>
              Reject Job
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedJob(null)
        }}
        title={selectedJob?.title ?? 'Job Details'}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium">{selectedJob.company?.name ?? 'Unknown'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{selectedJob.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p>{selectedJob.jobType}</p>
              </div>
            </div>
            {selectedJob.salaryRange && (
              <div>
                <p className="text-sm text-gray-500">Salary Range</p>
                <p>{selectedJob.salaryRange}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="whitespace-pre-wrap">{selectedJob.description}</p>
            </div>
            {selectedJob.requirements && (
              <div>
                <p className="text-sm text-gray-500">Requirements</p>
                <p className="whitespace-pre-wrap">{selectedJob.requirements}</p>
              </div>
            )}
            {selectedJob.status === JobStatus.REJECTED && selectedJob.rejectionReason && (
              <div>
                <p className="text-sm text-gray-500">Rejection Reason</p>
                <p className="text-red-600">{selectedJob.rejectionReason}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t flex-wrap">
              {selectedJob.status === JobStatus.PENDING && (
                <>
                  <Button onClick={() => { handleApprove(selectedJob.id); setShowDetailModal(false); }}>
                    Approve
                  </Button>
                  <Button variant="outline" onClick={() => { setShowDetailModal(false); openRejectModal(selectedJob); }}>
                    Reject
                  </Button>
                </>
              )}
              {selectedJob.status === JobStatus.APPROVED && (
                <>
                  <Button variant="outline" onClick={() => { setShowDetailModal(false); openRejectModal(selectedJob); }}>
                    Reject
                  </Button>
                  <Button variant="ghost" onClick={() => { handleSetPending(selectedJob.id); setShowDetailModal(false); }}>
                    Set Pending
                  </Button>
                </>
              )}
              {selectedJob.status === JobStatus.REJECTED && (
                <>
                  <Button onClick={() => { handleApprove(selectedJob.id); setShowDetailModal(false); }}>
                    Re-approve
                  </Button>
                  <Button variant="ghost" onClick={() => { handleSetPending(selectedJob.id); setShowDetailModal(false); }}>
                    Set Pending
                  </Button>
                </>
              )}
              {selectedJob.status === JobStatus.CLOSED && (
                <>
                  <Button onClick={() => { handleApprove(selectedJob.id); setShowDetailModal(false); }}>
                    Re-approve
                  </Button>
                  <Button variant="ghost" onClick={() => { handleSetPending(selectedJob.id); setShowDetailModal(false); }}>
                    Set Pending
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
