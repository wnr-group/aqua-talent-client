import { http, HttpResponse, delay } from 'msw'
import {
  mockCompanies,
  mockStudents,
  mockJobs,
  mockApplications,
  auth,
  findUser,
} from './data'
import { UserType, CompanyStatus, JobStatus, ApplicationStatus } from '@/types/enums'
import { Company, Student, JobPosting, Application } from '@/types/entities'

const API_URL = 'http://localhost:3001/api'

// Simulate network delay
const DELAY_MS = 300

export const handlers = [
  // ============ AUTH ============

  // Login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as { username: string; password: string; userType: UserType }

    const user = findUser(body.username, body.password, body.userType)
    if (!user) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    auth.setCurrentUser(user)

    return HttpResponse.json({
      id: user.id,
      username: user.username,
      userType: user.userType,
      company: user.userType === UserType.COMPANY ? user.data : null,
      student: user.userType === UserType.STUDENT ? user.data : null,
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
      status: JobStatus.PENDING,
      createdAt: new Date().toISOString(),
      company: { id: company.id, name: company.name },
    }

    mockJobs.push(newJob)
    return HttpResponse.json(newJob)
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
    }

    return HttpResponse.json(app)
  }),

  // ============ STUDENT ============

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

    return HttpResponse.json({
      applicationsUsed: studentApps.length,
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
    if (activeApps.length >= 2) {
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

  // Update company status
  http.patch(`${API_URL}/admin/companies/:companyId`, async ({ params, request }) => {
    await delay(DELAY_MS)
    const body = (await request.json()) as { status: CompanyStatus; rejectionReason?: string }
    const companyIndex = mockCompanies.findIndex((c) => c.id === params.companyId)
    if (companyIndex === -1) {
      return HttpResponse.json({ message: 'Company not found' }, { status: 404 })
    }

    const company = mockCompanies[companyIndex]!
    company.status = body.status
    if (body.status === CompanyStatus.APPROVED) {
      company.approvedAt = new Date().toISOString()
    }
    if (body.rejectionReason) {
      company.rejectionReason = body.rejectionReason
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

    return HttpResponse.json(app)
  }),
]
