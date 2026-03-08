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
  APPLIED = 'pending',
  REVIEWED = 'reviewed',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER_EXTENDED = 'offer_extended',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  WITHDRAWAL_REQUESTED = 'withdrawal_requested',
}

// Predefined job types for dropdown selection
export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Project',
] as const

export type JobType = (typeof JOB_TYPES)[number]
