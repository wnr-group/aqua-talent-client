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
import { JOB_TYPES } from '@/types'
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
      // Convert date to ISO datetime format for backend
      const payload = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline + 'T23:59:59').toISOString() : undefined,
      }
      await api.post('/company/jobs', payload)
      success('Job posted successfully! It will be visible after admin approval.')
      navigate('/jobs')
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
              className={`block w-full px-4 py-3 rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white ${
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                {...register('jobType')}
                className={`block w-full px-4 py-2.5 rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white ${
                  errors.jobType ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select job type</option>
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.jobType && (
                <p className="mt-1 text-sm text-red-600">{errors.jobType.message}</p>
              )}
            </div>
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
              className={`block w-full px-4 py-3 rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white ${
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
              onClick={() => navigate('/jobs')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  )
}
