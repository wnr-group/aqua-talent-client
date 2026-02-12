import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useNotification } from '@/contexts/NotificationContext'
import { Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'

const statusStyles: Record<ApplicationStatus, { bg: string; text: string }> = {
  [ApplicationStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [ApplicationStatus.REVIEWED]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [ApplicationStatus.HIRED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [ApplicationStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
  [ApplicationStatus.WITHDRAWN]: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

export default function StudentApplications() {
  const { success, error: showError } = useNotification()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await api.get<{ applications: Application[] }>('/student/applications')
        setApplications(data.applications)
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
            ? { ...app, status: ApplicationStatus.WITHDRAWN }
            : app
        )
      )
      success('Application withdrawn. You can now apply to another job.')
    } catch {
      showError('Failed to withdraw application')
    }
  }

  const activeApplications = applications.filter(
    (app) =>
      app.status !== ApplicationStatus.WITHDRAWN &&
      app.status !== ApplicationStatus.REJECTED
  )

  return (
    <PageContainer title="My Applications">
      <div className="mb-6">
        <p className="text-gray-600">
          Active applications: {activeApplications.length} / 2
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
            <Link to="/student/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    to={`/student/jobs/${app.jobPostingId}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {app.jobPosting?.title ?? 'Unknown Job'}
                  </Link>
                  <p className="text-sm text-blue-600">
                    {app.jobPosting?.company?.name ?? 'Unknown Company'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusStyles[app.status].bg
                    } ${statusStyles[app.status].text}`}
                  >
                    {app.status}
                  </span>
                  {app.status === ApplicationStatus.PENDING && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWithdraw(app.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
              {app.status === ApplicationStatus.HIRED && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-green-800 text-sm font-medium">
                    Congratulations! You've been hired for this position.
                  </p>
                </div>
              )}
              {app.status === ApplicationStatus.REJECTED && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-600 text-sm">
                    This application was not successful. Keep searching!
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
