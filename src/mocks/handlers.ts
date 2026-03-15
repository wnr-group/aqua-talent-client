import { http, HttpResponse, delay } from 'msw'
import {
  mockCompanies,
  mockStudents,
  mockJobs,
  mockApplications,
  mockSubscriptionPlans,
  mockStudentSubscriptions,
  mockFreeTierConfig,
  auth,
  findUser,
} from './data'
import { UserType, CompanyStatus, JobStatus, ApplicationStatus } from '@/types/enums'
import { Company, Student, JobPosting, Application } from '@/types/entities'
import type { ProfileCompletenessData } from '@/features/student/types'
import { mockNotifications } from './data'

const API_URL = 'http://localhost:3001/api'

// Simulate network delay
const DELAY_MS = 300

interface CompletenessCheck {
  label: string
  isComplete: boolean
}

const COMPLETENESS_CHECKS = (student: Student): CompletenessCheck[] => {
  const skillsCount = student.skills?.filter((skill) => !!skill)?.length ?? 0
  const educationCount = student.education?.length ?? 0
  const experienceCount = student.experience?.length ?? 0

  return [
    { label: 'Add a short bio', isComplete: Boolean(student.bio && student.bio.trim().length >= 80) },
    { label: 'Specify your location', isComplete: Boolean(student.location) },
    { label: 'Set your availability date', isComplete: Boolean(student.availableFrom) },
    { label: 'Add a profile link', isComplete: Boolean(student.profileLink) },
    { label: 'Add at least 3 skills', isComplete: skillsCount >= 3 },
    { label: 'Add your education history', isComplete: educationCount > 0 },
    { label: 'Add at least one experience', isComplete: experienceCount > 0 },
    { label: 'Upload your resume', isComplete: Boolean(student.resumeUrl) },
    { label: 'Record an intro video', isComplete: Boolean(student.introVideoUrl) },
  ]
}

function calculateStudentCompleteness(student: Student): ProfileCompletenessData {
  const checks = COMPLETENESS_CHECKS(student)
  const totalChecks = checks.length || 1
  const completed = checks.filter((check) => check.isComplete).length
  const percentage = Math.round((completed / totalChecks) * 100)
  const missingItems = checks.filter((check) => !check.isComplete).map((check) => check.label)

  return {
    percentage,
    missingItems,
  }
}

function updateStudentRecord(studentId: string, updates: Partial<Student>): Student | null {
  const index = mockStudents.findIndex((student) => student.id === studentId)
  if (index === -1) {
    return null
  }

  const updated = { ...mockStudents[index]!, ...updates } as Student
  mockStudents[index] = updated
  return updated
}

interface MockPaymentOrder {
  id: string
  planId: string
  amount: number
  currency: string
  studentId: string
  companyId?: string
}

const mockPaymentOrders = new Map<string, MockPaymentOrder>()

function findSubscriptionPlan(planIdentifier?: string) {
  if (!planIdentifier) {
    return undefined
  }

  return mockSubscriptionPlans.find(
    (item) => item.id === planIdentifier || item._id === planIdentifier
  )
}

function getNormalizedNonIndianPrice(plan: {
  nonIndianPrice?: number | null
  internationalPrice?: number | null
  price: number
  currency: string
}) {
  return plan.nonIndianPrice ?? plan.internationalPrice ?? (plan.currency === 'USD' ? plan.price : null)
}

function getNormalizedIndianPrice(plan: {
  indianPrice?: number | null
  price: number
  currency: string
}) {
  return plan.indianPrice ?? (plan.currency === 'INR' ? plan.price : null)
}

function withPricingAliases<T extends {
  indianPrice?: number | null
  nonIndianPrice?: number | null
  internationalPrice?: number | null
  price: number
  currency: string
}>(plan: T) {
  const indianPrice = getNormalizedIndianPrice(plan)
  const nonIndianPrice = getNormalizedNonIndianPrice(plan)

  return {
    ...plan,
    indianPrice,
    nonIndianPrice,
    internationalPrice: plan.internationalPrice ?? nonIndianPrice,
  }
}

function calculateSubscriptionEndDate(billingCycle: string): string {
  const endDate = new Date()

  switch (billingCycle) {
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1)
      break
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3)
      break
    case 'one-time':
      endDate.setFullYear(2099, 11, 31)
      break
    default:
      endDate.setMonth(endDate.getMonth() + 1)
      break
  }

  return endDate.toISOString()
}

function isSpotlightPlan(plan: { name: string }) {
  return plan.name.trim().toLowerCase().includes('spotlight')
}

function getOrderAmount(plan: {
  indianPrice?: number | null
  nonIndianPrice?: number | null
  internationalPrice?: number | null
  price: number
  currency: string
}, currency?: string) {
  const normalizedCurrency = currency?.toUpperCase()

  if (normalizedCurrency === 'USD') {
    return plan.internationalPrice ?? plan.nonIndianPrice ?? plan.price
  }

  if (normalizedCurrency === 'INR') {
    return plan.indianPrice ?? plan.price
  }

  return plan.price
}

async function verifyPaymentRequest(request: Request) {
  await delay(DELAY_MS)
  const user = auth.getCurrentUser()
  if (!user || user.userType !== UserType.STUDENT) {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
  }

  const body = (await request.json()) as {
    serviceId?: string
    companyId?: string
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
  }

  if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    return HttpResponse.json({ message: 'Invalid payment verification payload' }, { status: 400 })
  }

  const order = mockPaymentOrders.get(body.razorpay_order_id)

  if (!order) {
    return HttpResponse.json({ message: 'Payment order not found' }, { status: 404 })
  }

  if (order.studentId !== user.id) {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
  }

  if (body.serviceId && body.serviceId !== order.planId) {
    const matchingPlan = findSubscriptionPlan(body.serviceId)
    if (!matchingPlan || matchingPlan.id !== order.planId) {
      return HttpResponse.json({ message: 'Payment verification failed' }, { status: 400 })
    }
  }

  if (order.companyId && body.companyId && order.companyId !== body.companyId) {
    return HttpResponse.json({ message: 'Payment verification failed' }, { status: 400 })
  }

  const plan = findSubscriptionPlan(order.planId)
  if (!plan) {
    return HttpResponse.json({ message: 'Plan not found' }, { status: 404 })
  }

  mockStudentSubscriptions[user.id] = {
    subscriptionTier: plan.tier === 'free' ? 'free' : 'paid',
    serviceId: plan.tier === 'free' ? undefined : plan.id,
    endDate: plan.tier === 'free' ? undefined : calculateSubscriptionEndDate(plan.billingCycle),
  }

  return HttpResponse.json({ success: true })
}

function buildStudentSubscriptionResponse(studentId: string) {
  const current = mockStudentSubscriptions[studentId] || { subscriptionTier: 'free' as const }
  const freePlan = mockSubscriptionPlans.find((item) => item.tier === 'free' && item.isActive)
  const applicationsUsed = mockApplications.filter(
    (application) =>
      application.studentId === studentId && application.status !== ApplicationStatus.WITHDRAWN
  ).length

  if (current.subscriptionTier === 'paid' && current.serviceId) {
    const plan = findSubscriptionPlan(current.serviceId)

    if (plan) {
      const applicationLimit = plan.maxApplications

      return {
        subscriptionTier: 'paid' as const,
        status: 'active',
        isActive: true,
        inGracePeriod: false,
        currentSubscription: {
          id: `subscription-${studentId}`,
          service: {
            _id: plan._id,
            name: plan.name,
            tier: plan.tier,
            price: plan.price,
            indianPrice: plan.indianPrice,
            nonIndianPrice: getNormalizedNonIndianPrice(plan),
            internationalPrice: plan.internationalPrice,
            currency: plan.currency,
            billingCycle: plan.billingCycle,
            trialDays: plan.trialDays,
            discount: plan.discount,
            badge: plan.badge,
            features: plan.features,
            prioritySupport: plan.prioritySupport,
            profileBoost: plan.profileBoost,
            applicationHighlight: plan.applicationHighlight,
          },
          startDate: new Date().toISOString(),
          endDate: current.endDate || calculateSubscriptionEndDate(plan.billingCycle),
          status: 'active',
          autoRenew: plan.billingCycle !== 'one-time',
        },
        applicationLimit,
        applicationsUsed,
        applicationsRemaining:
          applicationLimit === null ? null : Math.max(applicationLimit - applicationsUsed, 0),
      }
    }
  }

  const applicationLimit = freePlan?.maxApplications ?? 2

  return {
    subscriptionTier: 'free' as const,
    status: 'active',
    isActive: true,
    inGracePeriod: false,
    currentSubscription: null,
    applicationLimit,
    applicationsUsed,
    applicationsRemaining:
      applicationLimit === null ? null : Math.max(applicationLimit - applicationsUsed, 0),
  }
}

export const handlers = [
  // ============ AUTH ============

  // Login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as { username: string; password: string; userType: UserType }

    const user = findUser(body.username, body.password, body.userType)
    if (!user) {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    auth.setCurrentUser(user)

    // Return token + user format to match real backend
    return HttpResponse.json({
      token: `mock-jwt-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        username: user.username,
        userType: user.userType,
        company: user.userType === UserType.COMPANY ? user.data : null,
        student: user.userType === UserType.STUDENT ? user.data : null,
      },
    })
  }),

  // Logout
  http.post(`${API_URL}/auth/logout`, async () => {
    await delay(DELAY_MS)
    auth.clearCurrentUser()
    return HttpResponse.json({ success: true })
  }),

  // Get current user
  http.get(`${API_URL}/auth/me`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user) {
      return HttpResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    return HttpResponse.json({
      id: user.id,
      username: user.username,
      userType: user.userType,
      company: user.userType === UserType.COMPANY ? user.data : null,
      student: user.userType === UserType.STUDENT ? user.data : null,
    })
  }),

  // Register company
  http.post(`${API_URL}/auth/register/company`, async ({ request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as {
      companyName: string
      username: string
      email: string
      password: string
    }

    const newCompany: Company = {
      id: `company-${Date.now()}`,
      username: body.username,
      name: body.companyName,
      email: body.email,
      status: CompanyStatus.PENDING,
      createdAt: new Date().toISOString(),
    }

    mockCompanies.push(newCompany)

    // ── Notify admin: new company registration ─────────────────────────────
    mockNotifications.unshift({
      id: `notif-${Date.now()}-admin-reg`,
      recipientId: 'admin-1',
      recipientType: 'admin',
      type: 'admin_new_company_pending',
      title: 'New company registration',
      message: `${newCompany.name} has registered and is pending approval.`,
      link: `/admin/companies/${newCompany.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({ success: true, message: 'Registration submitted' })
  }),

  // Forgot password - request reset
  http.post(`${API_URL}/auth/forgot-password`, async ({ request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as { email: string }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!body.email || !emailRegex.test(body.email)) {
      return HttpResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Always return success to prevent email enumeration
    return HttpResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link shortly.',
    })
  }),

  // Verify reset token
  http.post(`${API_URL}/auth/verify-reset-token`, async ({ request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as { token: string }

    // No token provided
    if (!body.token) {
      return HttpResponse.json({
        valid: false,
        error: 'Invalid or expired token',
      }, { status: 400 })
    }

    // Simulate expired token for tokens containing 'expired' or 'invalid'
    if (body.token.includes('expired') || body.token.includes('invalid')) {
      return HttpResponse.json({
        valid: false,
        error: 'Invalid or expired token',
      }, { status: 400 })
    }

    // For all other tokens (any non-empty string), return valid
    // In production, this would verify against the database
    return HttpResponse.json({
      valid: true,
      email: 'u***@example.com',
    })
  }),

  // Reset password
  http.post(`${API_URL}/auth/reset-password`, async ({ request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as { token: string; password: string }

    // Validate token
    if (!body.token || body.token.includes('expired') || body.token.includes('invalid')) {
      return HttpResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Validate password
    if (!body.password || body.password.length < 8) {
      return HttpResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    return HttpResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    })
  }),

  // Register student
  http.post(`${API_URL}/auth/register/student`, async ({ request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as {
      fullName: string
      username: string
      email: string
      password: string
      profileLink?: string
    }

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      username: body.username,
      fullName: body.fullName,
      email: body.email,
      profileLink: body.profileLink || null,
      isHired: false,
      createdAt: new Date().toISOString(),
    }

    mockStudents.push(newStudent)
    return HttpResponse.json({ success: true })
  }),

  // ============ MEDIA ============

  // Get presigned URL for S3 key
  http.get(`${API_URL}/media/url`, async ({ request }) => {
    await delay(100) // Quick response for media URLs
    const url = new URL(request.url)
    const key = url.searchParams.get('key')

    if (!key) {
      return HttpResponse.json({ error: 'Key parameter is required' }, { status: 400 })
    }

    // In mock mode, return a fake CDN URL based on the key
    // The key format is typically: type/userId-timestamp.ext
    const mockUrl = `https://cdn.aquatalent.local/${key}`

    return HttpResponse.json({ url: mockUrl })
  }),

  // ============ PAYMENTS ============

  http.post(`${API_URL}/payments/create-order`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as {
      planId?: string
      serviceId?: string
      companyId?: string
      currency?: string
    }
    const planIdentifier = body.planId || body.serviceId
    const plan = findSubscriptionPlan(planIdentifier)

    if (!plan) {
      return HttpResponse.json({ message: 'Plan not found' }, { status: 404 })
    }

    if (plan.tier === 'free' || plan.price <= 0) {
      return HttpResponse.json({ message: 'This plan does not require payment' }, { status: 400 })
    }

    if (isSpotlightPlan(plan) && !body.companyId) {
      return HttpResponse.json({ message: 'companyId is required for Spotlight plans' }, { status: 400 })
    }

    const displayCurrency = body.currency?.toUpperCase() === 'USD' ? 'USD' : 'INR'
    const displayAmount = getOrderAmount(plan, displayCurrency)

    const orderId = `order_${Date.now()}`
    const order: MockPaymentOrder = {
      id: orderId,
      planId: plan.id,
      amount: Math.round(displayAmount * 100),
      currency: displayCurrency,
      studentId: user.id,
      companyId: body.companyId,
    }

    mockPaymentOrders.set(orderId, order)

    return HttpResponse.json({
      orderId: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: 'rzp_test_aqua_talent',
      serviceName: plan.name,
    })
  }),

  http.post(`${API_URL}/payments/verify-payment`, async ({ request }) => {
    return verifyPaymentRequest(request)
  }),

  http.post(`${API_URL}/payments/verify`, async ({ request }) => {
    return verifyPaymentRequest(request)
  }),

  // ============ COMPANY ============

  // Company dashboard stats
  http.get(`${API_URL}/company/dashboard`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.COMPANY) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const companyJobs = mockJobs.filter((j) => j.companyId === user.id)
    const jobIds = companyJobs.map((j) => j.id)
    const companyApps = mockApplications.filter((a) => jobIds.includes(a.jobPostingId))

    return HttpResponse.json({
      totalJobs: companyJobs.length,
      activeJobs: companyJobs.filter((j) => j.status === JobStatus.APPROVED).length,
      pendingJobs: companyJobs.filter((j) => j.status === JobStatus.PENDING).length,
      totalApplications: companyApps.length,
      pendingApplications: companyApps.filter((a) => a.status === ApplicationStatus.PENDING).length,
    })
  }),

  // Company jobs
  http.get(`${API_URL}/company/jobs`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.COMPANY) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const jobs = mockJobs.filter((j) => j.companyId === user.id)
    return HttpResponse.json({ jobs })
  }),

  // Create job
  http.post(`${API_URL}/company/jobs`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.COMPANY) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as Partial<JobPosting>
    const company = user.data as Company

    const isDraft = (body as Record<string, unknown>).status === 'draft'
    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      companyId: user.id,
      title: body.title || '',
      description: body.description || '',
      requirements: body.requirements || null,
      location: body.location || '',
      jobType: body.jobType || 'Full-time',
      salaryRange: body.salaryRange || null,
      deadline: body.deadline || null,
      status: isDraft ? JobStatus.DRAFT : JobStatus.PENDING,
      createdAt: new Date().toISOString(),
      company: { id: company.id, name: company.name },
    }

    mockJobs.push(newJob)

    // ── Notify admin: new job pending review (skip for drafts) ─────────
    if (!isDraft) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-admin-job`,
        recipientId: 'admin-1',
        recipientType: 'admin',
        type: 'admin_new_job_pending',
        title: 'New job posting pending review',
        message: `${company.name} submitted a new job posting: ${newJob.title}.`,
        link: `/admin/jobs/${newJob.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    return HttpResponse.json(newJob)
  }),

  // Unpublish job
  http.patch(`${API_URL}/company/jobs/:jobId/unpublish`, async ({ params }) => {
    await delay(DELAY_MS)
    const jobIndex = mockJobs.findIndex((j) => j.id === params.jobId)
    if (jobIndex === -1) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }
    if (mockJobs[jobIndex]!.status !== JobStatus.APPROVED) {
      return HttpResponse.json({ message: 'Only approved jobs can be unpublished' }, { status: 400 })
    }
    mockJobs[jobIndex] = { ...mockJobs[jobIndex]!, status: JobStatus.UNPUBLISHED }
    return HttpResponse.json(mockJobs[jobIndex])
  }),

  // Republish job
  http.patch(`${API_URL}/company/jobs/:jobId/republish`, async ({ params }) => {
    await delay(DELAY_MS)
    const jobIndex = mockJobs.findIndex((j) => j.id === params.jobId)
    if (jobIndex === -1) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }
    if (mockJobs[jobIndex]!.status !== JobStatus.UNPUBLISHED) {
      return HttpResponse.json({ message: 'Only unpublished jobs can be republished' }, { status: 400 })
    }
    mockJobs[jobIndex] = { ...mockJobs[jobIndex]!, status: JobStatus.APPROVED }
    return HttpResponse.json(mockJobs[jobIndex])
  }),

  // Get job detail
  http.get(`${API_URL}/company/jobs/:jobId`, async ({ params }) => {
    await delay(DELAY_MS)
    const job = mockJobs.find((j) => j.id === params.jobId)
    if (!job) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }
    return HttpResponse.json(job)
  }),

  // Update job
  http.patch(`${API_URL}/company/jobs/:jobId`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as Partial<JobPosting>
    const jobIndex = mockJobs.findIndex((j) => j.id === params.jobId)
    if (jobIndex === -1) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    mockJobs[jobIndex] = { ...mockJobs[jobIndex], ...body } as JobPosting
    return HttpResponse.json(mockJobs[jobIndex])
  }),

  // Get job applications
  http.get(`${API_URL}/company/jobs/:jobId/applications`, async ({ params }) => {
    await delay(DELAY_MS)
    const applications = mockApplications.filter((a) => a.jobPostingId === params.jobId)
    return HttpResponse.json({ applications })
  }),

  // Company all applications (only show admin-approved and progressed applications)
  http.get(`${API_URL}/company/applications`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.COMPANY) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const url = new URL(request.url)
    const status = (url.searchParams.get('status') || '').toLowerCase()
    const search = (url.searchParams.get('search') || '').toLowerCase()
    const location = (url.searchParams.get('location') || '').toLowerCase()
    const jobType = (url.searchParams.get('jobType') || '').toLowerCase()
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1)
    const limit = Math.max(parseInt(url.searchParams.get('limit') || '15', 10), 1)

    const companyJobs = mockJobs.filter((j) => j.companyId === user.id)
    const jobIds = companyJobs.map((j) => j.id)
    // Only return admin-approved applications and company pipeline statuses
    let applications = mockApplications.filter(
      (a) =>
        jobIds.includes(a.jobPostingId) &&
        [
          ApplicationStatus.REVIEWED,
          ApplicationStatus.INTERVIEW_SCHEDULED,
          ApplicationStatus.OFFER_EXTENDED,
          ApplicationStatus.HIRED,
          ApplicationStatus.REJECTED,
        ].includes(a.status)
    )

    if (status && status !== 'all') {
      applications = applications.filter((a) => String(a.status).toLowerCase() === status)
    }

    if (search) {
      applications = applications.filter((a) => {
        const studentName = a.student?.fullName?.toLowerCase() || ''
        const studentEmail = a.student?.email?.toLowerCase() || ''
        const jobTitle = a.jobPosting?.title?.toLowerCase() || ''
        return (
          studentName.includes(search) ||
          studentEmail.includes(search) ||
          jobTitle.includes(search)
        )
      })
    }

    if (location) {
      applications = applications.filter((a) => (a.jobPosting?.location || '').toLowerCase().includes(location))
    }

    if (jobType) {
      applications = applications.filter((a) => (a.jobPosting?.jobType || '').toLowerCase() === jobType)
    }

    const total = applications.length
    const totalPages = Math.max(Math.ceil(total / limit), 1)
    const start = (page - 1) * limit
    const paginated = applications.slice(start, start + limit)

    return HttpResponse.json({
      applications: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Update application status (reviewed/interview/offer/hire/reject)
  http.patch(`${API_URL}/company/applications/:appId`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as {
      status: ApplicationStatus
      interviewDate?: string
      interviewNotes?: string
      offerDetails?: string
      rejectionReason?: string | null
    }
    const appIndex = mockApplications.findIndex((a) => a.id === params.appId)
    if (appIndex === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 })
    }

    const app = mockApplications[appIndex]!
    app.status = body.status
    if (body.status === ApplicationStatus.INTERVIEW_SCHEDULED) {
      app.interviewDate = body.interviewDate || null
      app.interviewNotes = body.interviewNotes || null
    }
    if (body.status === ApplicationStatus.OFFER_EXTENDED) {
      app.offerDetails = body.offerDetails || null
    }
    if (body.status === ApplicationStatus.REJECTED) {
      app.rejectionReason = body.rejectionReason ?? null
    }

    const jobTitle = app.jobPosting?.title ?? 'a position'
    const companyName = app.jobPosting?.company?.name ?? 'a company'

    if (body.status === ApplicationStatus.INTERVIEW_SCHEDULED) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-interview`,
        recipientId: app.studentId,
        recipientType: 'student',
        type: 'application_status',
        title: 'Interview scheduled',
        message: `${companyName} scheduled an interview for ${jobTitle}.${app.interviewDate ? ` Date: ${new Date(app.interviewDate).toLocaleString()}` : ''}`,
        link: '/my-applications',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    if (body.status === ApplicationStatus.OFFER_EXTENDED) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-offer`,
        recipientId: app.studentId,
        recipientType: 'student',
        type: 'application_status',
        title: 'Offer extended',
        message: `${companyName} has extended an offer for ${jobTitle}.`,
        link: '/my-applications',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    if (body.status === ApplicationStatus.HIRED) {
      app.reviewedAt = new Date().toISOString()
      // Mark student as hired
      const studentIndex = mockStudents.findIndex((s) => s.id === app.studentId)
      if (studentIndex !== -1) {
        mockStudents[studentIndex]!.isHired = true
      }

      // ── Notify student: hired ──────────────────────────────────────────
      mockNotifications.unshift({
        id: `notif-${Date.now()}-hired`,
        recipientId: app.studentId,
        recipientType: 'student',
        type: 'application_status',
        title: 'Congratulations — you have been hired!',
        message: `${companyName} has selected you for the ${jobTitle} role. Check your applications for next steps.`,
        link: '/my-applications',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    if (body.status === ApplicationStatus.REJECTED) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-rejected`,
        recipientId: app.studentId,
        recipientType: 'student',
        type: 'application_status',
        title: 'Application update',
        message: `${companyName} has updated your application for ${jobTitle}.${app.rejectionReason ? ` Message: ${app.rejectionReason}` : ''}`,
        link: '/my-applications',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    return HttpResponse.json(app)
  }),

  // ============ STUDENT ============

  // Available subscription plans (public endpoint)
  http.get(`${API_URL}/services`, async () => {
    await delay(DELAY_MS)
    // Return active plans sorted by displayOrder
    const activePlans = mockSubscriptionPlans
      .filter((p) => p.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
    return HttpResponse.json({ plans: activePlans })
  }),

  http.get(`${API_URL}/geo-location`, async () => {
    await delay(DELAY_MS)
    return HttpResponse.json({
      countryCode: 'IN',
      currency: 'INR',
    })
  }),

  http.get(`${API_URL}/companies`, async ({ request }) => {
    await delay(DELAY_MS)
    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('active') === 'true'

    const companies = activeOnly
      ? mockCompanies.filter((company) => company.status === CompanyStatus.APPROVED)
      : mockCompanies

    return HttpResponse.json({ companies })
  }),

  // Student subscription details
  http.get(`${API_URL}/student/subscription`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    return HttpResponse.json(buildStudentSubscriptionResponse(user.id))
  }),

  // Upgrade student subscription
  http.post(`${API_URL}/student/subscription`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as { planId?: string; serviceId?: string }
    const planIdentifier = body.planId || body.serviceId
    if (!planIdentifier) {
      return HttpResponse.json({ message: 'planId or serviceId is required' }, { status: 400 })
    }

    // Find plan by either id or _id for backwards compatibility
    const plan = findSubscriptionPlan(planIdentifier)
    if (!plan) {
      return HttpResponse.json({ message: 'Plan not found' }, { status: 404 })
    }

    mockStudentSubscriptions[user.id] = {
      subscriptionTier: plan.tier === 'free' ? 'free' : 'paid',
      serviceId: plan.tier === 'free' ? undefined : plan.id,
      endDate: plan.tier === 'free' ? undefined : calculateSubscriptionEndDate(plan.billingCycle),
    }

    return HttpResponse.json({ success: true })
  }),

  // Student dashboard
  http.get(`${API_URL}/student/dashboard`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const student = user.data as Student
    const studentApps = mockApplications.filter(
      (a) => a.studentId === user.id && a.status !== ApplicationStatus.WITHDRAWN
    )

    const currentSubscription = mockStudentSubscriptions[user.id]

    // Get application limit from subscription plan
    let applicationLimit: number | null = 2 // Default free tier limit
    if (currentSubscription?.serviceId) {
      const plan = mockSubscriptionPlans.find(
        (p) => p.id === currentSubscription.serviceId || p._id === currentSubscription.serviceId
      )
      if (plan) {
        applicationLimit = plan.maxApplications
      }
    } else {
      // No subscription, use free tier defaults
      const freePlan = mockSubscriptionPlans.find((p) => p.tier === 'free')
      if (freePlan) {
        applicationLimit = freePlan.maxApplications
      }
    }

    return HttpResponse.json({
      applicationsUsed: studentApps.length,
      applicationLimit,
      pendingApplications: studentApps.filter((a) => a.status === ApplicationStatus.PENDING).length,
      isHired: student.isHired,
    })
  }),

  // Search jobs (student)
  http.get(`${API_URL}/student/jobs`, async ({ request }) => {
    await delay(DELAY_MS)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const location = url.searchParams.get('location')?.toLowerCase()

    let jobs = mockJobs.filter((j) => j.status === JobStatus.APPROVED)

    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.description.toLowerCase().includes(search)
      )
    }

    if (location) {
      jobs = jobs.filter((j) => j.location.toLowerCase().includes(location))
    }

    return HttpResponse.json({ jobs })
  }),

  // Get job detail (student)
  http.get(`${API_URL}/student/jobs/:jobId`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    const job = mockJobs.find((j) => j.id === params.jobId)
    if (!job) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    const hasApplied = user
      ? mockApplications.some(
          (a) =>
            a.jobPostingId === params.jobId &&
            a.studentId === user.id &&
            a.status !== ApplicationStatus.WITHDRAWN
        )
      : false

    const application = user
      ? mockApplications.find(
          (a) => a.jobPostingId === params.jobId && a.studentId === user.id
        )
      : null

    return HttpResponse.json({
      ...job,
      hasApplied,
      applicationStatus: application?.status,
    })
  }),

  // Apply to job
  http.post(`${API_URL}/student/jobs/:jobId/apply`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const student = user.data as Student
    if (student.isHired) {
      return HttpResponse.json({ message: 'You are already hired' }, { status: 400 })
    }

    const activeApps = mockApplications.filter(
      (a) => a.studentId === user.id && a.status !== ApplicationStatus.WITHDRAWN
    )

    const currentSubscription = mockStudentSubscriptions[user.id]
    const isPaidTier = currentSubscription?.subscriptionTier === 'paid'
    if (!isPaidTier && activeApps.length >= 2) {
      return HttpResponse.json({ message: 'Application limit reached (2)' }, { status: 400 })
    }

    const job = mockJobs.find((j) => j.id === params.jobId)
    if (!job) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      studentId: user.id,
      jobPostingId: params.jobId as string,
      status: ApplicationStatus.PENDING,
      createdAt: new Date().toISOString(),
      student: student,
      jobPosting: job,
    }

    mockApplications.push(newApp)

    // ── Generate notifications ─────────────────────────────────────────────
    const now = new Date().toISOString()

    // Notify admin: new application pending review
    mockNotifications.unshift({
      id: `notif-${Date.now()}-admin`,
      recipientId: 'admin-1',
      recipientType: 'admin',
      type: 'new_application',
      title: 'New application pending review',
      message: `${student.fullName} applied for ${job.title}. Review and approve to make it visible to the company.`,
      link: '/applications',
      isRead: false,
      createdAt: now,
    })

    // Notify student: application submitted confirmation
    mockNotifications.unshift({
      id: `notif-${Date.now()}-student`,
      recipientId: user.id,
      recipientType: 'student',
      type: 'application_status',
      title: 'Application submitted',
      message: `Your application for ${job.title} has been submitted successfully and is pending review.`,
      link: '/my-applications',
      isRead: false,
      createdAt: now,
    })

    return HttpResponse.json(newApp)
  }),

  // Get student applications
  http.get(`${API_URL}/student/applications`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const mapStudentFacingStatus = (application: Application): {
      studentFacingStatus: string
      statusMessage: string
    } => {
      const normalizedStatus = String(application.status).toUpperCase()

      switch (normalizedStatus) {
        case 'PENDING':
          return {
            studentFacingStatus: 'Shortlisted',
            statusMessage: "Your application is shortlisted. We'll notify you of any updates.",
          }
        case 'REVIEWED':
          return {
            studentFacingStatus: 'Shortlisted',
            statusMessage: "Your application is shortlisted. We'll notify you of any updates.",
          }
        case 'INTERVIEW_SCHEDULED':
          return {
            studentFacingStatus: 'Interview Scheduled',
            statusMessage: application.interviewDate
              ? `Great news! Your interview is scheduled for ${new Date(application.interviewDate).toLocaleString()}.`
              : 'Great news! Check your email for interview details.',
          }
        case 'OFFER_EXTENDED':
          return {
            studentFacingStatus: 'Offer Extended',
            statusMessage: 'Exciting update! You have received an offer. Review the next steps carefully.',
          }
        case 'HIRED':
          return {
            studentFacingStatus: 'Hired! Congratulations!',
            statusMessage: "Amazing news — you've been selected for this role.",
          }
        case 'REJECTED':
          return application.rejectionReason
            ? {
                studentFacingStatus: 'Application Closed',
                statusMessage: `This application has been closed. Message from company: ${application.rejectionReason}`,
              }
            : {
                studentFacingStatus: 'Position Filled',
                statusMessage: 'This position has been filled. Keep applying!',
              }
        case 'WITHDRAWN':
          return {
            studentFacingStatus: 'Withdrawn',
            statusMessage: 'You withdrew this application.',
          }
        case 'WITHDRAWAL_REQUESTED':
          return {
            studentFacingStatus: 'Withdrawal Requested',
            statusMessage: 'Your withdrawal request has been submitted and is awaiting admin approval.',
          }
        default:
          return {
            studentFacingStatus: 'Shortlisted',
            statusMessage: "Your application is shortlisted. We'll notify you of any updates.",
          }
      }
    }

    const applications = mockApplications
      .filter((a) => a.studentId === user.id)
      .map((application) => {
        const studentFacing = mapStudentFacingStatus(application)
        return {
          ...application,
          studentFacingStatus: studentFacing.studentFacingStatus,
          statusMessage: studentFacing.statusMessage,
          rejectionReason: undefined,
        }
      })

    return HttpResponse.json({ applications })
  }),

  // Withdraw application (student only, PENDING or REVIEWED)
  http.patch(`${API_URL}/student/applications/:appId/withdraw`, async ({ params }) => {
    await delay(DELAY_MS)

    // Student-only guard
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Forbidden: students only' }, { status: 403 })
    }

    const appIndex = mockApplications.findIndex((a) => a.id === params.appId)
    if (appIndex === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 })
    }

    const app = mockApplications[appIndex]!

    // Only allow withdrawal for PENDING or REVIEWED
    if (
      app.status !== ApplicationStatus.PENDING &&
      app.status !== ApplicationStatus.REVIEWED
    ) {
      return HttpResponse.json(
        { message: 'Withdrawal is only allowed for applications with status PENDING or REVIEWED' },
        { status: 422 }
      )
    }

    app.status = ApplicationStatus.WITHDRAWN
    return HttpResponse.json(app)
  }),

  // Get student profile
  http.get(`${API_URL}/student/profile`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const student = user.data as Student
    return HttpResponse.json({
      fullName: student.fullName,
      email: student.email,
      profileLink: student.profileLink || '',
    })
  }),

  // Update student profile
  http.patch(`${API_URL}/student/profile`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as Partial<Student>
    const studentIndex = mockStudents.findIndex((s) => s.id === user.id)
    if (studentIndex !== -1) {
      const existing = mockStudents[studentIndex]!
      mockStudents[studentIndex] = { ...existing, ...body } as Student
      user.data = mockStudents[studentIndex]!
    }

    return HttpResponse.json({ success: true })
  }),

  http.get(`${API_URL}/student/profile/completeness`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const studentRecord = mockStudents.find((student) => student.id === user.id) || (user.data as Student)
    const completeness = calculateStudentCompleteness(studentRecord)
    return HttpResponse.json(completeness)
  }),

  http.post(`${API_URL}/student/profile/resume`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    await request.formData()
    const resumeUrl = `https://cdn.aquatalent.local/resumes/${user.id}-${Date.now()}.pdf`
    const updated = updateStudentRecord(user.id, { resumeUrl })
    if (updated) {
      user.data = updated
    }

    return HttpResponse.json({ resumeUrl })
  }),

  http.post(`${API_URL}/student/profile/video`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    await request.formData()
    const introVideoUrl = `https://cdn.aquatalent.local/videos/${user.id}-${Date.now()}.mp4`
    const updated = updateStudentRecord(user.id, { introVideoUrl })
    if (updated) {
      user.data = updated
    }

    return HttpResponse.json({ introVideoUrl })
  }),

  // ============ NOTIFICATIONS ============

  http.get(`${API_URL}/notifications`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const recipientId = user.userType === UserType.ADMIN ? 'admin-1' : user.id
    const userNotifs = mockNotifications
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = userNotifs.length
    const start = (page - 1) * limit
    const notifications = userNotifs.slice(start, start + limit)

    return HttpResponse.json({ notifications, total, page, limit })
  }),

  http.get(`${API_URL}/notifications/unread-count`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user) {
      return HttpResponse.json({ count: 0 })
    }

    const recipientId = user.userType === UserType.ADMIN ? 'admin-1' : user.id
    const count = mockNotifications.filter((n) => n.recipientId === recipientId && !n.isRead).length
    return HttpResponse.json({ count })
  }),

  http.patch(`${API_URL}/notifications/:notifId/read`, async ({ params }) => {
    await delay(DELAY_MS)
    const notif = mockNotifications.find((n) => n.id === params.notifId)
    if (notif) {
      notif.isRead = true
    }
    return HttpResponse.json({ success: true })
  }),

  http.patch(`${API_URL}/notifications/read-all`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const recipientId = user.userType === UserType.ADMIN ? 'admin-1' : user.id
    mockNotifications
      .filter((n) => n.recipientId === recipientId)
      .forEach((n) => {
        n.isRead = true
      })
    return HttpResponse.json({ success: true })
  }),

  // ============ ADMIN ============

  // Admin dashboard
  http.get(`${API_URL}/admin/dashboard`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    return HttpResponse.json({
      pendingCompanies: mockCompanies.filter((c) => c.status === CompanyStatus.PENDING).length,
      totalCompanies: mockCompanies.length,
      pendingJobs: mockJobs.filter((j) => j.status === JobStatus.PENDING).length,
      activeJobs: mockJobs.filter((j) => j.status === JobStatus.APPROVED).length,
      totalJobs: mockJobs.length,
      totalStudents: mockStudents.length,
      totalApplications: mockApplications.length,
      totalHires: mockApplications.filter((a) => a.status === ApplicationStatus.HIRED).length,
    })
  }),

  // Admin companies
  http.get(`${API_URL}/admin/companies`, async ({ request }) => {
    await delay(DELAY_MS)
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as CompanyStatus | null

    let companies = mockCompanies
    if (status) {
      companies = companies.filter((c) => c.status === status)
    }

    return HttpResponse.json({ companies })
  }),

  // Admin single company profile
  http.get(`${API_URL}/admin/companies/:companyId/profile`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const company = mockCompanies.find((c) => c.id === params.companyId)
    if (!company) {
      return HttpResponse.json({ message: 'Company not found' }, { status: 404 })
    }

    return HttpResponse.json(company)
  }),

  // Update company status
  http.patch(`${API_URL}/admin/companies/:companyId`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as Partial<Company> & {
      status?: CompanyStatus
      rejectionReason?: string | null
    }
    const companyIndex = mockCompanies.findIndex((c) => c.id === params.companyId)
    if (companyIndex === -1) {
      return HttpResponse.json({ message: 'Company not found' }, { status: 404 })
    }

    const company = mockCompanies[companyIndex]!
    if (body.status) {
      company.status = body.status
      if (body.status === CompanyStatus.APPROVED) {
        company.approvedAt = new Date().toISOString()
        company.rejectionReason = undefined
      }
    }

    if ('rejectionReason' in body) {
      if (body.rejectionReason) {
        company.rejectionReason = body.rejectionReason
      } else {
        delete company.rejectionReason
      }
    }

    // ── Notify company: status change ──────────────────────────────────────
    if (body.status === CompanyStatus.APPROVED) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-company-approved`,
        recipientId: company.id,
        recipientType: 'company',
        type: 'COMPANY_REGISTRATION_APPROVED',
        title: 'Company profile approved',
        message: 'Your company profile has been approved. You can now post jobs.',
        link: '/company/dashboard',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    } else if (body.status === CompanyStatus.REJECTED) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-company-rejected`,
        recipientId: company.id,
        recipientType: 'company',
        type: 'COMPANY_REGISTRATION_REJECTED',
        title: 'Company profile not approved',
        message: `Your company profile was not approved.${body.rejectionReason ? ' Reason: ' + body.rejectionReason : ''}`,
        link: '/company/profile',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    return HttpResponse.json(company)
  }),

  // Update company profile details
  http.patch(`${API_URL}/admin/companies/:companyId/profile`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as Partial<Company>
    const companyIndex = mockCompanies.findIndex((c) => c.id === params.companyId)
    if (companyIndex === -1) {
      return HttpResponse.json({ message: 'Company not found' }, { status: 404 })
    }

    const company = mockCompanies[companyIndex]!

    if ('description' in body) {
      company.description = body.description ?? null
    }
    if ('website' in body) {
      company.website = body.website ?? null
    }
    if ('industry' in body) {
      company.industry = body.industry ?? null
    }
    if ('size' in body) {
      company.size = body.size ?? null
    }
    if ('foundedYear' in body) {
      company.foundedYear = body.foundedYear ?? null
    }

    if ('socialLinks' in body) {
      const nextLinks = body.socialLinks || {}
      company.socialLinks = {
        linkedin: nextLinks.linkedin ?? null,
        twitter: nextLinks.twitter ?? null,
      }
    }

    return HttpResponse.json(company)
  }),

  // Admin jobs
  http.get(`${API_URL}/admin/jobs`, async ({ request }) => {
    await delay(DELAY_MS)
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as JobStatus | null

    let jobs = mockJobs
    if (status) {
      jobs = jobs.filter((j) => j.status === status)
    }

    return HttpResponse.json({ jobs })
  }),

  // Update job status
  http.patch(`${API_URL}/admin/jobs/:jobId`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as { status: JobStatus; rejectionReason?: string }
    const jobIndex = mockJobs.findIndex((j) => j.id === params.jobId)
    if (jobIndex === -1) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 })
    }

    const job = mockJobs[jobIndex]!
    job.status = body.status
    if (body.status === JobStatus.APPROVED) {
      job.approvedAt = new Date().toISOString()
    }
    if (body.rejectionReason) {
      job.rejectionReason = body.rejectionReason
    }

    // ── Notify company: job status change ──────────────────────────────────
    const companyId = job.companyId
    if (body.status === JobStatus.APPROVED) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-job-approved`,
        recipientId: companyId,
        recipientType: 'company',
        type: 'company_status',
        title: 'Job posting approved',
        message: `Your job posting "${job.title}" has been approved and is now visible to students.`,
        link: '/jobs',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    } else if (body.status === JobStatus.REJECTED) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-job-rejected`,
        recipientId: companyId,
        recipientType: 'company',
        type: 'company_status',
        title: 'Job posting not approved',
        message: `Your job posting "${job.title}" was not approved.${body.rejectionReason ? ' Reason: ' + body.rejectionReason : ''}`,
        link: '/jobs',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    }

    return HttpResponse.json(job)
  }),

  // Admin applications
  http.get(`${API_URL}/admin/applications`, async ({ request }) => {
    await delay(DELAY_MS)
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as ApplicationStatus | null

    let applications = mockApplications
    if (status) {
      applications = applications.filter((a) => a.status === status)
    }

    return HttpResponse.json({ applications })
  }),

  // Admin approve/reject application
  http.patch(`${API_URL}/admin/applications/:appId`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as { status: ApplicationStatus; rejectionReason?: string }
    const appIndex = mockApplications.findIndex((a) => a.id === params.appId)
    if (appIndex === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 })
    }

    const app = mockApplications[appIndex]!
    app.status = body.status
    app.reviewedAt = new Date().toISOString()

    if (body.rejectionReason) {
      app.rejectionReason = body.rejectionReason
    }

    // ── Generate notifications ─────────────────────────────────────────────
    const now = new Date().toISOString()
    const jobTitle = app.jobPosting?.title ?? 'a job'

    if (body.status === ApplicationStatus.REVIEWED) {
      // Notify company: new application available for review
      const companyId = app.jobPosting?.companyId
      if (companyId) {
        mockNotifications.unshift({
          id: `notif-${Date.now()}-company`,
          recipientId: companyId,
          recipientType: 'company',
          type: 'new_application',
          title: 'New application received',
          message: `${app.student?.fullName ?? 'A student'} applied for ${jobTitle}. Review their profile now.`,
          link: '/applications',
          isRead: false,
          createdAt: now,
        })
      }

      // Notify student: application approved by admin
      mockNotifications.unshift({
        id: `notif-${Date.now()}-student`,
        recipientId: app.studentId,
        recipientType: 'student',
        type: 'application_status',
        title: 'Application reviewed',
        message: `Your application for ${jobTitle} has been reviewed and approved.`,
        link: '/my-applications',
        isRead: false,
        createdAt: now,
      })
    } else if (body.status === ApplicationStatus.REJECTED) {
      // Notify student: application rejected
      mockNotifications.unshift({
        id: `notif-${Date.now()}-student-rej`,
        recipientId: app.studentId,
        recipientType: 'student',
        type: 'application_status',
        title: 'Application not approved',
        message: `Your application for ${jobTitle} was not approved.${body.rejectionReason ? ' Reason: ' + body.rejectionReason : ''}`,
        link: '/my-applications',
        isRead: false,
        createdAt: now,
      })
    }

    return HttpResponse.json(app)
  }),

  // Admin approve withdrawal request
  http.patch(`${API_URL}/admin/applications/:appId/withdraw-approve`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const appIndex = mockApplications.findIndex((a) => a.id === params.appId)
    if (appIndex === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 })
    }

    const app = mockApplications[appIndex]!
    app.status = ApplicationStatus.WITHDRAWN

    // Notify student
    mockNotifications.unshift({
      id: `notif-${Date.now()}-withdraw-approved`,
      recipientId: app.studentId,
      recipientType: 'student',
      type: 'application_status',
      title: 'Withdrawal approved',
      message: `Your withdrawal request for ${app.jobPosting?.title ?? 'a job'} has been approved.`,
      link: '/my-applications',
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json(app)
  }),

  // Admin reject withdrawal request (application reverts to shortlisted)
  http.patch(`${API_URL}/admin/applications/:appId/withdraw-reject`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const appIndex = mockApplications.findIndex((a) => a.id === params.appId)
    if (appIndex === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 })
    }

    const app = mockApplications[appIndex]!
    app.status = ApplicationStatus.REVIEWED

    // Notify student
    mockNotifications.unshift({
      id: `notif-${Date.now()}-withdraw-rejected`,
      recipientId: app.studentId,
      recipientType: 'student',
      type: 'application_status',
      title: 'Withdrawal request declined',
      message: `Your withdrawal request for ${app.jobPosting?.title ?? 'a job'} was not approved. Your application remains active.`,
      link: '/my-applications',
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json(app)
  }),

  // Admin students - List with filtering
  http.get(`${API_URL}/admin/students`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const url = new URL(request.url)
    const subscriptionTier = url.searchParams.get('subscriptionTier') as 'free' | 'paid' | null
    const hasActiveApplications = url.searchParams.get('hasActiveApplications')
    const isHired = url.searchParams.get('isHired')
    const hasResume = url.searchParams.get('hasResume')
    const hasVideo = url.searchParams.get('hasVideo')
    const search = url.searchParams.get('search')?.toLowerCase()
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)

    let students = mockStudents.map((s) => {
      const subscription = mockStudentSubscriptions[s.id]
      const studentApps = mockApplications.filter(
        (a) => a.studentId === s.id && a.status !== ApplicationStatus.WITHDRAWN
      )
      const activeApps = studentApps.filter(
        (a) => a.status === ApplicationStatus.PENDING || a.status === ApplicationStatus.REVIEWED
      )

      return {
        id: s.id,
        fullName: s.fullName,
        email: s.email,
        subscriptionTier: subscription?.subscriptionTier || 'free',
        isHired: s.isHired,
        hasResume: Boolean(s.resumeUrl),
        hasVideo: Boolean(s.introVideoUrl),
        totalApplications: studentApps.length,
        activeApplications: activeApps.length,
        createdAt: s.createdAt,
      }
    })

    // Apply filters
    if (subscriptionTier) {
      students = students.filter((s) => s.subscriptionTier === subscriptionTier)
    }
    if (hasActiveApplications === 'true') {
      students = students.filter((s) => s.activeApplications > 0)
    } else if (hasActiveApplications === 'false') {
      students = students.filter((s) => s.activeApplications === 0)
    }
    if (isHired === 'true') {
      students = students.filter((s) => s.isHired)
    } else if (isHired === 'false') {
      students = students.filter((s) => !s.isHired)
    }
    if (hasResume === 'true') {
      students = students.filter((s) => s.hasResume)
    } else if (hasResume === 'false') {
      students = students.filter((s) => !s.hasResume)
    }
    if (hasVideo === 'true') {
      students = students.filter((s) => s.hasVideo)
    } else if (hasVideo === 'false') {
      students = students.filter((s) => !s.hasVideo)
    }
    if (search) {
      students = students.filter(
        (s) => s.fullName.toLowerCase().includes(search) || s.email.toLowerCase().includes(search)
      )
    }

    const total = students.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paginatedStudents = students.slice(start, start + limit)

    return HttpResponse.json({
      students: paginatedStudents,
      pagination: { page, limit, total, totalPages },
    })
  }),

  // Admin student detail
  http.get(`${API_URL}/admin/students/:studentId`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const student = mockStudents.find((s) => s.id === params.studentId)
    if (!student) {
      return HttpResponse.json({ message: 'Student not found' }, { status: 404 })
    }

    const subscription = mockStudentSubscriptions[student.id]
    const plan = subscription?.serviceId
      ? mockSubscriptionPlans.find((p) => p.id === subscription.serviceId || p._id === subscription.serviceId)
      : null

    const studentApps = mockApplications.filter((a) => a.studentId === student.id)

    // Mock payment history
    const payments = subscription?.subscriptionTier === 'paid' && plan
      ? [
          {
            id: `pay-${student.id}-1`,
            amount: plan.price,
            currency: plan.currency,
            status: 'completed' as const,
            paymentDate: subscription.endDate
              ? new Date(new Date(subscription.endDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
              : new Date().toISOString(),
            paymentMethod: 'Razorpay',
            transactionId: `txn_${Date.now()}`,
            plan: { name: plan.name, price: plan.price },
          },
        ]
      : []

    return HttpResponse.json({
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      profileLink: student.profileLink,
      bio: student.bio,
      location: student.location,
      availableFrom: student.availableFrom,
      skills: student.skills || [],
      education: student.education || [],
      experience: student.experience || [],
      resumeUrl: student.resumeUrl,
      introVideoUrl: student.introVideoUrl,
      isHired: student.isHired,
      createdAt: student.createdAt,

      subscription: {
        tier: subscription?.subscriptionTier || 'free',
        current: subscription?.subscriptionTier === 'paid' && plan
          ? {
              id: `sub-${student.id}`,
              status: 'active' as const,
              startDate: subscription.endDate
                ? new Date(new Date(subscription.endDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date().toISOString(),
              endDate: subscription.endDate || new Date(2099, 11, 31).toISOString(),
              autoRenew: plan.billingCycle !== 'one-time',
              plan: {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price: plan.price,
                billingCycle: plan.billingCycle,
                features: plan.features,
              },
            }
          : null,
      },

      payments,

      applications: studentApps.map((a) => ({
        id: a.id,
        status: a.status,
        createdAt: a.createdAt,
        reviewedAt: a.reviewedAt,
        rejectionReason: a.rejectionReason,
        job: a.jobPosting
          ? {
              id: a.jobPosting.id,
              title: a.jobPosting.title,
              location: a.jobPosting.location,
              jobType: a.jobPosting.jobType,
              salaryRange: a.jobPosting.salaryRange,
              status: a.jobPosting.status,
              company: a.jobPosting.company,
            }
          : null,
      })),
    })
  }),

  // Admin assign subscription to student
  http.patch(`${API_URL}/admin/students/:studentId/subscription`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const student = mockStudents.find((s) => s.id === params.studentId)
    if (!student) {
      return HttpResponse.json({ message: 'Student not found' }, { status: 404 })
    }

    const body = (await request.json()) as {
      serviceId: string
      endDate?: string
      autoRenew?: boolean
    }

    if (!body.serviceId) {
      return HttpResponse.json({ message: 'serviceId is required' }, { status: 400 })
    }

    const plan = mockSubscriptionPlans.find((p) => p.id === body.serviceId || p._id === body.serviceId)
    if (!plan) {
      return HttpResponse.json({ message: 'Plan not found' }, { status: 404 })
    }

    // Calculate end date
    let endDate: string
    if (body.endDate) {
      endDate = body.endDate
    } else if (plan.billingCycle === 'one-time') {
      endDate = new Date(2099, 11, 31).toISOString()
    } else {
      const end = new Date()
      switch (plan.billingCycle) {
        case 'yearly':
          end.setFullYear(end.getFullYear() + 1)
          break
        case 'quarterly':
          end.setMonth(end.getMonth() + 3)
          break
        default:
          end.setMonth(end.getMonth() + 1)
      }
      endDate = end.toISOString()
    }

    // Update subscription
    mockStudentSubscriptions[student.id] = {
      subscriptionTier: plan.tier === 'free' ? 'free' : 'paid',
      serviceId: plan.id,
      endDate,
    }

    return HttpResponse.json({
      success: true,
      message: `Successfully assigned ${plan.name} plan to ${student.fullName}`,
      subscription: {
        id: `sub-${student.id}`,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate,
        autoRenew: body.autoRenew ?? (plan.billingCycle !== 'one-time'),
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          billingCycle: plan.billingCycle,
          tier: plan.tier,
        },
      },
    })
  }),

  // Admin subscription plans - List all
  http.get(`${API_URL}/admin/subscription-plans`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    // Return all plans (including inactive) sorted by displayOrder
    const plans = [...mockSubscriptionPlans]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((plan) => withPricingAliases(plan))
    return HttpResponse.json({ plans })
  }),

  // Admin subscription plans - Get single
  http.get(`${API_URL}/admin/subscription-plans/:planId`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const plan = mockSubscriptionPlans.find((p) => p.id === params.planId)
    if (!plan) {
      return HttpResponse.json({ message: 'Plan not found' }, { status: 404 })
    }

    return HttpResponse.json(withPricingAliases(plan))
  }),

  // Admin subscription plans - Create
  http.post(`${API_URL}/admin/subscription-plans`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as Omit<
      (typeof mockSubscriptionPlans)[0],
      'id' | '_id' | 'createdAt' | 'updatedAt'
    >

    const now = new Date().toISOString()
    const nonIndianPrice = getNormalizedNonIndianPrice(body)
    const newPlan = {
      ...body,
      indianPrice: getNormalizedIndianPrice(body),
      nonIndianPrice,
      internationalPrice: body.internationalPrice ?? nonIndianPrice,
      id: `plan-${Date.now()}`,
      _id: `plan-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }

    mockSubscriptionPlans.push(newPlan)
    return HttpResponse.json(withPricingAliases(newPlan), { status: 201 })
  }),

  // Admin subscription plans - Update
  http.patch(`${API_URL}/admin/subscription-plans/:planId`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const planIndex = mockSubscriptionPlans.findIndex((p) => p.id === params.planId)
    if (planIndex === -1) {
      return HttpResponse.json({ message: 'Plan not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<(typeof mockSubscriptionPlans)[0]>
    const plan = mockSubscriptionPlans[planIndex]!

    // Update allowed fields
    if (body.name !== undefined) plan.name = body.name
    if (body.tier !== undefined) plan.tier = body.tier
    if (body.description !== undefined) plan.description = body.description
    if (body.maxApplications !== undefined) plan.maxApplications = body.maxApplications
    if (body.price !== undefined) plan.price = body.price
    if (body.indianPrice !== undefined) plan.indianPrice = body.indianPrice
    if (body.nonIndianPrice !== undefined) plan.nonIndianPrice = body.nonIndianPrice
    if (body.internationalPrice !== undefined) plan.internationalPrice = body.internationalPrice
    if (body.currency !== undefined) plan.currency = body.currency
    if (body.billingCycle !== undefined) plan.billingCycle = body.billingCycle
    if (body.trialDays !== undefined) plan.trialDays = body.trialDays
    if (body.discount !== undefined) plan.discount = body.discount
    if (body.features !== undefined) plan.features = body.features
    if (body.badge !== undefined) plan.badge = body.badge
    if (body.displayOrder !== undefined) plan.displayOrder = body.displayOrder
    if (body.resumeDownloadsPerMonth !== undefined) plan.resumeDownloadsPerMonth = body.resumeDownloadsPerMonth
    if (body.videoViewsPerMonth !== undefined) plan.videoViewsPerMonth = body.videoViewsPerMonth
    if (body.prioritySupport !== undefined) plan.prioritySupport = body.prioritySupport
    if (body.profileBoost !== undefined) plan.profileBoost = body.profileBoost
    if (body.applicationHighlight !== undefined) plan.applicationHighlight = body.applicationHighlight
    if (body.isActive !== undefined) plan.isActive = body.isActive
    plan.indianPrice = getNormalizedIndianPrice(plan)
    plan.nonIndianPrice = getNormalizedNonIndianPrice(plan)
    plan.internationalPrice = plan.internationalPrice ?? plan.nonIndianPrice
    plan.updatedAt = new Date().toISOString()

    return HttpResponse.json(withPricingAliases(plan))
  }),

  // Admin subscription plans - Delete (soft delete by deactivating)
  http.delete(`${API_URL}/admin/subscription-plans/:planId`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const planIndex = mockSubscriptionPlans.findIndex((p) => p.id === params.planId)
    if (planIndex === -1) {
      return HttpResponse.json({ message: 'Plan not found' }, { status: 404 })
    }

    // Soft delete by deactivating
    mockSubscriptionPlans[planIndex]!.isActive = false
    mockSubscriptionPlans[planIndex]!.updatedAt = new Date().toISOString()

    return HttpResponse.json({ success: true })
  }),

  // Admin free tier configuration - Get
  http.get(`${API_URL}/admin/config/free-tier`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    return HttpResponse.json(mockFreeTierConfig)
  }),

  // Admin free tier configuration - Update
  http.patch(`${API_URL}/admin/config/free-tier`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.ADMIN) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as Partial<typeof mockFreeTierConfig>

    if (body.free_tier_max_applications !== undefined) {
      mockFreeTierConfig.free_tier_max_applications = body.free_tier_max_applications
    }
    if (body.free_tier_features !== undefined) {
      mockFreeTierConfig.free_tier_features = body.free_tier_features
    }
    if (body.free_tier_resume_downloads !== undefined) {
      mockFreeTierConfig.free_tier_resume_downloads = body.free_tier_resume_downloads
    }
    if (body.free_tier_video_views !== undefined) {
      mockFreeTierConfig.free_tier_video_views = body.free_tier_video_views
    }

    return HttpResponse.json(mockFreeTierConfig)
  }),

  // ============ PUBLIC ============

  // Public job listings (approved jobs only)
  http.get(`${API_URL}/jobs`, async ({ request }) => {
    await delay(DELAY_MS)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const location = url.searchParams.get('location')?.toLowerCase()
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    // Only return approved jobs
    let jobs = mockJobs.filter((j) => j.status === JobStatus.APPROVED)

    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.description.toLowerCase().includes(search) ||
          j.company?.name?.toLowerCase().includes(search)
      )
    }

    if (location) {
      jobs = jobs.filter((j) => j.location.toLowerCase().includes(location))
    }

    const total = jobs.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paginatedJobs = jobs.slice(start, start + limit)

    return HttpResponse.json({
      jobs: paginatedJobs,
      total,
      page,
      totalPages,
    })
  }),

  // Public job detail
  http.get(`${API_URL}/jobs/:jobId`, async ({ params }) => {
    await delay(DELAY_MS)
    const job = mockJobs.find((j) => j.id === params.jobId && j.status === JobStatus.APPROVED)
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    return HttpResponse.json(job)
  }),

  // Check if user has applied to a job
  http.get(`${API_URL}/jobs/:jobId/application-status`, async ({ params }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ hasApplied: false })
    }

    const hasApplied = mockApplications.some(
      (a) =>
        a.jobPostingId === params.jobId &&
        a.studentId === user.id &&
        a.status !== ApplicationStatus.WITHDRAWN
    )

    return HttpResponse.json({ hasApplied })
  }),
]
