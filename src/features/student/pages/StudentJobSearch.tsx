import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { JobPosting } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import { Search, MapPin, Briefcase, DollarSign, Calendar, Building2, ArrowRight } from 'lucide-react'

export default function StudentJobSearch() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

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
            <Card key={job.id} hover className="group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/student/jobs/${job.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <p className="text-sm text-blue-600 font-medium mt-0.5">
                        {job.company?.name ?? 'Unknown Company'}
                      </p>

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

                      <p className="mt-3 text-gray-600 text-sm line-clamp-2">{job.description}</p>

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
                <Link to={`/student/jobs/${job.id}`} className="flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                  >
                    View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
