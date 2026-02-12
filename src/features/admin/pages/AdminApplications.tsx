import { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { Application, ApplicationStatus } from '@/types'
import { api } from '@/services/api/client'
import { useNotification } from '@/contexts/NotificationContext'
import { format } from 'date-fns'
import {
  User,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react'

const statusConfig: Record<ApplicationStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive'; label: string }> = {
  [ApplicationStatus.PENDING]: { variant: 'warning', label: 'Pending Review' },
  [ApplicationStatus.REVIEWED]: { variant: 'primary', label: 'Approved' },
  [ApplicationStatus.HIRED]: { variant: 'success', label: 'Hired' },
  [ApplicationStatus.REJECTED]: { variant: 'destructive', label: 'Rejected' },
  [ApplicationStatus.WITHDRAWN]: { variant: 'default', label: 'Withdrawn' },
}

export default function AdminApplications() {
  const { success, error: showError } = useNotification()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchApplications = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const data = await api.get<{ applications: Application[] }>(
        `/admin/applications${params}`
      )
      setApplications(data.applications)
    } catch {
      // Applications will remain empty
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const handleApprove = async (app: Application) => {
    setIsProcessing(true)
    try {
      await api.patch(`/admin/applications/${app.id}`, {
        status: ApplicationStatus.REVIEWED,
      })
      success('Application approved successfully')
      fetchApplications()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to approve application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectClick = (app: Application) => {
    setSelectedApp(app)
    setRejectionReason('')
    setIsRejectModalOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedApp || !rejectionReason.trim()) return

    setIsProcessing(true)
    try {
      await api.patch(`/admin/applications/${selectedApp.id}`, {
        status: ApplicationStatus.REJECTED,
        rejectionReason: rejectionReason.trim(),
      })
      success('Application rejected')
      setIsRejectModalOpen(false)
      setSelectedApp(null)
      fetchApplications()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reject application')
    } finally {
      setIsProcessing(false)
    }
  }

  const pendingCount = applications.filter((a) => a.status === ApplicationStatus.PENDING).length

  return (
    <PageContainer
      title="Applications"
      description={`Review and moderate student applications${pendingCount > 0 ? ` • ${pendingCount} pending` : ''}`}
    >
      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', ApplicationStatus.PENDING, ApplicationStatus.REVIEWED, ApplicationStatus.REJECTED] as const).map((status) => (
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
            {status === ApplicationStatus.PENDING && pendingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
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
              {filter !== 'all'
                ? `No ${statusConfig[filter].label.toLowerCase()} applications.`
                : 'No applications have been submitted yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} hover={app.status === ApplicationStatus.PENDING}>
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.student?.fullName ?? 'Unknown Student'}
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
                            {app.jobPosting?.title ?? 'Unknown Job'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            {app.jobPosting?.company?.name ?? 'Unknown Company'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>

                        {app.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Rejection reason:</span> {app.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {app.status === ApplicationStatus.PENDING && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectClick(app)}
                        disabled={isProcessing}
                        leftIcon={<XCircle className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(app)}
                        disabled={isProcessing}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Application"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this application. The student will be notified with this reason.
          </p>

          {selectedApp && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {selectedApp.student?.fullName}
              </p>
              <p className="text-sm text-gray-500">
                Applied for: {selectedApp.jobPosting?.title}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              rows={3}
              className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || isProcessing}
              isLoading={isProcessing}
            >
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
