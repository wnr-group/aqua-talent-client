import { z } from 'zod'

export const jobCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  requirements: z.string().max(2000).optional(),
  location: z.string().min(2, 'Location is required').max(100),
  jobType: z.string().min(2, 'Job type is required').max(50),
  salaryRange: z.string().max(50).optional(),
  deadline: z.string().optional(),
})

export type JobCreateFormData = z.infer<typeof jobCreateSchema>

export const jobUpdateSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(50).max(5000).optional(),
  requirements: z.string().max(2000).optional(),
  location: z.string().min(2).max(100).optional(),
  jobType: z.string().min(2).max(50).optional(),
  salaryRange: z.string().max(50).optional(),
  deadline: z.string().optional(),
})

export type JobUpdateFormData = z.infer<typeof jobUpdateSchema>

export const rejectReasonSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
})

export type RejectReasonFormData = z.infer<typeof rejectReasonSchema>
