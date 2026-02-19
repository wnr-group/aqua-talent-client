import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/services/api/client'
import { useAuthContext } from '@/contexts/AuthContext'
import { JobPosting, UserType, JOB_TYPES } from '@/types'
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StudentNavbar from '@/components/layout/StudentNavbar'
import Logo from '@/components/common/Logo'
import CompanyAvatar from '@/components/common/CompanyAvatar'
import Badge from '@/components/common/Badge'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PublicJobsResponse {
  jobs: JobPosting[]
  pagination: Pagination
}

export default function PublicJobsPage() {
  const { user, isAuthenticated } = useAuthContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Only students are authenticated on the main domain
  const isStudent = isAuthenticated && user?.userType === UserType.STUDENT

  const search = searchParams.get('search') || ''
  const location = searchParams.get('location') || ''
  const jobType = searchParams.get('jobType') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const [searchInput, setSearchInput] = useState(search)
  const [locationInput, setLocationInput] = useState(location)
  const [jobTypeInput, setJobTypeInput] = useState(jobType)

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (location) params.append('location', location)
        if (jobType) params.append('jobType', jobType)
        params.append('page', page.toString())
        params.append('limit', '12')

        const data = await api.get<PublicJobsResponse>(`/student/jobs?${params.toString()}`)
        setJobs(data.jobs || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
      } catch {
        setJobs([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchJobs()
  }, [search, location, jobType, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput) params.set('search', searchInput)
    if (locationInput) params.set('location', locationInput)
    if (jobTypeInput) params.set('jobType', jobTypeInput)
    params.set('page', '1')
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchInput('')
    setLocationInput('')
    setJobTypeInput('')
    setSearchParams({ page: '1' })
  }

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Use StudentNavbar for logged-in students */}
      {isStudent ? (
        <StudentNavbar />
      ) : (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-teal-600 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/">
                <Logo size="md" />
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  to="/jobs"
                  className="text-white font-medium"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/student"
                  className="px-5 py-2.5 rounded-xl bg-white text-teal-600 font-semibold hover:bg-gray-100 transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-3 text-gray-900">
              Find Your <span className="text-teal-600">Perfect Role</span>
            </h1>
            <p className="text-gray-500 text-lg">
              {total} opportunities waiting for you
            </p>
          </div>

          {/* Search & Filters */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Job title, keyword, or company..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Location..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                  <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <select
                    value={jobTypeInput}
                    onChange={(e) => setJobTypeInput(e.target.value)}
                    className="bg-transparent border-none outline-none text-gray-900 cursor-pointer"
                  >
                    <option value="" className="bg-white text-gray-900">All Types</option>
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-white text-gray-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all shadow-sm"
                >
                  Search Jobs
                </button>
              </div>

              {/* Active filters */}
              {(search || location || jobType) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {search && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm border border-teal-200">
                      {search}
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('')
                          const params = new URLSearchParams(searchParams)
                          params.delete('search')
                          params.set('page', '1')
                          setSearchParams(params)
                        }}
                        className="hover:text-teal-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-600 text-sm border border-teal-200">
                      {location}
                      <button
                        type="button"
                        onClick={() => {
                          setLocationInput('')
                          const params = new URLSearchParams(searchParams)
                          params.delete('location')
                          params.set('page', '1')
                          setSearchParams(params)
                        }}
                        className="hover:text-teal-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  {jobType && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm border border-purple-200">
                      {jobType}
                      <button
                        type="button"
                        onClick={() => {
                          setJobTypeInput('')
                          const params = new URLSearchParams(searchParams)
                          params.delete('jobType')
                          params.set('page', '1')
                          setSearchParams(params)
                        }}
                        className="hover:text-purple-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Job Listings */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {jobs.map((job, index) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group animate-fade-in-up`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar
                          name={job.company?.name || 'Company'}
                          logoUrl={job.company?.logo}
                          size="md"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {job.company?.name || 'Company'}
                          </p>
                          {job.company?.industry && (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-[11px]"
                            >
                              {job.company.industry}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                        {job.jobType}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>

                    {job.company?.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {job.company.description}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {job.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      {job.salaryRange && (
                        <div className="text-teal-600 font-medium">
                          {job.salaryRange}
                        </div>
                      )}
                    </div>

                    {job.deadline && (
                      <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        Apply by {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-xl bg-white shadow-sm border border-gray-200 hover:border-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center gap-2">
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span className="text-gray-400 px-2">...</span>
                        )}
                        <button
                          onClick={() => goToPage(p)}
                          className={`w-10 h-10 rounded-xl font-medium transition-all ${
                            p === page
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-white shadow-sm border border-gray-200 hover:border-teal-300 text-gray-900'
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl bg-white shadow-sm border border-gray-200 hover:border-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
              <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-display font-semibold text-gray-900 mb-3">No jobs found</h3>
              <p className="text-gray-500 mb-6">
                {search || location
                  ? 'Try adjusting your search filters'
                  : 'Check back soon for new opportunities'}
              </p>
              {(search || location) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Banner */}
      {!isAuthenticated && (
        <div className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                  Ready to apply?
                </h3>
                <p className="text-gray-500">
                  Create your student account to start applying for jobs
                </p>
              </div>
              <Link
                to="/register/student"
                className="px-8 py-4 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all whitespace-nowrap shadow-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
