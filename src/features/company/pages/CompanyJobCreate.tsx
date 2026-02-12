import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageContainer } from '@/components/layout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { useNotification } from '@/contexts/NotificationContext'
import { jobCreateSchema, JobCreateFormData } from '@/types/schemas/job'
import { api } from '@/services/api/client'

export default function CompanyJobCreate() {
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateSchema),
  })

  const onSubmit = async (data: JobCreateFormData) => {
    setIsLoading(true)
    try {
      await api.post('/company/jobs', data)
      success('Job posted successfully! It will be visible after admin approval.')
      navigate('/company/jobs')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer title="Post New Job">
      <Card className="max-w-2xl">
        <Alert variant="info" className="mb-6">
          Job postings require admin approval before they become visible to students.
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Job Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="e.g., Software Engineering Intern"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className={`block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : ''
              }`}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              {...register('location')}
              error={errors.location?.message}
              placeholder="e.g., Remote, New York, etc."
            />
            <Input
              label="Job Type"
              {...register('jobType')}
              error={errors.jobType?.message}
              placeholder="e.g., Full-time, Part-time, Internship"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Salary Range (Optional)"
              {...register('salaryRange')}
              error={errors.salaryRange?.message}
              placeholder="e.g., $50,000 - $70,000"
            />
            <Input
              label="Application Deadline (Optional)"
              type="date"
              {...register('deadline')}
              error={errors.deadline?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <textarea
              {...register('requirements')}
              rows={4}
              className={`block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                errors.requirements ? 'border-red-500' : ''
              }`}
              placeholder="List the required skills, qualifications, and experience..."
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" isLoading={isLoading}>
              Post Job
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/company/jobs')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  )
}
