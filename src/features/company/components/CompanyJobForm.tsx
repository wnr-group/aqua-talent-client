import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  COMPANY_INPUT_STYLES,
  COMPANY_SELECT_STYLES,
  COMPANY_TEXTAREA_STYLES,
} from '@/features/company/components/companyFormStyles'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { jobCreateSchema, JobCreateFormData } from '@/types/schemas/job'
import { JOB_TYPES } from '@/types'
import { Save, Send } from 'lucide-react'

const CARD_BASE_CLASSES = 'bg-white border border-gray-200 rounded-xl shadow-sm'

export interface CompanyJobFormProps {
  mode: 'create' | 'edit'
  /** Pre-filled values when editing a draft */
  initialValues?: Partial<JobCreateFormData>
  /** Called when user clicks "Save as Draft" */
  onSaveDraft: (data: Partial<JobCreateFormData>) => Promise<void>
  /** Called when user clicks "Submit for Review" */
  onSubmitForReview: (data: JobCreateFormData) => Promise<void>
  /** Called when user clicks "Cancel" */
  onCancel: () => void
}

export default function CompanyJobForm({
  mode,
  initialValues,
  onSaveDraft,
  onSubmitForReview,
  onCancel,
}: CompanyJobFormProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      requirements: initialValues?.requirements ?? '',
      location: initialValues?.location ?? '',
      jobType: initialValues?.jobType ?? '',
      salaryRange: initialValues?.salaryRange ?? '',
      deadline: initialValues?.deadline ?? '',
    },
  })

  const handleSaveDraft = async () => {
    // Drafts bypass full validation — grab raw form values, clear any visible errors
    clearErrors()
    const data = getValues()
    setIsSavingDraft(true)
    try {
      await onSaveDraft(data)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleFormSubmit = async (data: JobCreateFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmitForReview(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const busy = isSavingDraft || isSubmitting

  return (
    <Card className={`max-w-2xl ${CARD_BASE_CLASSES}`}>
      <Alert variant="info" className="mb-6">
        {mode === 'edit'
          ? 'You are editing a draft. Submit for review when ready, or save your changes.'
          : 'Save as draft to finish later, or submit for admin review.'}
      </Alert>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Input
          label="Job Title"
          {...register('title')}
          error={errors.title?.message}
          placeholder="e.g., Software Engineering Intern"
          className={COMPANY_INPUT_STYLES}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            {...register('description')}
            rows={6}
            className={`${COMPANY_TEXTAREA_STYLES} ${
              errors.description
                ? 'border-destructive/70 focus:ring-destructive/40 focus:border-destructive'
                : ''
            }`}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Location"
            {...register('location')}
            error={errors.location?.message}
            placeholder="e.g., Remote, New York, etc."
            className={COMPANY_INPUT_STYLES}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              {...register('jobType')}
              className={`${COMPANY_SELECT_STYLES} ${
                errors.jobType
                  ? 'border-destructive/70 focus:ring-destructive/40 focus:border-destructive'
                  : ''
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
            label="Salary Range"
            {...register('salaryRange')}
            error={errors.salaryRange?.message}
            placeholder="e.g., $50,000 - $70,000"
            className={COMPANY_INPUT_STYLES}
          />
          <Input
            label="Application Deadline"
            type="date"
            {...register('deadline')}
            error={errors.deadline?.message}
            className={COMPANY_INPUT_STYLES}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('requirements')}
            rows={4}
            className={`${COMPANY_TEXTAREA_STYLES} ${
              errors.requirements
                ? 'border-destructive/70 focus:ring-destructive/40 focus:border-destructive'
                : ''
            }`}
            placeholder="List the required skills, qualifications, and experience..."
          />
          {errors.requirements && (
            <p className="mt-1 text-sm text-destructive">{errors.requirements.message}</p>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={busy}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Submit for Review
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            isLoading={isSavingDraft}
            disabled={busy}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
