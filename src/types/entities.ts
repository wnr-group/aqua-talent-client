import { CompanyStatus, JobStatus, ApplicationStatus } from './enums'

export interface Company {
  id: string
  username: string
  name: string
  email: string
  status: CompanyStatus
  createdAt: string
  approvedAt?: string | null
  rejectionReason?: string | null
}

export interface Student {
  id: string
  username: string
  fullName: string
  email: string
  profileLink?: string | null
  isHired: boolean
  createdAt: string
}

export interface Admin {
  id: string
  username: string
  name: string
  email: string
  createdAt: string
}

export interface JobPosting {
  id: string
  companyId: string
  title: string
  description: string
  requirements?: string | null
  location: string
  jobType: string
  salaryRange?: string | null
  deadline?: string | null
  status: JobStatus
  rejectionReason?: string | null
  createdAt: string
  approvedAt?: string | null
  company?: {
    id: string
    name: string
  } | null
}

export interface Application {
  id: string
  studentId: string
  jobPostingId: string
  status: ApplicationStatus
  createdAt: string
  reviewedAt?: string | null
  rejectionReason?: string | null
  student?: Student | null
  jobPosting?: JobPosting | null
}
