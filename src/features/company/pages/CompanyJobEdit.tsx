import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CompanyPageContainer from '@/features/company/components/CompanyPageContainer'
import CompanyJobForm from '@/features/company/components/CompanyJobForm'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useNotification } from '@/contexts/NotificationContext'
import { JobPosting, JobStatus } from '@/types'
import { JobCreateFormData } from '@/types/schemas/job'
import { api } from '@/services/api/client'

export default function CompanyJobEdit() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { success, error: showError, warning } = useNotification()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return
      try {
        const data = await api.get<JobPosting & { _id?: string }>(`/company/jobs/${jobId}`)
        const normalised = { ...data, id: data.id || data._id || jobId }

        if (normalised.status !== JobStatus.DRAFT) {
          warning('Only draft jobs can be edited.')
          navigate(`/jobs/${jobId}`)
          return
        }

        setJob(normalised)
      } catch {
        showError('Failed to load job')
        navigate('/jobs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [jobId, navigate, showError, warning])

  const buildPayload = (data: Partial<JobCreateFormData>) => ({
    ...data,
    deadline: data.deadline ? new Date(data.deadline + 'T23:59:59').toISOString() : undefined,
  })

  const handleSaveDraft = async (data: Partial<JobCreateFormData>) => {
    try {
      await api.patch(`/company/jobs/${jobId}`, { ...buildPayload(data), status: 'draft' })
      success('Draft saved.')
      navigate('/jobs')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save draft')
    }
  }

  const handleSubmitForReview = async (data: JobCreateFormData) => {
    try {
      await api.patch(`/company/jobs/${jobId}`, { ...buildPayload(data), status: 'pending' })
      success('Job submitted for review!')
      navigate('/jobs')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit job')
    }
  }

  if (isLoading) {
    return (
      <CompanyPageContainer title="Edit Draft">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </CompanyPageContainer>
    )
  }

  if (!job) return null

  // Convert ISO deadline back to YYYY-MM-DD for the date input
  const deadlineDate = job.deadline ? job.deadline.split('T')[0] : ''

  return (
    <CompanyPageContainer title="Edit Draft">
      <CompanyJobForm
        mode="edit"
        initialValues={{
          title: job.title,
          description: job.description,
          requirements: job.requirements ?? '',
          location: job.location,
          jobType: job.jobType,
          salaryRange: job.salaryRange ?? '',
          deadline: deadlineDate,
        }}
        onSaveDraft={handleSaveDraft}
        onSubmitForReview={handleSubmitForReview}
        onCancel={() => navigate('/jobs')}
      />
    </CompanyPageContainer>
  )
}
