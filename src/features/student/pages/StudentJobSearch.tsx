import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import Alert from '@/components/common/Alert'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import CompanyAvatar from '@/components/common/CompanyAvatar'
import { JobPosting } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import { Search, MapPin, Briefcase, DollarSign, Calendar, ArrowRight, Lock } from 'lucide-react'

export default function StudentJobSearch() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [quota, setQuota] = useState<{ applicationsUsed: number; applicationLimit: number | null } | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (locationFilter) params.append('location', locationFilter)

        const data = await api.get<{ jobs: JobPosting[] }>(
          `/student/jobs?${params.toString()}`
        )
        setJobs(data.jobs)
      } catch {
        // Jobs will remain empty
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchJobs, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, locationFilter])

  useEffect(() => {
    api
      .get<{ applicationsUsed: number; applicationLimit: number | null }>('/student/subscription')
      .then((data) =>
        setQuota({ applicationsUsed: data.applicationsUsed, applicationLimit: data.applicationLimit })
      )
      .catch(() => {})
  }, [])

  const isQuotaReached =
    typeof quota?.applicationLimit === 'number' && quota.applicationsUsed >= quota.applicationLimit

  return (
    <PageContainer title="Browse Jobs" description="Find your perfect job opportunity">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Search by title or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Input
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
        />
      </div>

      {isQuotaReached && (
        <Alert variant="warning" className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium">Application quota reached</p>
              <p className="text-sm mt-0.5">
                You have used all {quota?.applicationsUsed} of {quota?.applicationLimit} allowed
                applications. Upgrade your plan to continue applying.
              </p>
            </div>
            <Link
              to="/subscription"
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Upgrade Plan
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
            <p className="text-gray-500">
              {searchTerm || locationFilter
                ? 'Try adjusting your search criteria.'
                : 'No jobs available at the moment. Check back later!'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="relative">
              <Card hover={!isQuotaReached} className="group overflow-hidden">
                <div
                  className={
                    isQuotaReached
                      ? 'flex items-start justify-between gap-4 blur-sm opacity-60 select-none pointer-events-none'
                      : 'flex items-start justify-between gap-4'
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <CompanyAvatar
                        name={job.company?.name ?? 'Company'}
                        logoUrl={job.company?.logo}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="text-sm text-blue-600 font-medium">
                            {job.company?.name ?? 'Unknown Company'}
                          </p>
                          {job.company?.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {job.company.industry}
                            </Badge>
                          )}
                        </div>

                        {job.company?.description && (
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {job.company.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Briefcase className="w-4 h-4" />
                            {job.jobType}
                          </div>
                          {job.salaryRange && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <DollarSign className="w-4 h-4" />
                              {job.salaryRange}
                            </div>
                          )}
                        </div>

                        <p className="mt-3 text-sm line-clamp-2 text-gray-600">
                          {job.description}
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                          </div>
                          {job.deadline && (
                            <Badge variant="warning">
                              Deadline: {format(new Date(job.deadline), 'MMM d')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                    <Link to={`/jobs/${job.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {isQuotaReached && (
                <div className="absolute inset-0 rounded-lg flex items-center justify-center z-10 bg-white/20 backdrop-blur-sm">
                  <div className="rounded-xl border border-amber-200 bg-white/95 px-5 py-4 text-center shadow-sm">
                    <div className="mb-2 flex items-center justify-center gap-2 text-amber-800">
                      <Lock className="h-4 w-4 flex-shrink-0" />
                      <p className="text-sm font-semibold">Application quota exhausted.</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Upgrade your plan to continue applying.
                    </p>
                    <Link
                      to="/subscription"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      Upgrade Plan
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
