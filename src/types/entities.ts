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

export interface StudentEducation {
  institution: string
  degree: string
  field: string
  startYear?: number | null
  endYear?: number | null
}

export interface StudentExperience {
  company: string
  title: string
  startDate: string
  endDate?: string | null
  description?: string | null
}

export interface Student {
  id: string
  username: string
  fullName: string
  email: string
  profileLink?: string | null
  resumeUrl?: string | null
  introVideoUrl?: string | null
  skills?: string[] | null
  education?: StudentEducation[] | null
  experience?: StudentExperience[] | null
  bio?: string | null
  location?: string | null
  availableFrom?: string | null
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

export type InAppNotificationType =
  | 'application_status'
  | 'company_status'
  | 'new_application'
  | 'system'

export interface InAppNotification {
  id: string
  recipientId: string
  recipientType: 'student' | 'company' | 'admin'
  type: InAppNotificationType
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

// Subscription Plans
export type SubscriptionTier = 'free' | 'paid'
export type SubscriptionCurrency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD'
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'one-time'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled'

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  description: string
  maxApplications: number | null // null = unlimited
  price: number
  currency: SubscriptionCurrency
  billingCycle: BillingCycle
  trialDays: number
  discount: number // 0-100
  features: string[]
  badge: string | null // "Popular", "Best Value"
  displayOrder: number
  resumeDownloadsPerMonth: number | null
  videoViewsPerMonth: number | null
  prioritySupport: boolean
  profileBoost: boolean
  applicationHighlight: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FreeTierConfig {
  maxApplications: number | null
  features: string[]
  resumeDownloadsPerMonth: number | null
  videoViewsPerMonth: number | null
}

export interface StudentSubscription {
  id: string
  plan: {
    id: string
    name: string
    tier: SubscriptionTier
    maxApplications: number | null
    features: string[]
  }
  status: SubscriptionStatus
  startDate: string
  endDate: string
  autoRenew: boolean
}

export interface SubscriptionUsage {
  applicationsUsed: number
  applicationsLimit: number | null
  applicationsRemaining: number | null
}
