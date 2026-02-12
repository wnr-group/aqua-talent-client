import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardContent, CardTitle } from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { AdminStats } from '@/types'
import { api } from '@/services/api/client'
import {
  Building2,
  Briefcase,
  GraduationCap,
  CheckCircle,
  FileText,
  Trophy,
  ArrowRight,
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<AdminStats>('/admin/dashboard')
        setStats(data)
      } catch {
        // Stats will remain null
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <PageContainer title="Dashboard" description="Overview of platform activity and pending approvals">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Pending Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/admin/companies" className="group">
              <Card hover className="h-full border-l-4 border-l-yellow-500">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending Companies</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.pendingCompanies ?? 0}</p>
                        <p className="text-sm text-gray-500">Awaiting approval</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/jobs" className="group">
              <Card hover className="h-full border-l-4 border-l-yellow-500">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending Jobs</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.pendingJobs ?? 0}</p>
                        <p className="text-sm text-gray-500">Awaiting review</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Companies</p>
                    <p className="text-xl font-bold text-gray-900">{stats?.totalCompanies ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Students</p>
                    <p className="text-xl font-bold text-gray-900">{stats?.totalStudents ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                    <p className="text-xl font-bold text-gray-900">{stats?.activeJobs ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Successful Hires</p>
                    <p className="text-xl font-bold text-gray-900">{stats?.totalHires ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Statistics */}
          <Card>
            <CardTitle>Platform Statistics</CardTitle>
            <CardContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Jobs</p>
                    <p className="text-lg font-semibold text-gray-900">{stats?.totalJobs ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Active Jobs</p>
                    <p className="text-lg font-semibold text-gray-900">{stats?.activeJobs ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Applications</p>
                    <p className="text-lg font-semibold text-gray-900">{stats?.totalApplications ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Hire Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.totalApplications
                        ? Math.round(((stats?.totalHires ?? 0) / stats.totalApplications) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  )
}
