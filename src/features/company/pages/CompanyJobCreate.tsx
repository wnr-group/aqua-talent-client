import { useNavigate } from 'react-router-dom'
import CompanyPageContainer from '@/features/company/components/CompanyPageContainer'
import CompanyJobForm from '@/features/company/components/CompanyJobForm'
import { useNotification } from '@/contexts/NotificationContext'
import { JobCreateFormData } from '@/types/schemas/job'
import { api } from '@/services/api/client'

export default function CompanyJobCreate() {
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()

  const buildPayload = (data: Partial<JobCreateFormData>) => ({
    ...data,
    deadline: data.deadline ? new Date(data.deadline + 'T23:59:59').toISOString() : undefined,
  })

  const handleSaveDraft = async (data: Partial<JobCreateFormData>) => {
    try {
      await api.post('/company/jobs', { ...buildPayload(data), status: 'draft' })
      success('Job saved as draft.')
      navigate('/jobs')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save draft')
    }
  }

  const handleSubmitForReview = async (data: JobCreateFormData) => {
    try {
      await api.post('/company/jobs', { ...buildPayload(data), status: 'pending' })
      success('Job submitted for review! It will be visible after admin approval.')
      navigate('/jobs')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit job')
    }
  }

  return (
    <CompanyPageContainer title="Post New Job">
      <CompanyJobForm
        mode="create"
        onSaveDraft={handleSaveDraft}
        onSubmitForReview={handleSubmitForReview}
        onCancel={() => navigate('/jobs')}
      />
    </CompanyPageContainer>
  )
}
