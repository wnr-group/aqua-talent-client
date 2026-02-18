import { CompanyStatus, JobStatus, ApplicationStatus } from './enums'

export interface CompanySocialLinks {
  linkedin?: string | null
  twitter?: string | null
}

export interface Company {
  id: string
  username: string
  name: string
  email: string
  status: CompanyStatus
  createdAt: string
  approvedAt?: string | null
  rejectionReason?: string | null
  logo?: string | null
  website?: string | null
  description?: string | null
  industry?: string | null
  size?: string | null
  socialLinks?: CompanySocialLinks | null
  foundedYear?: number | null
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
    logo?: string | null
    website?: string | null
    description?: string | null
    industry?: string | null
    size?: string | null
    socialLinks?: CompanySocialLinks | null
    foundedYear?: number | null
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
