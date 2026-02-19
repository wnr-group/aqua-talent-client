import { http, HttpResponse, delay } from 'msw'
import {
  mockCompanies,
  mockStudents,
  mockJobs,
  mockApplications,
  mockServices,
  mockStudentSubscriptions,
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
      type: 'company_status',
      title: 'New company registration',
      message: `${newCompany.name} has registered and is pending approval.`,
      link: '/companies',
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({ success: true, message: 'Registration submitted' })
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
        type: 'new_application',
        title: 'New job posting pending review',
        message: `${company.name} submitted a new job posting: ${newJob.title}.`,
        link: '/jobs',
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
    mockJobs[jobIndex] = { ...mockJobs[jobIndex]!, status: JobStatus.PENDING }
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

  // Company all applications (only show admin-approved applications per FR-004)
  http.get(`${API_URL}/company/applications`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.COMPANY) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const companyJobs = mockJobs.filter((j) => j.companyId === user.id)
    const jobIds = companyJobs.map((j) => j.id)
    // Only return admin-approved applications (REVIEWED, HIRED, REJECTED by company)
    const applications = mockApplications.filter(
      (a) =>
        jobIds.includes(a.jobPostingId) &&
        [ApplicationStatus.REVIEWED, ApplicationStatus.HIRED, ApplicationStatus.REJECTED].includes(a.status)
    )
    return HttpResponse.json({ applications })
  }),

  // Update application (hire/reject)
  http.patch(`${API_URL}/company/applications/:appId`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as { status: ApplicationStatus }
    const appIndex = mockApplications.findIndex((a) => a.id === params.appId)
    if (appIndex === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 })
    }

    const app = mockApplications[appIndex]!
    app.status = body.status
    if (body.status === ApplicationStatus.HIRED) {
      app.reviewedAt = new Date().toISOString()
      // Mark student as hired
      const studentIndex = mockStudents.findIndex((s) => s.id === app.studentId)
      if (studentIndex !== -1) {
        mockStudents[studentIndex]!.isHired = true
      }

      // ── Notify student: hired ──────────────────────────────────────────
      const jobTitle = app.jobPosting?.title ?? 'a position'
      const companyName = app.jobPosting?.company?.name ?? 'a company'
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

    return HttpResponse.json(app)
  }),

  // ============ STUDENT ============

  // Available subscription services
  http.get(`${API_URL}/services`, async () => {
    await delay(DELAY_MS)
    return HttpResponse.json({ services: mockServices })
  }),

  // Student subscription details
  http.get(`${API_URL}/student/subscription`, async () => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const current = mockStudentSubscriptions[user.id] || { subscriptionTier: 'free' as const }

    if (current.subscriptionTier === 'paid' && current.serviceId && current.endDate) {
      const service = mockServices.find((item) => item._id === current.serviceId)

      return HttpResponse.json({
        subscriptionTier: 'paid',
        currentSubscription: {
          service: service ? { _id: service._id, name: service.name } : undefined,
          endDate: current.endDate,
        },
      })
    }

    return HttpResponse.json({
      subscriptionTier: 'free',
      currentSubscription: null,
    })
  }),

  // Upgrade student subscription
  http.post(`${API_URL}/student/subscription`, async ({ request }) => {
    await delay(DELAY_MS)
    const user = auth.getCurrentUser()
    if (!user || user.userType !== UserType.STUDENT) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as { serviceId?: string }
    if (!body.serviceId) {
      return HttpResponse.json({ message: 'serviceId is required' }, { status: 400 })
    }

    const service = mockServices.find((item) => item._id === body.serviceId)
    if (!service) {
      return HttpResponse.json({ message: 'Service not found' }, { status: 404 })
    }

    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    mockStudentSubscriptions[user.id] = {
      subscriptionTier: 'paid',
      serviceId: service._id,
      endDate: endDate.toISOString(),
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
    const isPaidTier = currentSubscription?.subscriptionTier === 'paid'
    const applicationLimit = isPaidTier ? null : 2

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

    const applications = mockApplications.filter((a) => a.studentId === user.id)
    return HttpResponse.json({ applications })
  }),

  // Withdraw application
  http.patch(`${API_URL}/student/applications/:appId/withdraw`, async ({ params }) => {
    await delay(DELAY_MS)
    const appIndex = mockApplications.findIndex((a) => a.id === params.appId)
    if (appIndex === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 })
    }

    mockApplications[appIndex]!.status = ApplicationStatus.WITHDRAWN
    return HttpResponse.json(mockApplications[appIndex])
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
        type: 'company_status',
        title: 'Company profile approved',
        message: 'Your company profile has been approved. You can now post jobs.',
        link: '/jobs',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    } else if (body.status === CompanyStatus.REJECTED) {
      mockNotifications.unshift({
        id: `notif-${Date.now()}-company-rejected`,
        recipientId: company.id,
        recipientType: 'company',
        type: 'company_status',
        title: 'Company profile not approved',
        message: `Your company profile was not approved.${body.rejectionReason ? ' Reason: ' + body.rejectionReason : ''}`,
        link: '/profile',
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
