import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { JobPosting, JobStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'

const statusStyles: Record<JobStatus, { bg: string; text: string }> = {
  [JobStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [JobStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [JobStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
  [JobStatus.CLOSED]: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

export default function CompanyJobList() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.get<{ jobs: JobPosting[] }>('/company/jobs')
        setJobs(data.jobs)
      } catch {
        // Jobs will remain empty
      } finally {
        setIsLoading(false)
      }
    }
    fetchJobs()
  }, [])

  return (
    <PageContainer title="Job Postings">
      <div className="mb-6">
        <Link to="/company/jobs/new">
          <Button>Create New Job</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
            <Link to="/company/jobs/new">
              <Button>Post Your First Job</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    to={`/company/jobs/${job.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {job.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusStyles[job.status].bg
                    } ${statusStyles[job.status].text}`}
                  >
                    {job.status}
                  </span>
                  <Link to={`/company/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
