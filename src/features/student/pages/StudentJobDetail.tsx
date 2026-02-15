import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardTitle, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Alert from '@/components/common/Alert'
import { useNotification } from '@/contexts/NotificationContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { JobPosting, ApplicationStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'

const MAX_APPLICATIONS = 2

interface JobDetailResponse extends JobPosting {
  hasApplied: boolean
  applicationStatus?: ApplicationStatus
}

interface StudentStats {
  applicationsUsed: number
  isHired: boolean
}

export default function StudentJobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const { user } = useAuthContext()
  const [job, setJob] = useState<JobDetailResponse | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [jobData, statsData] = await Promise.all([
          api.get<any>(`/student/jobs/${jobId}`),
          api.get<StudentStats>('/student/dashboard'),
        ])
        // Normalize response - applicationStatus may be in different locations
        const normalizedJob: JobDetailResponse = {
          ...jobData,
          id: jobData.id || jobData._id || jobId,
          applicationStatus: jobData.applicationStatus || jobData.application?.status,
        }
        setJob(normalizedJob)
        setStats(statsData)
      } catch {
        showError('Failed to load job details')
        navigate('/jobs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [jobId, navigate, showError])

  const handleApply = async () => {
    if (!job || !user?.student?.profileLink) {
      showError('Please update your profile with a link before applying')
      navigate('/profile')
      return
    }

    setIsApplying(true)
    try {
      await api.post(`/student/jobs/${jobId}/apply`)
      setJob({ ...job, hasApplied: true, applicationStatus: ApplicationStatus.PENDING })
      if (stats) {
        setStats({ ...stats, applicationsUsed: stats.applicationsUsed + 1 })
      }
      success('Application submitted successfully!')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setIsApplying(false)
    }
  }

  // Allow applying if: never applied, OR previously withdrew
  // Cast to string to handle API response correctly
  const isWithdrawnStatus = (job?.applicationStatus as string) === 'withdrawn'
  const hasWithdrawn = job?.hasApplied && isWithdrawnStatus
  const canApply =
    (!job?.hasApplied || hasWithdrawn) &&
    !stats?.isHired &&
    (stats?.applicationsUsed ?? 0) < MAX_APPLICATIONS

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
      {stats?.isHired && (
        <Alert variant="info" className="mb-6">
          You have been hired! You can no longer apply to new jobs.
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="mb-4">
              <p className="text-lg text-blue-600 font-medium">
                {job.company?.name ?? 'Unknown Company'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>{job.location}</span>
                <span>{job.jobType}</span>
                {job.salaryRange && <span>{job.salaryRange}</span>}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.requirements && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Requirements</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{job.requirements}</p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Posted {format(new Date(job.createdAt), 'MMMM d, yyyy')}
                {job.deadline && (
                  <span className="ml-4">
                    Deadline: {format(new Date(job.deadline), 'MMMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardTitle>Apply</CardTitle>
            <CardContent>
              {job.hasApplied && !isWithdrawnStatus ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    You have already applied to this job.
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      job.applicationStatus === ApplicationStatus.HIRED
                        ? 'bg-green-100 text-green-800'
                        : job.applicationStatus === ApplicationStatus.REJECTED
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {job.applicationStatus}
                  </span>
                </div>
              ) : (
                <>
                  {hasWithdrawn && (
                    <Alert variant="info" className="mb-4">
                      Your previous application was withdrawn. You can reapply if you'd like.
                    </Alert>
                  )}
                  <p className="text-sm text-gray-600 mb-4">
                    Applications used: {stats?.applicationsUsed ?? 0} / {MAX_APPLICATIONS}
                  </p>
                  {!user?.student?.profileLink && (
                    <Alert variant="warning" className="mb-4">
                      Add a profile link before applying.
                    </Alert>
                  )}
                  <Button
                    onClick={handleApply}
                    disabled={!canApply}
                    isLoading={isApplying}
                    className="w-full"
                  >
                    {stats?.isHired
                      ? 'Already Hired'
                      : (stats?.applicationsUsed ?? 0) >= MAX_APPLICATIONS
                      ? 'Limit Reached'
                      : hasWithdrawn
                      ? 'Reapply Now'
                      : 'Apply Now'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    One-click apply with your profile link
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
