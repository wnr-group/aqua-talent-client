import { Company, Student, Admin, JobPosting, Application, ZoneInfo, ZoneAddon, Country } from '@/types/entities'
import { CompanyStatus, JobStatus, ApplicationStatus, UserType } from '@/types/enums'

// Test credentials:
// Admin:   username: admin,   password: password123
// Company: username: infosys, password: password123
// Student: username: rahul,   password: password123

export const mockAdmin: Admin = {
  id: 'admin-1',
  username: 'admin',
  name: 'System Admin',
  email: 'admin@aquatalent.com',
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    username: 'infosys',
    name: 'Infosys Technologies',
    email: 'careers@infosys.com',
    status: CompanyStatus.APPROVED,
    createdAt: '2024-01-15T00:00:00Z',
    approvedAt: '2024-01-16T00:00:00Z',
    description: 'Infosys is a global leader in next-generation digital services and consulting.',
    website: 'https://infosys.com',
    industry: 'Information Technology',
    size: '1000+',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/infosys',
      twitter: 'https://twitter.com/infosys',
    },
    foundedYear: 1981,
  },
  {
    id: 'company-2',
    username: 'tcs',
    name: 'Tata Consultancy Services',
    email: 'careers@tcs.com',
    status: CompanyStatus.PENDING,
    createdAt: '2024-02-01T00:00:00Z',
    description: 'TCS is an IT services, consulting and business solutions organization.',
    website: 'https://tcs.com',
    industry: 'Information Technology',
    size: '1000+',
  },
  {
    id: 'company-3',
    username: 'wipro',
    name: 'Wipro Limited',
    email: 'careers@wipro.com',
    status: CompanyStatus.REJECTED,
    createdAt: '2024-01-20T00:00:00Z',
    rejectionReason: 'Incomplete registration information',
    industry: 'Information Technology',
    size: '1000+',
  },
]

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    studentId: 'STU2024001',
    username: 'rahul',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    isDGShipping: 'no',
    profileLink: 'https://linkedin.com/in/rahulsharma',
    isHired: false,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'student-2',
    studentId: 'STU2024002',
    username: 'priya',
    fullName: 'Priya Patel',
    email: 'priya.patel@email.com',
    isDGShipping: 'yes',
    profileLink: 'https://linkedin.com/in/priyapatel',
    isHired: false,
    createdAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'student-3',
    studentId: 'STU2024003',
    username: 'amit',
    fullName: 'Amit Kumar',
    email: 'amit.kumar@email.com',
    isDGShipping: 'no',
    profileLink: null,
    isHired: true,
    createdAt: '2024-01-08T00:00:00Z',
  },
]

export const mockJobs: JobPosting[] = [
  {
    id: 'job-1',
    companyId: 'company-1',
    title: 'Software Engineer Intern',
    description: 'Join our team as a software engineering intern. You will work on real projects and learn from experienced engineers. This is a great opportunity to gain hands-on experience in a fast-paced environment.',
    requirements: 'Currently pursuing a degree in Computer Science or related field. Knowledge of JavaScript/TypeScript preferred.',
    location: 'San Francisco, CA',
    jobType: 'Internship',
    salaryRange: '$25-35/hour',
    deadline: '2024-06-01T00:00:00Z',
    status: JobStatus.APPROVED,
    countryId: 'country-us',
    countryName: 'United States',
    createdAt: '2024-02-01T00:00:00Z',
    approvedAt: '2024-02-02T00:00:00Z',
    company: { id: 'company-1', name: 'Acme Corporation' },
  },
  {
    id: 'job-2',
    companyId: 'company-1',
    title: 'Product Design Intern',
    description: 'We are looking for a creative product design intern to join our UX team. You will help design user interfaces and conduct user research.',
    requirements: 'Portfolio required. Familiarity with Figma or Sketch.',
    location: 'Remote',
    jobType: 'Internship',
    salaryRange: '$20-30/hour',
    deadline: '2024-05-15T00:00:00Z',
    status: JobStatus.APPROVED,
    createdAt: '2024-02-05T00:00:00Z',
    approvedAt: '2024-02-06T00:00:00Z',
    company: { id: 'company-1', name: 'Acme Corporation' },
  },
  {
    id: 'job-3',
    companyId: 'company-1',
    title: 'Data Analyst',
    description: 'Full-time data analyst position. Work with large datasets to derive insights and support business decisions.',
    requirements: 'Experience with SQL and Python. Knowledge of data visualization tools.',
    location: 'New York, NY',
    jobType: 'Full-time',
    salaryRange: '$70,000-90,000/year',
    status: JobStatus.PENDING,
    createdAt: '2024-02-10T00:00:00Z',
    company: { id: 'company-1', name: 'Acme Corporation' },
  },
  {
    id: 'job-4',
    companyId: 'company-2',
    title: 'Frontend Developer',
    description: 'Build amazing user interfaces with React and TypeScript.',
    requirements: '2+ years of React experience.',
    location: 'Austin, TX',
    jobType: 'Full-time',
    salaryRange: '$80,000-100,000/year',
    status: JobStatus.PENDING,
    createdAt: '2024-02-08T00:00:00Z',
    company: { id: 'company-2', name: 'TechStart Inc' },
  },
  {
    id: 'job-5',
    companyId: 'company-1',
    title: 'Marketing Coordinator',
    description: '',
    requirements: '',
    location: 'Remote',
    jobType: 'Full-time',
    salaryRange: '',
    status: JobStatus.DRAFT,
    createdAt: '2024-02-12T00:00:00Z',
    company: { id: 'company-1', name: 'Acme Corporation' },
  },
  {
    id: 'job-6',
    companyId: 'company-1',
    title: 'DevOps Engineer',
    description: 'Manage CI/CD pipelines and cloud infrastructure. Work with Kubernetes, Docker, and AWS to keep our systems reliable and scalable.',
    requirements: 'Experience with AWS, Docker, Kubernetes. Strong Linux skills.',
    location: 'San Francisco, CA',
    jobType: 'Full-time',
    salaryRange: '$120,000-150,000/year',
    status: JobStatus.UNPUBLISHED,
    createdAt: '2024-01-20T00:00:00Z',
    approvedAt: '2024-01-22T00:00:00Z',
    company: { id: 'company-1', name: 'Acme Corporation' },
  },
  {
    id: 'job-7',
    companyId: 'company-1',
    title: 'Backend Engineer Intern',
    description: 'Work on scalable REST APIs using Node.js and Express. Collaborate with senior engineers to design and ship backend features for our core platform.',
    requirements: 'Familiarity with Node.js, REST APIs, and SQL databases. Currently pursuing a CS or related degree.',
    location: 'Bangalore, India',
    jobType: 'Internship',
    salaryRange: '₹20,000-30,000/month',
    status: JobStatus.APPROVED,
    countryId: 'country-in',
    countryName: 'India',
    createdAt: '2024-03-01T00:00:00Z',
    approvedAt: '2024-03-02T00:00:00Z',
    company: { id: 'company-1', name: 'Acme Corporation' },
  },
  {
    id: 'job-8',
    companyId: 'company-1',
    title: 'ML Research Intern',
    description: 'Join our AI team to build and evaluate machine learning models. Work with real datasets and contribute to research publications.',
    requirements: 'Familiarity with Python, NumPy, and PyTorch or TensorFlow. Interest in ML/AI research.',
    location: 'Remote',
    jobType: 'Internship',
    salaryRange: '₹25,000-35,000/month',
    status: JobStatus.APPROVED,
    createdAt: '2024-03-05T00:00:00Z',
    approvedAt: '2024-03-06T00:00:00Z',
    company: { id: 'company-1', name: 'Acme Corporation' },
  },
  {
    id: 'job-9',
    companyId: 'company-1',
    title: 'Technical Writer Intern',
    description: 'Help us create clear and engaging developer documentation, API guides, and tutorials. Work closely with engineering and product teams.',
    requirements: 'Strong written English skills. Familiarity with Markdown and developer tools is a plus.',
    location: 'Remote',
    jobType: 'Internship',
    salaryRange: '₹15,000-20,000/month',
    status: JobStatus.APPROVED,
    createdAt: '2024-03-08T00:00:00Z',
    approvedAt: '2024-03-09T00:00:00Z',
    company: { id: 'company-1', name: 'Acme Corporation' },
  },
]

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    studentId: 'student-1',
    jobPostingId: 'job-1',
    status: ApplicationStatus.PENDING,
    createdAt: '2024-02-15T00:00:00Z',
    interviewDate: null,
    interviewNotes: null,
    offerDetails: null,
    student: mockStudents[0],
    jobPosting: mockJobs[0],
  },
  {
    id: 'app-2',
    studentId: 'student-2',
    jobPostingId: 'job-1',
    status: ApplicationStatus.HIRED,
    createdAt: '2024-02-14T00:00:00Z',
    reviewedAt: '2024-02-20T00:00:00Z',
    interviewDate: null,
    interviewNotes: null,
    offerDetails: null,
    student: mockStudents[1],
    jobPosting: mockJobs[0],
  },
  {
    id: 'app-3',
    studentId: 'student-2',
    jobPostingId: 'job-2',
    status: ApplicationStatus.PENDING,
    createdAt: '2024-02-16T00:00:00Z',
    interviewDate: null,
    interviewNotes: null,
    offerDetails: null,
    student: mockStudents[1],
    jobPosting: mockJobs[1],
  },
]

export interface MockSubscriptionPlan {
  id: string
  _id: string // For backwards compatibility
  name: string
  tier: 'free' | 'paid'
  description: string
  maxApplications: number | null
  price: number
  priceINR?: number | null
  priceUSD?: number | null
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD'
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'one-time'
  trialDays: number
  discount: number
  features: string[]
  badge: string | null
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

export interface MockFreeTierConfig {
  free_tier_max_applications: number
  free_tier_features: string[]
  free_tier_resume_downloads: number | null
  free_tier_video_views: number | null
}

export const mockFreeTierConfig: MockFreeTierConfig = {
  free_tier_max_applications: 2,
  free_tier_features: [
    'Up to 2 active applications',
    'Basic profile visibility',
    'Standard email notifications',
  ],
  free_tier_resume_downloads: 5,
  free_tier_video_views: 10,
}

export const mockSubscriptionPlans: MockSubscriptionPlan[] = [
  {
    id: 'plan-free',
    _id: 'plan-free',
    name: 'Free',
    tier: 'free',
    description: 'Great for getting started with your job search.',
    maxApplications: 2,
    price: 0,
    priceINR: 0,
    priceUSD: 0,
    currency: 'INR',
    billingCycle: 'monthly',
    trialDays: 0,
    discount: 0,
    features: [
      'Up to 2 active applications',
      'Basic profile visibility',
      'Standard email notifications',
    ],
    badge: null,
    displayOrder: 1,
    resumeDownloadsPerMonth: 5,
    videoViewsPerMonth: 10,
    prioritySupport: false,
    profileBoost: false,
    applicationHighlight: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'starter',
    _id: 'starter',
    name: 'Starter',
    tier: 'paid',
    description: 'Starter plan with up to 5 job applications.',
    maxApplications: 5,
    price: 199,
    priceINR: 199,
    priceUSD: 5,
    currency: 'INR',
    billingCycle: 'monthly',
    trialDays: 0,
    discount: 0,
    features: [
      'Up to 5 active applications',
      'Basic profile visibility',
      'Standard email notifications',
    ],
    badge: null,
    displayOrder: 2,
    resumeDownloadsPerMonth: 10,
    videoViewsPerMonth: 20,
    prioritySupport: false,
    profileBoost: false,
    applicationHighlight: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan-pro-monthly',
    _id: 'service-pro-monthly', // Keep old ID for backwards compatibility
    name: 'Pro Monthly',
    tier: 'paid',
    description: 'For serious job seekers who want unlimited applications.',
    maxApplications: null,
    price: 499,
    priceINR: 599,
    priceUSD: 20,
    currency: 'INR',
    billingCycle: 'monthly',
    trialDays: 7,
    discount: 0,
    features: [
      'Unlimited active applications',
      'Priority support',
      'Featured profile visibility',
      'Early access to premium jobs',
    ],
    badge: 'Popular',
    displayOrder: 3,
    resumeDownloadsPerMonth: null,
    videoViewsPerMonth: null,
    prioritySupport: true,
    profileBoost: true,
    applicationHighlight: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan-pro-yearly',
    _id: 'plan-pro-yearly',
    name: 'Pro Yearly',
    tier: 'paid',
    description: 'Best value for committed job seekers. Save 20%!',
    maxApplications: null,
    price: 4790,
    priceINR: 1699,
    priceUSD: 35,
    currency: 'INR',
    billingCycle: 'yearly',
    trialDays: 14,
    discount: 20,
    features: [
      'Unlimited active applications',
      'Priority support',
      'Featured profile visibility',
      'Early access to premium jobs',
      'Resume review by experts',
    ],
    badge: 'Best Value',
    displayOrder: 4,
    resumeDownloadsPerMonth: null,
    videoViewsPerMonth: null,
    prioritySupport: true,
    profileBoost: true,
    applicationHighlight: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'plan-lifetime',
    _id: 'plan-lifetime',
    name: 'Lifetime',
    tier: 'paid',
    description: 'One-time payment for lifetime access. Never pay again!',
    maxApplications: null,
    price: 9999,
    priceINR: 3250,
    priceUSD: 60,
    currency: 'INR',
    billingCycle: 'one-time',
    trialDays: 0,
    discount: 0,
    features: [
      'Unlimited active applications',
      'Priority support',
      'Featured profile visibility',
      'Early access to premium jobs',
      'Resume review by experts',
      'Lifetime access - never expires',
    ],
    badge: 'Lifetime',
    displayOrder: 5,
    resumeDownloadsPerMonth: null,
    videoViewsPerMonth: null,
    prioritySupport: true,
    profileBoost: true,
    applicationHighlight: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// Legacy alias for backwards compatibility
export const mockServices = mockSubscriptionPlans

// ── Zonal Pricing Data ─────────────────────────────────────────────────────

export const mockZones: ZoneInfo[] = [
  { id: 'zone-apac', name: 'Asia-Pacific', countries: ['India', 'Singapore', 'Australia', 'Japan'] },
  { id: 'zone-na', name: 'North America', countries: ['United States', 'Canada'] },
  { id: 'zone-eu', name: 'Europe', countries: ['United Kingdom', 'Germany', 'France', 'Netherlands'] },
]

export const mockCountries: Country[] = [
  { id: 'country-in', name: 'India', code: 'IN', zoneId: 'zone-apac', zoneName: 'Asia-Pacific' },
  { id: 'country-sg', name: 'Singapore', code: 'SG', zoneId: 'zone-apac', zoneName: 'Asia-Pacific' },
  { id: 'country-au', name: 'Australia', code: 'AU', zoneId: 'zone-apac', zoneName: 'Asia-Pacific' },
  { id: 'country-jp', name: 'Japan', code: 'JP', zoneId: 'zone-apac', zoneName: 'Asia-Pacific' },
  { id: 'country-us', name: 'United States', code: 'US', zoneId: 'zone-na', zoneName: 'North America' },
  { id: 'country-ca', name: 'Canada', code: 'CA', zoneId: 'zone-na', zoneName: 'North America' },
  { id: 'country-gb', name: 'United Kingdom', code: 'GB', zoneId: 'zone-eu', zoneName: 'Europe' },
  { id: 'country-de', name: 'Germany', code: 'DE', zoneId: 'zone-eu', zoneName: 'Europe' },
  { id: 'country-fr', name: 'France', code: 'FR', zoneId: 'zone-eu', zoneName: 'Europe' },
  { id: 'country-nl', name: 'Netherlands', code: 'NL', zoneId: 'zone-eu', zoneName: 'Europe' },
]

export const mockZoneAddons: ZoneAddon[] = [
  {
    id: 'addon-zone-single',
    name: '1 Extra Zone',
    description: 'Unlock job opportunities in one additional geographic zone of your choice.',
    price: 299,
    priceINR: 299,
    priceUSD: 5,
    currency: 'INR',
    zonesIncluded: 1,
    isFlexible: true,
  },
  {
    id: 'addon-zone-all',
    name: 'All Zones Access',
    description: 'Unlock job opportunities in all geographic zones worldwide.',
    price: 699,
    priceINR: 699,
    priceUSD: 10,
    currency: 'INR',
    zonesIncluded: 3,
    isFlexible: false,
    zones: mockZones,
  },
]

// Tracks zone unlocks per student: addonZoneIds = zone IDs unlocked via addon, payPerJobIds = job IDs unlocked via pay-per-job
export const mockStudentZoneAccess: Record<string, { addonZoneIds: string[]; payPerJobIds: string[] }> = {}

// Plans that include all zones
export const PLANS_WITH_ALL_ZONES = ['plan-pro-monthly', 'plan-pro-yearly', 'plan-lifetime', 'service-pro-monthly']

// Per-plan zone configuration (admin-managed). Initialised from PLANS_WITH_ALL_ZONES.
export const mockPlanZones: Record<string, { allZonesIncluded: boolean; zoneIds: string[] }> = {
  'plan-free':         { allZonesIncluded: true,  zoneIds: [] },
  'starter':           { allZonesIncluded: false, zoneIds: ['zone-apac'] },
  'plan-pro-monthly':  { allZonesIncluded: true,  zoneIds: [] },
  'plan-pro-yearly':   { allZonesIncluded: true,  zoneIds: [] },
  'plan-lifetime':     { allZonesIncluded: true,  zoneIds: [] },
  'service-pro-monthly': { allZonesIncluded: true, zoneIds: [] },
}

type StudentSubscription = {
  subscriptionTier: 'free' | 'paid'
  serviceId?: string
  endDate?: string
}

export interface AppNotification {
  id: string
  recipientId: string
  recipientType: 'student' | 'company' | 'admin'
  type:
    | 'application_status'
    | 'company_status'
    | 'new_application'
    | 'COMPANY_REGISTRATION_APPROVED'
    | 'COMPANY_REGISTRATION_REJECTED'
    | 'admin_new_company_pending'
    | 'admin_new_job_pending'
    | 'admin_company_reverify_required'
    | 'system'
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

export const mockNotifications: AppNotification[] = [
  // ── Student notifications ──────────────────────────────────────────────
  {
    id: 'notif-1',
    recipientId: 'student-1',
    recipientType: 'student',
    type: 'application_status',
    title: 'Application reviewed',
    message: 'Your application for Software Engineer Intern at Acme Corporation has been reviewed and approved.',
    link: '/my-applications',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-2',
    recipientId: 'student-1',
    recipientType: 'student',
    type: 'system',
    title: 'Complete your profile',
    message: 'Your profile is less than 70% complete. Add skills and experience to stand out.',
    link: '/profile',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'notif-3',
    recipientId: 'student-1',
    recipientType: 'student',
    type: 'application_status',
    title: 'Application submitted',
    message: 'Your application for Product Design Intern has been submitted successfully.',
    link: '/my-applications',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'notif-7',
    recipientId: 'student-1',
    recipientType: 'student',
    type: 'application_status',
    title: 'Congratulations — you have been hired!',
    message: 'Acme Corporation has selected you for the Software Engineer Intern role. Check your applications for next steps.',
    link: '/my-applications',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'notif-8',
    recipientId: 'student-1',
    recipientType: 'student',
    type: 'system',
    title: 'New jobs matching your skills',
    message: 'Browse 5 new job postings that match your skills and preferences.',
    link: '/jobs',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },

  // ── Company notifications ───────────────────────────────────────────────
  {
    id: 'notif-4',
    recipientId: 'company-1',
    recipientType: 'company',
    type: 'new_application',
    title: 'New application received',
    message: 'John Doe applied for the Software Engineer Intern position.',
    link: '/applications',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'notif-5',
    recipientId: 'company-1',
    recipientType: 'company',
    type: 'company_status',
    title: 'Company profile approved',
    message: 'Your company profile has been approved. You can now post jobs.',
    link: '/jobs',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'notif-9',
    recipientId: 'company-1',
    recipientType: 'company',
    type: 'new_application',
    title: 'Multiple new applications',
    message: '3 candidates have applied to your active jobs in the last 24 hours.',
    link: '/applications',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },

  // ── Admin notifications ─────────────────────────────────────────────────
  {
    id: 'notif-6',
    recipientId: 'admin-1',
    recipientType: 'admin',
    type: 'company_status',
    title: 'New company registration',
    message: 'TechStart Inc has registered and is pending approval.',
    link: '/companies',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'notif-10',
    recipientId: 'admin-1',
    recipientType: 'admin',
    type: 'new_application',
    title: 'New application pending review',
    message: 'A student has applied to Software Engineer Intern. Review and approve to make it visible to the company.',
    link: '/applications',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'notif-11',
    recipientId: 'admin-1',
    recipientType: 'admin',
    type: 'company_status',
    title: 'Job posting pending review',
    message: 'Acme Corporation submitted a new job posting for your review.',
    link: '/jobs',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'notif-12',
    recipientId: 'admin-1',
    recipientType: 'admin',
    type: 'system',
    title: 'Platform activity summary',
    message: '12 new applications, 2 new company registrations, and 4 new job postings this week.',
    link: '/',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
]

export const mockStudentSubscriptions: Record<string, StudentSubscription> = {
  'student-1': {
    subscriptionTier: 'free',
  },
  'student-2': {
    subscriptionTier: 'paid',
    serviceId: 'starter',           // Starter plan (limit 5) — for testing description lock on paid plans
    endDate: '2026-12-31T00:00:00.000Z',
  },
  'student-3': {
    subscriptionTier: 'free',
  },
}

// Session storage for current user
let currentUser: {
  id: string
  username: string
  userType: UserType
  data: Company | Student | Admin
} | null = null

export const auth = {
  getCurrentUser: () => currentUser,
  setCurrentUser: (user: typeof currentUser) => {
    currentUser = user
  },
  clearCurrentUser: () => {
    currentUser = null
  },
}

// Helper to find user by credentials
export function findUser(username: string, password: string, userType: UserType) {
  // All test accounts use password: password123
  if (password !== 'password123') return null

  switch (userType) {
    case UserType.ADMIN:
      if (username === 'admin') {
        return { id: mockAdmin.id, username: mockAdmin.username, userType, data: mockAdmin }
      }
      break
    case UserType.COMPANY:
      const company = mockCompanies.find((c) => c.username === username)
      if (company) {
        return { id: company.id, username: company.username, userType, data: company }
      }
      break
    case UserType.STUDENT:
      const student = mockStudents.find((s) => s.username === username)
      if (student) {
        return { id: student.id, username: student.username, userType, data: student }
      }
      break
  }
  return null
}
