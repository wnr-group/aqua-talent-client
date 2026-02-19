export enum UserType {
  COMPANY = 'company',
  STUDENT = 'student',
  ADMIN = 'admin',
}

export enum CompanyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum JobStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNPUBLISHED = 'unpublished',
  CLOSED = 'closed',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

// Predefined job types for dropdown selection
export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
] as const

export type JobType = (typeof JOB_TYPES)[number]
