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

export type UnlockOptionType = 'pay-per-job' | 'zone-addon' | 'upgrade-plan' | 'jobs-addon'

export type AccessSource =
  | 'pay-per-job'
  | 'subscription'
  | 'all-zones'
  | 'applied'
  | 'no-zone-restriction'
  | null

export interface UnlockOption {
  type: UnlockOptionType
  label: string
  description?: string
  price?: number
  currency?: string
  priceINR?: number
  priceUSD?: number
  addonId?: string
  planId?: string
  zonesIncluded?: number
  unlockAllZones?: boolean
  jobCredits?: number
  url?: string
}

export interface ZoneLockReason {
  zoneId?: string
  zoneName?: string
  zone?: {
    id: string
    name: string
  }
  message: string
  unlockOptions: UnlockOption[]
}

export interface QuotaLockReason {
  applicationsUsed: number
  applicationLimit: number
  unlockOptions: UnlockOption[]
}

export interface ZoneInfo {
  id: string
  name: string
  description?: string
  countries: string[]
}

export interface StudentSubscriptionZones {
  allZonesIncluded: boolean
  homeZoneId: string | null
  accessibleZones: ZoneInfo[]
  lockedZones: ZoneInfo[]
}

export interface ZoneAddon {
  id: string
  name: string
  description: string
  price: number
  priceINR?: number | null
  priceUSD?: number | null
  currency: string
  zonesIncluded: number
  isFlexible: boolean
  zones?: ZoneInfo[]
}

export interface Country {
  id: string
  name: string
  code: string
  zoneId: string
  zoneName: string
}

export interface JobPosting {
  id: string
  companyId: string
  title: string
  description: string
  isDescriptionLocked?: boolean
  isZoneLocked?: boolean
  isQuotaExhausted?: boolean
  zoneLockReason?: ZoneLockReason | null
  quotaLockReason?: QuotaLockReason | null
  accessSource?: AccessSource
  countryId?: string | null
  countryName?: string | null
  zoneId?: string | null
  zoneName?: string | null
  requirements?: string | null
  location: string
  jobType: string
  salaryRange?: string | null
  deadline?: string | null
  status: JobStatus
  rejectionReason?: string | null
  createdAt: string
  approvedAt?: string | null
  // Application-related fields (populated when fetching jobs for authenticated students)
  hasApplied?: boolean
  applicationStatus?: ApplicationStatus
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
  interviewDate?: string | null
  interviewNotes?: string | null
  offerDetails?: string | null
  student?: Student | null
  jobPosting?: JobPosting | null
}

export type InAppNotificationType =
  | 'application_status'
  | 'company_status'
  | 'new_application'
  | 'COMPANY_REGISTRATION_APPROVED'
  | 'COMPANY_REGISTRATION_REJECTED'
  | 'admin_new_company_pending'
  | 'admin_new_job_pending'
  | 'admin_company_reverify_required'
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
export type BillingCycle = 'one-time' // Quota-based only
export type SubscriptionStatus = 'active' | 'exhausted' | 'cancelled' | 'expired' | 'pending'

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  description: string
  maxApplications: number | null // null = unlimited
  price: number
  priceINR: number
  priceUSD: number
  currency: SubscriptionCurrency
  discount: number // 0-100
  features: string[]
  badge: string | null // "Popular", "Best Value"
  displayOrder: number
  resumeDownloads: number | null
  videoViews: number | null
  // Legacy field names for backwards compatibility
  resumeDownloadsPerMonth?: number | null
  videoViewsPerMonth?: number | null
  prioritySupport: boolean
  profileBoost: boolean
  applicationHighlight: boolean
  isActive: boolean
  allZonesIncluded?: boolean
  zones?: Array<{ id: string; name: string; description?: string }>
  createdAt: string
  updatedAt: string
}

export interface FreeTierConfig {
  maxApplications: number | null
  features: string[]
  resumeDownloads: number | null
  videoViews: number | null
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
  endDate: string | null // null for quota-based plans
}

export interface SubscriptionUsage {
  applicationsUsed: number
  applicationsLimit: number | null
  applicationsRemaining: number | null
}
