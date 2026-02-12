import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useNotification } from '@/contexts/NotificationContext'
import { Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import {
  User,
  Briefcase,
  Calendar,
  ExternalLink,
  UserCheck,
  FileText,
} from 'lucide-react'

const statusConfig: Record<ApplicationStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive'; label: string }> = {
  [ApplicationStatus.PENDING]: { variant: 'warning', label: 'Pending' },
  [ApplicationStatus.REVIEWED]: { variant: 'primary', label: 'New Applicant' },
  [ApplicationStatus.HIRED]: { variant: 'success', label: 'Hired' },
  [ApplicationStatus.REJECTED]: { variant: 'destructive', label: 'Rejected' },
  [ApplicationStatus.WITHDRAWN]: { variant: 'default', label: 'Withdrawn' },
}

type FilterStatus = 'all' | ApplicationStatus.REVIEWED | ApplicationStatus.HIRED

export default function CompanyApplications() {
  const { success, error: showError } = useNotification()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await api.get<{ applications: Application[] }>('/company/applications')
        setApplications(data.applications)
      } catch {
        // Applications will remain empty
      } finally {
        setIsLoading(false)
      }
    }
    fetchApplications()
  }, [])

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

  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter((app) => app.status === filter)

  const newApplicantsCount = applications.filter((a) => a.status === ApplicationStatus.REVIEWED).length

  return (
    <PageContainer
      title="Applications"
      description={`Review applicants for your job postings${newApplicantsCount > 0 ? ` • ${newApplicantsCount} new` : ''}`}
    >
      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', ApplicationStatus.REVIEWED, ApplicationStatus.HIRED] as const).map((status) => (
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
            <p className="text-gray-500">
              {filter !== 'all'
                ? `No ${statusConfig[filter].label.toLowerCase()} applications.`
                : 'No applications have been approved by admin yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
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
                              to={`/company/jobs/${app.jobPostingId}`}
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
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleHire(app.id)}
                        disabled={processingId === app.id}
                        isLoading={processingId === app.id}
                        leftIcon={<UserCheck className="w-4 h-4" />}
                      >
                        Mark as Hired
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
