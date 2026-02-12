import { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { JobPosting, JobStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'

const statusStyles: Record<JobStatus, { bg: string; text: string }> = {
  [JobStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [JobStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [JobStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
  [JobStatus.CLOSED]: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

export default function AdminJobs() {
  const { success, error: showError } = useNotification()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<JobStatus | 'all'>(JobStatus.PENDING)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const params = filter !== 'all' ? `?status=${filter}` : ''
        const data = await api.get<{ jobs: JobPosting[] }>(`/admin/jobs${params}`)
        setJobs(data.jobs)
      } catch {
        // Jobs will remain empty
      } finally {
        setIsLoading(false)
      }
    }
    fetchJobs()
  }, [filter])

  const handleApprove = async (jobId: string) => {
    try {
      await api.patch(`/admin/jobs/${jobId}`, { status: JobStatus.APPROVED })
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: JobStatus.APPROVED } : j))
      )
      success('Job approved successfully')
    } catch {
      showError('Failed to approve job')
    }
  }

  const handleReject = async () => {
    if (!selectedJob) return
    try {
      await api.patch(`/admin/jobs/${selectedJob.id}`, {
        status: JobStatus.REJECTED,
        rejectionReason: rejectReason,
      })
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id
            ? { ...j, status: JobStatus.REJECTED, rejectionReason: rejectReason }
            : j
        )
      )
      success('Job rejected')
      setShowRejectModal(false)
      setSelectedJob(null)
      setRejectReason('')
    } catch {
      showError('Failed to reject job')
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

  const filteredJobs =
    filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  return (
    <PageContainer title="Manage Job Postings">
      <div className="mb-6 flex gap-2 flex-wrap">
        {([JobStatus.PENDING, JobStatus.APPROVED, JobStatus.REJECTED, JobStatus.CLOSED, 'all'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'all'
                ? 'All'
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No jobs found.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id}>
              <div className="flex items-center justify-between">
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
                </div>
                <div className="flex items-center gap-3">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRejectModal(job)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDetailModal(job)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
            Please provide a reason for rejecting{' '}
            <span className="font-medium">"{selectedJob?.title}"</span>.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter rejection reason..."
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
            <Button onClick={handleReject} disabled={!rejectReason.trim()}>
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
            {selectedJob.status === JobStatus.PENDING && (
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => handleApprove(selectedJob.id)}>
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false)
                    openRejectModal(selectedJob)
                  }}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
