import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api, ApiClientError } from '@/services/api/client'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { JobPosting, UserType, ApplicationStatus, AccessSource } from '@/types'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Globe,
  Linkedin,
  Twitter,
  Lock,
  ArrowRight,
  Ticket,
  Check,
  Info,
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StudentNavbar from '@/components/layout/StudentNavbar'
import PublicNavbar from '@/components/layout/PublicNavbar'
import CompanyAvatar from '@/components/common/CompanyAvatar'
import Badge from '@/components/common/Badge'
import ZoneUnlockPanel from '@/features/student/components/ZoneUnlockPanel'
import ZoneBadge from '@/features/student/components/ZoneBadge'

const LOCKED_DESCRIPTION_MESSAGE = 'Application limit reached. Upgrade your plan to view full job description.'
const DESCRIPTION_PREVIEW_PLACEHOLDER = 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Upgrade your plan to unlock the full job description and keep exploring the role details.'

type PublicJobDetailsPayload = JobPosting & {
  _id?: string
  hasApplied?: boolean
  applicationStatus?: ApplicationStatus
  application?: { status?: ApplicationStatus }
  accessSource?: AccessSource
}

function getAccessMessage(accessSource: AccessSource, zoneName?: string | null): { message: string; variant: 'success' | 'info' } | null {
  switch (accessSource) {
    case 'pay-per-job':
      return {
        message: 'You purchased one-time access to this job.',
        variant: 'success'
      }
    case 'subscription':
      return {
        message: `You have access to ${zoneName || 'this zone'} and can apply to this job.`,
        variant: 'success'
      }
    case 'all-zones':
      return {
        message: 'You have access to all zones.',
        variant: 'success'
      }
    case 'applied':
      return {
        message: 'You have already applied to this job.',
        variant: 'info'
      }
    case 'no-zone-restriction':
      return {
        message: 'This job is available to all users.',
        variant: 'info'
      }
    default:
      return null
  }
}

type PublicJobDetailsResponse =
  | PublicJobDetailsPayload
  | {
      data?: PublicJobDetailsPayload
      job?: PublicJobDetailsPayload
    }

function getDescriptionPreview(description?: string | null): string {
  const trimmedDescription = description?.trim()

  if (!trimmedDescription) {
    return DESCRIPTION_PREVIEW_PLACEHOLDER
  }

  return trimmedDescription
}

function normalizePublicJobDetailsResponse(
  response: PublicJobDetailsResponse,
  jobId?: string
) {
  const payload = (
    ('data' in response && response.data)
    || ('job' in response && response.job)
    || response
  ) as PublicJobDetailsPayload

  return {
    ...payload,
    id: payload.id || payload._id || jobId || '',
    applicationStatus: payload.applicationStatus || payload.application?.status,
  }
}

export default function PublicJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthContext()
  const { success, error: showError } = useNotification()

  const [job, setJob] = useState<(JobPosting & { hasApplied?: boolean; applicationStatus?: ApplicationStatus; accessSource?: AccessSource }) | null>(null)
  const [dashboard, setDashboard] = useState<{ isHired: boolean } | null>(null)
  const [quota, setQuota] = useState<{ applicationsUsed: number; applicationLimit: number | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)

  // Only students are authenticated on the main domain
  const isStudent = isAuthenticated && user?.userType === UserType.STUDENT

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return
      setIsLoading(true)
      try {
        const data = await api.get<PublicJobDetailsResponse>(`/student/jobs/${jobId}`)
        const normalizedJob = normalizePublicJobDetailsResponse(data, jobId)
        console.log('DESCRIPTION LOCK:', normalizedJob.isDescriptionLocked)
        setJob(normalizedJob)

        if (isStudent) {
          const [dashboardData, subData] = await Promise.all([
            api.get<{ isHired: boolean }>('/student/dashboard'),
            api.get<{ applicationsUsed: number; applicationLimit: number | null }>('/student/subscription'),
          ])
          setDashboard(dashboardData)
          setQuota({ applicationsUsed: subData.applicationsUsed, applicationLimit: subData.applicationLimit })
        }
      } catch {
        showError('Job not found')
        navigate('/jobs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [jobId, navigate, showError, isStudent])

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${jobId}`)
      return
    }

    if (user?.userType !== UserType.STUDENT) {
      showError('Only students can apply for jobs')
      return
    }

    if (dashboard?.isHired) {
      showError('You are already hired and cannot apply to new jobs')
      return
    }

    setIsApplying(true)
    try {
      await api.post(`/student/jobs/${jobId}/apply`)
      // Immediately update quota so UI re-renders without a page refresh
      const newUsed = (quota?.applicationsUsed ?? 0) + 1
      const newQuota = quota ? { ...quota, applicationsUsed: newUsed } : null
      setQuota(newQuota)
      success('Application submitted successfully!')
      // Refetch job data to get accurate application status
      const updatedJob = await api.get<PublicJobDetailsResponse>(`/student/jobs/${jobId}`)
      const normalizedJob = normalizePublicJobDetailsResponse(updatedJob, jobId)
      setJob(normalizedJob)
    } catch (err) {
      const apiErr = err instanceof ApiClientError ? err : null
      if (apiErr?.data?.isZoneLocked) {
        const reason = apiErr.data.zoneLockReason as import('@/types').ZoneLockReason | undefined
        if (reason) {
          setJob((prev) => prev ? { ...prev, isZoneLocked: true, zoneLockReason: reason } : prev)
        }
        return
      }
      const message = err instanceof Error ? err.message : 'Failed to apply'
      if (
        message.toLowerCase().includes('application limit reached') ||
        message === 'Free tier allows only 2 job applications'
      ) {
        // Sync quota so blur/lock triggers immediately
        try {
          const subData = await api.get<{ applicationsUsed: number; applicationLimit: number | null }>('/student/subscription')
          setQuota({ applicationsUsed: subData.applicationsUsed, applicationLimit: subData.applicationLimit })
        } catch { /* best-effort */ }
        showError('You have reached your application limit. Upgrade your plan to continue applying.')
      } else {
        showError(message)
      }
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return null
  }

  const isDeadlinePassed = job.deadline ? new Date(job.deadline) < new Date() : false
  const lockedDescriptionPreview = getDescriptionPreview(job.description)
  const isQuotaReached =
    typeof quota?.applicationLimit === 'number' && quota.applicationsUsed >= quota.applicationLimit
  const isZoneLocked = job?.isZoneLocked === true
  const isLocked = job?.isDescriptionLocked === true || isQuotaReached

  // Check application status - only withdrawn can reapply (not rejected)
  const isWithdrawn = (job?.applicationStatus as string) === 'withdrawn'
  const isRejected = (job?.applicationStatus as string) === 'rejected'
  const hasActiveApplication = job?.hasApplied && !isWithdrawn

  const handleJobUnlocked = async () => {
    if (!jobId) return
    try {
      const data = await api.get<PublicJobDetailsResponse>(`/student/jobs/${jobId}`)
      setJob(normalizePublicJobDetailsResponse(data, jobId))
    } catch { /* best-effort */ }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Use StudentNavbar for logged-in students */}
      {isStudent ? <StudentNavbar /> : <PublicNavbar />}

      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span>Back to Jobs</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Job header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  <CompanyAvatar
                    name={job.company?.name || 'Company'}
                    logoUrl={job.company?.logo}
                    size="xl"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">
                          {job.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-500">
                          <p className="text-base sm:text-lg">
                            {job.company?.name}
                          </p>
                          {job.company?.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {job.company.industry}
                            </Badge>
                          )}
                          {/* Zone Badge */}
                          {(job.zoneName || job.countryName) && (
                            <ZoneBadge
                              zoneName={job.zoneName || job.countryName}
                              zoneId={job.zoneId}
                              isLocked={job.isZoneLocked}
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                      <span className="self-start px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                        {job.jobType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-sm sm:text-base text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      {job.salaryRange && (
                        <div className="text-blue-600 font-medium">
                          {job.salaryRange}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job description */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 animate-fade-in-up stagger-1">
                <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-display font-semibold text-gray-900 flex items-center gap-2 sm:gap-3">
                    <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    About the Role
                  </h2>
                  {isLocked && !isZoneLocked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      <Lock className="h-3.5 w-3.5" />
                      Job Description Locked
                    </span>
                  )}
                </div>

                {isZoneLocked && job.zoneLockReason ? (
                  <ZoneUnlockPanel
                    zoneLockReason={job.zoneLockReason}
                    jobId={job.id}
                    prefill={user?.student ? { name: user.student.fullName, email: user.student.email } : undefined}
                    onUnlocked={handleJobUnlocked}
                  />
                ) : isLocked ? (
                  <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 min-h-[240px]">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none select-none rounded-xl bg-white/80 p-4 sm:p-5 h-full"
                      style={{ filter: 'blur(6px)' }}
                    >
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {lockedDescriptionPreview}
                      </p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className="max-w-sm rounded-2xl border border-amber-200 bg-white/95 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                        <div className="mb-3 flex items-center justify-center gap-2 text-amber-800">
                          <Lock className="h-4 w-4 flex-shrink-0" />
                          <p className="text-sm sm:text-base font-semibold">Job Description Locked</p>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700">{LOCKED_DESCRIPTION_MESSAGE}</p>
                        <Link
                          to="/subscription"
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                        >
                          Upgrade Plan
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-gray max-w-none">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {job.requirements && !isZoneLocked && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 animate-fade-in-up stagger-2">
                  <h2 className="text-lg sm:text-xl font-display font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    Requirements
                  </h2>
                  <div className={`prose prose-gray max-w-none ${isLocked ? 'blur-sm select-none pointer-events-none opacity-60' : ''}`}>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </div>
                </div>
              )}

              {/* Company info */}
              {job.company && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 animate-fade-in-up stagger-3">
                  <h2 className="text-lg sm:text-xl font-display font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <Building2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    About {job.company.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1">
                      <Users className="w-3.5 h-3.5" />
                      {job.company.size ? `${job.company.size} team members` : 'Team size pending'}
                    </div>
                    {job.company.industry && (
                      <Badge variant="secondary">
                        {job.company.industry}
                      </Badge>
                    )}
                    {job.company.foundedYear && (
                      <span className="rounded-full border border-gray-200 px-3 py-1">
                        Founded {job.company.foundedYear}
                      </span>
                    )}
                  </div>
                  {job.company.description ? (
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {job.company.description}
                    </p>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-400 italic">
                      This company hasn't added a public description yet.
                    </p>
                  )}
                  {(job.company.website || job.company.socialLinks?.linkedin || job.company.socialLinks?.twitter) && (
                    <div className="flex flex-wrap items-center gap-4 mt-6 text-sm">
                      {job.company.website && (
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Visit Website
                        </a>
                      )}
                      {job.company.socialLinks?.linkedin && (
                        <a
                          href={job.company.socialLinks.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </a>
                      )}
                      {job.company.socialLinks?.twitter && (
                        <a
                          href={job.company.socialLinks.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Apply card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-28 z-10 animate-fade-in-up stagger-1">
                {job.deadline && (
                  <div className={`flex items-center gap-2 mb-4 ${isDeadlinePassed ? 'text-red-600' : 'text-gray-500'}`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {isDeadlinePassed
                        ? 'Application deadline passed'
                        : `Apply by ${new Date(job.deadline).toLocaleDateString()}`}
                    </span>
                  </div>
                )}

                {hasActiveApplication ? (
                  <div className="text-center py-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      job.applicationStatus === ApplicationStatus.HIRED
                        ? 'bg-green-100'
                        : job.applicationStatus === ApplicationStatus.REJECTED
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    }`}>
                      <CheckCircle className={`w-8 h-8 ${
                        job.applicationStatus === ApplicationStatus.HIRED
                          ? 'text-green-600'
                          : job.applicationStatus === ApplicationStatus.REJECTED
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`} />
                    </div>
                    <p className="text-gray-900 font-medium mb-2">You've already applied!</p>
                    {job.applicationStatus && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                        job.applicationStatus === ApplicationStatus.HIRED
                          ? 'bg-green-100 text-green-700'
                          : job.applicationStatus === ApplicationStatus.REJECTED
                          ? 'bg-red-100 text-red-700'
                          : job.applicationStatus === ApplicationStatus.REVIEWED
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {job.applicationStatus === ApplicationStatus.PENDING && 'Pending Review'}
                        {job.applicationStatus === ApplicationStatus.REVIEWED && 'Under Review'}
                        {job.applicationStatus === ApplicationStatus.HIRED && 'Hired'}
                        {job.applicationStatus === ApplicationStatus.REJECTED && 'Not Selected'}
                      </span>
                    )}
                    <p className="text-sm text-gray-500">
                      Check your applications for updates
                    </p>
                    <Link
                      to="/my-applications"
                      className="mt-4 inline-block text-blue-600 hover:text-blue-700 transition-colors text-sm"
                    >
                      View My Applications
                    </Link>
                  </div>
                ) : isRejected ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-gray-900 font-medium mb-2">Application Not Selected</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Unfortunately, your application was not selected for this position.
                    </p>
                    <Link
                      to="/jobs"
                      className="inline-block text-blue-600 hover:text-blue-700 transition-colors text-sm"
                    >
                      Browse Other Jobs
                    </Link>
                  </div>
                ) : isWithdrawn ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-yellow-100">
                      <ArrowLeft className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-gray-900 font-medium mb-2">Application Withdrawn</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Your previous application was withdrawn. You can reapply if you'd like.
                    </p>
                    {!isDeadlinePassed && (
                      <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="w-full px-6 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm"
                      >
                        {isApplying ? 'Applying...' : 'Reapply Now'}
                      </button>
                    )}
                  </div>
                ) : isDeadlinePassed ? (
                  <button
                    disabled
                    className="w-full px-6 py-4 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed"
                  >
                    Applications Closed
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleApply}
                      disabled={isApplying || (isStudent && !!dashboard?.isHired) || isQuotaReached || isZoneLocked}
                      className="w-full px-6 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm"
                    >
                      {isApplying
                        ? 'Applying...'
                        : dashboard?.isHired
                        ? 'Already Hired'
                        : isZoneLocked
                        ? 'Unlock to Apply'
                        : isQuotaReached
                        ? 'Limit Reached'
                        : isAuthenticated
                        ? 'Apply Now'
                        : 'Sign In to Apply'}
                    </button>
                  </>
                )}

                {!isAuthenticated && !hasActiveApplication && !isWithdrawn && !isRejected && !isDeadlinePassed && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account?{' '}
                    <Link to="/register/student" className="text-blue-600 hover:text-blue-700">
                      Sign up
                    </Link>
                  </p>
                )}

              </div>

              {/* Zone Info Card */}
              {(job.zoneName || job.countryName || job.accessSource) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-fade-in-up stagger-2">
                  <h3 className="font-display font-semibold text-gray-900 mb-3 sm:mb-4">Zone Information</h3>
                  <div className="space-y-3">
                    {(job.zoneName || job.countryName) && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-500">Region:</span>
                        <ZoneBadge
                          zoneName={job.zoneName || job.countryName}
                          zoneId={job.zoneId}
                          isLocked={job.isZoneLocked}
                          size="md"
                        />
                      </div>
                    )}
                    {job.countryName && job.zoneName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{job.countryName}</span>
                      </div>
                    )}
                    {isStudent && (() => {
                      const accessMessage = getAccessMessage(job.accessSource ?? null, job.zoneName)
                      if (accessMessage) {
                        const isSuccess = accessMessage.variant === 'success'
                        return (
                          <div className={`flex items-start gap-2 text-sm rounded-lg p-3 border ${
                            isSuccess
                              ? 'text-green-700 bg-green-50 border-green-200'
                              : 'text-blue-700 bg-blue-50 border-blue-200'
                          }`}>
                            {job.accessSource === 'pay-per-job' && <Ticket className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                            {job.accessSource === 'subscription' && <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                            {job.accessSource === 'all-zones' && <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                            {(job.accessSource === 'applied' || job.accessSource === 'no-zone-restriction') && <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                            <span>{accessMessage.message}</span>
                          </div>
                        )
                      }
                      if (job.isZoneLocked) {
                        return (
                          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                            You don't have access to this zone. Unlock it through a subscription upgrade, zone add-on, or pay-per-job option.
                          </p>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
              )}

              {/* Quick info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-fade-in-up stagger-2">
                <h3 className="font-display font-semibold text-gray-900 mb-3 sm:mb-4">Quick Info</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-gray-500">Job Type</dt>
                    <dd className="text-gray-900 font-medium">{job.jobType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Location</dt>
                    <dd className="text-gray-900 font-medium">{job.location}</dd>
                  </div>
                  {job.salaryRange && (
                    <div>
                      <dt className="text-sm text-gray-500">Salary Range</dt>
                      <dd className="text-blue-600 font-medium">{job.salaryRange}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">Posted</dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
