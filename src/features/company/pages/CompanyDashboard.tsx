import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Alert from '@/components/common/Alert'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { CompanyStatus } from '@/types'
import { api } from '@/services/api/client'
import { Briefcase, FileText, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react'

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  pendingJobs: number
  totalApplications: number
  pendingApplications: number
}

export default function CompanyDashboard() {
  const { user } = useAuthContext()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<DashboardStats>('/company/dashboard')
        setStats(data)
      } catch {
        // Stats will remain null
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const isPending = user?.company?.status === CompanyStatus.PENDING

  return (
    <PageContainer title="Dashboard" description="Manage your job postings and applications">
      {isPending && (
        <Alert variant="warning" className="mb-6" title="Account Pending Approval">
          Your company account is awaiting admin approval. You can create job postings, but they won't be visible to students until approved.
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalJobs ?? 0}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>{stats?.activeJobs ?? 0} active</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-yellow-600">
                    <Clock className="w-4 h-4" />
                    <span>{stats?.pendingJobs ?? 0} pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalApplications ?? 0}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-sm text-yellow-600">
                    <Clock className="w-4 h-4" />
                    <span>{stats?.pendingApplications ?? 0} pending review</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isPending ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {isPending ? (
                      <Clock className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        isPending
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isPending ? 'Pending' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {isPending ? 'Awaiting admin review' : 'All features available'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/company/jobs/new" className="group">
              <Card hover className="h-full">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Post New Job</span>
                        <p className="text-sm text-gray-500">Create a new job listing</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/company/applications" className="group">
              <Card hover className="h-full">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">View Applications</span>
                        <p className="text-sm text-gray-500">Review candidate applications</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </PageContainer>
  )
}
