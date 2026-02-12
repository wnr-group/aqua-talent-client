import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Alert from '@/components/common/Alert'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { api } from '@/services/api/client'
import { FileText, Clock, Trophy, Search, User, ArrowRight } from 'lucide-react'

const MAX_APPLICATIONS = 2

interface DashboardStats {
  applicationsUsed: number
  pendingApplications: number
  isHired: boolean
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<DashboardStats>('/student/dashboard')
        setStats(data)
      } catch {
        // Stats will remain null
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const applicationsRemaining = MAX_APPLICATIONS - (stats?.applicationsUsed ?? 0)

  return (
    <PageContainer title="Dashboard" description="Welcome back! Here's your job search overview.">
      {stats?.isHired && (
        <Alert variant="success" className="mb-6" title="Congratulations!">
          You have been hired. Your job search journey is complete.
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
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.applicationsUsed ?? 0}
                      <span className="text-base font-normal text-gray-400"> / {MAX_APPLICATIONS}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {applicationsRemaining > 0
                      ? `${applicationsRemaining} application${applicationsRemaining > 1 ? 's' : ''} remaining`
                      : 'Application limit reached'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.pendingApplications ?? 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Awaiting employer response</p>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    stats?.isHired ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Trophy className={`w-6 h-6 ${stats?.isHired ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        stats?.isHired
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {stats?.isHired ? 'Hired' : 'Searching'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {stats?.isHired ? 'Journey complete' : 'Keep applying to find your match'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {!stats?.isHired && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/student/jobs" className="group">
                <Card hover className="h-full">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Browse Jobs</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/student/applications" className="group">
                <Card hover className="h-full">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">View Applications</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/student/profile" className="group">
                <Card hover className="h-full">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Update Profile</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}

          {applicationsRemaining === 0 && !stats?.isHired && (
            <Alert variant="warning" className="mt-6">
              You have reached your application limit. Withdraw an existing application to apply to new jobs.
            </Alert>
          )}
        </>
      )}
    </PageContainer>
  )
}
