import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardTitle, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Alert from '@/components/common/Alert'
import { useNotification } from '@/contexts/NotificationContext'
import { JobPosting, JobStatus, Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'

const statusStyles: Record<JobStatus, { bg: string; text: string }> = {
  [JobStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [JobStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [JobStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
  [JobStatus.CLOSED]: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

export default function CompanyJobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const [jobData, appData] = await Promise.all([
          api.get<JobPosting>(`/company/jobs/${jobId}`),
          api.get<{ applications: Application[] }>(`/company/jobs/${jobId}/applications`),
        ])
        setJob(jobData)
        setApplications(appData.applications)
      } catch {
        showError('Failed to load job details')
        navigate('/company/jobs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [jobId, navigate, showError])

  const handleCloseJob = async () => {
    if (!job) return
    try {
      await api.patch(`/company/jobs/${jobId}`, { status: JobStatus.CLOSED })
      setJob({ ...job, status: JobStatus.CLOSED })
      success('Job closed successfully')
    } catch {
      showError('Failed to close job')
    }
  }

  const handleHireApplicant = async (applicationId: string) => {
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
    }
  }

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusStyles[job.status].bg
                } ${statusStyles[job.status].text}`}
              >
                {job.status}
              </span>
              {job.status === JobStatus.APPROVED && (
                <Button variant="outline" size="sm" onClick={handleCloseJob}>
                  Close Job
                </Button>
              )}
            </div>

            {job.status === JobStatus.REJECTED && job.rejectionReason && (
              <Alert variant="error" className="mb-4">
                Rejection reason: {job.rejectionReason}
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{job.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-gray-900">{job.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Job Type</h3>
                  <p className="mt-1 text-gray-900">{job.jobType}</p>
                </div>
              </div>

              {job.requirements && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Requirements</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{job.requirements}</p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Posted {format(new Date(job.createdAt), 'MMMM d, yyyy')}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardTitle>Applications ({applications.length})</CardTitle>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-gray-500 text-sm">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-gray-50 rounded-md"
                    >
                      <p className="font-medium text-gray-900">
                        {app.student?.fullName ?? 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                      </p>
                      {app.student?.profileLink && (
                        <a
                          href={app.student.profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View Profile
                        </a>
                      )}
                      {app.status === ApplicationStatus.PENDING && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handleHireApplicant(app.id)}
                        >
                          Mark as Hired
                        </Button>
                      )}
                      {app.status === ApplicationStatus.HIRED && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Hired
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
