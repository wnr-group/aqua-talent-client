import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardTitle, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Alert from '@/components/common/Alert'
import { useNotification } from '@/contexts/NotificationContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { JobPosting, ApplicationStatus, QuotaLockReason } from '@/types'
import { api, ApiClientError } from '@/services/api/client'
import { format } from 'date-fns'
import CompanyAvatar from '@/components/common/CompanyAvatar'
import Badge from '@/components/common/Badge'
import ZoneUnlockPanel from '@/features/student/components/ZoneUnlockPanel'
import QuotaUnlockPanel from '@/features/student/components/QuotaUnlockPanel'
import ZoneBadge from '@/features/student/components/ZoneBadge'
import { Globe, Linkedin, Twitter, ArrowRight, Lock, MapPin } from 'lucide-react'

interface JobDetailResponse extends JobPosting {
  hasApplied: boolean
  applicationStatus?: ApplicationStatus
  isQuotaExhausted?: boolean
  quotaLockReason?: QuotaLockReason | null
}

interface StudentStats {
  isHired: boolean
}

type JobDetailsPayload = JobPosting & {
  _id?: string
  hasApplied?: boolean
  applicationStatus?: ApplicationStatus
  application?: { status?: ApplicationStatus }
}

type JobDetailsApiResponse =
  | JobDetailsPayload
  | { data?: JobDetailsPayload; job?: JobDetailsPayload }

const LOCKED_DESCRIPTION_MESSAGE = 'Application limit reached. Upgrade your plan to view full job description.'
const DESCRIPTION_PREVIEW_PLACEHOLDER = 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Upgrade your plan to unlock the full job description and keep exploring the role details.'

function getDescriptionPreview(description?: string | null): string {
  const trimmedDescription = description?.trim()

  if (!trimmedDescription) {
    return DESCRIPTION_PREVIEW_PLACEHOLDER
  }

  return trimmedDescription
}

function normalizeJobDetailsResponse(
  response: JobDetailsApiResponse,
  jobId?: string
): JobDetailResponse {
  const payload = (
    ('data' in response && response.data)
    || ('job' in response && response.job)
    || response
  ) as JobDetailsPayload

  return {
    ...payload,
    id: payload.id || payload._id || jobId || '',
    hasApplied: payload.hasApplied ?? false,
    applicationStatus: payload.applicationStatus || payload.application?.status,
  }
}

export default function StudentJobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const { user } = useAuthContext()
  const [job, setJob] = useState<JobDetailResponse | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [quota, setQuota] = useState<{ applicationsUsed: number; applicationLimit: number | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [showLimitReachedPrompt, setShowLimitReachedPrompt] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [jobData, statsData, subData] = await Promise.all([
          api.get<JobDetailsApiResponse>(`/student/jobs/${jobId}`),
          api.get<StudentStats>('/student/dashboard'),
          api.get<{ applicationsUsed: number; applicationLimit: number | null }>('/student/subscription'),
        ])
        const normalizedJob = normalizeJobDetailsResponse(jobData, jobId)
        console.log('DESCRIPTION LOCK:', normalizedJob.isDescriptionLocked)
        setJob(normalizedJob)
        setStats(statsData)
        setQuota({ applicationsUsed: subData.applicationsUsed, applicationLimit: subData.applicationLimit })
      } catch {
        showError('Failed to load job details')
        navigate('/student/jobs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [jobId, navigate, showError])

  const handleApply = async () => {
    if (!job || !user?.student?.profileLink) {
      showError('Please update your profile with a link before applying')
      navigate('/profile')
      return
    }

    setIsApplying(true)
    setShowLimitReachedPrompt(false)
    try {
      await api.post(`/student/jobs/${jobId}/apply`)
      // Immediately update quota count so UI re-renders without a page refresh
      const newUsed = (quota?.applicationsUsed ?? 0) + 1
      const newQuota = quota ? { ...quota, applicationsUsed: newUsed } : null
      setQuota(newQuota)
      const justReachedLimit =
        typeof newQuota?.applicationLimit === 'number' && newUsed >= newQuota.applicationLimit
      setJob({
        ...job,
        hasApplied: true,
        applicationStatus: ApplicationStatus.PENDING,
        isDescriptionLocked: justReachedLimit || job.isDescriptionLocked === true,
      })
      success('Application submitted successfully!')
    } catch (err) {
      const apiErr = err instanceof ApiClientError ? err : null
      if (apiErr?.data?.isZoneLocked) {
        const reason = apiErr.data.zoneLockReason as import('@/types').ZoneLockReason | undefined
        if (reason) {
          setJob((prev) => prev ? { ...prev, isZoneLocked: true, zoneLockReason: reason } : prev)
        }
        return
      }
      const message = err instanceof Error ? err.message : 'Failed to submit application'
      if (
        message === 'Free tier allows only 2 job applications' ||
        message.toLowerCase().includes('application limit reached')
      ) {
        setShowLimitReachedPrompt(true)
        // Re-fetch quota so blur/lock triggers immediately
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

  // Allow applying if: never applied, OR previously withdrew
  // Cast to string to handle API response correctly
  const isWithdrawnStatus = (job?.applicationStatus as string) === 'withdrawn'
  const hasWithdrawn = job?.hasApplied && isWithdrawnStatus
  const lockedDescriptionPreview = getDescriptionPreview(job?.description)
  const isQuotaReached =
    typeof quota?.applicationLimit === 'number' && quota.applicationsUsed >= quota.applicationLimit
  const isQuotaExhausted = job?.isQuotaExhausted === true
  const isZoneLocked = job?.isZoneLocked === true
  // Trust API's isDescriptionLocked for applied jobs; use local quota check only for non-applied jobs
  const isLocked = job?.hasApplied
    ? job?.isDescriptionLocked === true || isQuotaExhausted
    : job?.isDescriptionLocked === true || isQuotaReached || isQuotaExhausted
  const canApply =
    (!job?.hasApplied || hasWithdrawn) &&
    !stats?.isHired &&
    !isQuotaReached &&
    !isQuotaExhausted &&
    !isZoneLocked

  const handleJobUnlocked = async () => {
    try {
      const [jobData, subData] = await Promise.all([
        api.get<JobDetailsApiResponse>(`/student/jobs/${jobId}`),
        api.get<{ applicationsUsed: number; applicationLimit: number | null }>('/student/subscription'),
      ])
      setJob(normalizeJobDetailsResponse(jobData, jobId))
      setQuota({ applicationsUsed: subData.applicationsUsed, applicationLimit: subData.applicationLimit })
    } catch { /* best-effort */ }
  }

  if (isLoading) {
    return (
      <PageContainer title="Job Details">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    )
  }

  if (!job) return null

  return (
    <PageContainer title={job.title}>
      {stats?.isHired && (
        <Alert variant="info" className="mb-6">
          You have been hired! You can no longer apply to new jobs.
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-4 mb-4">
              <CompanyAvatar
                name={job.company?.name ?? 'Company'}
                logoUrl={job.company?.logo}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-gray-900">
                  {job.company?.name ?? 'Unknown Company'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.jobType}</span>
                  {job.salaryRange && (
                    <>
                      <span>•</span>
                      <span>{job.salaryRange}</span>
                    </>
                  )}
                </div>
                {job.company?.industry && (
                  <div className="mt-2">
                    <Badge variant="secondary">{job.company.industry}</Badge>
                  </div>
                )}
                {/* Zone Information */}
                {(job.countryName || job.zoneLockReason?.zone?.name || job.zoneLockReason?.zoneName) && (
                  <div className="mt-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <ZoneBadge
                      zoneName={job.countryName || job.zoneLockReason?.zone?.name || job.zoneLockReason?.zoneName}
                      zoneId={job.zoneLockReason?.zone?.id ?? job.zoneLockReason?.zoneId}
                      isLocked={job.isZoneLocked}
                      size="md"
                    />
                  </div>
                )}
                {job.company?.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {job.company.description}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {isZoneLocked && job.zoneLockReason ? (
                <div className="space-y-4">
                  <ZoneUnlockPanel
                    zoneLockReason={job.zoneLockReason}
                    jobId={job.id}
                    prefill={user?.student ? { name: user.student.fullName, email: user.student.email } : undefined}
                    onUnlocked={handleJobUnlocked}
                  />
                  {/* Show quota panel too if both zone locked AND quota exhausted */}
                  {isQuotaExhausted && job.quotaLockReason && (
                    <QuotaUnlockPanel
                      quotaLockReason={job.quotaLockReason}
                      prefill={user?.student ? { name: user.student.fullName, email: user.student.email } : undefined}
                      onUnlocked={handleJobUnlocked}
                    />
                  )}
                </div>
              ) : isQuotaExhausted && job.quotaLockReason ? (
                <QuotaUnlockPanel
                  quotaLockReason={job.quotaLockReason}
                  prefill={user?.student ? { name: user.student.fullName, email: user.student.email } : undefined}
                  onUnlocked={handleJobUnlocked}
                />
              ) : (
                <>
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                          <Lock className="h-3.5 w-3.5" />
                          Job Description Locked
                        </span>
                      )}
                    </div>

                    {isLocked ? (
                      <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-50/70 p-4 min-h-[220px]">
                        <div
                          aria-hidden="true"
                          className="pointer-events-none select-none rounded-lg bg-white/80 p-4 h-full"
                          style={{ filter: 'blur(6px)' }}
                        >
                          <p className="text-gray-900 whitespace-pre-wrap">{lockedDescriptionPreview}</p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                          <div className="max-w-sm rounded-xl border border-amber-200 bg-white/95 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                            <div className="mb-3 flex items-center justify-center gap-2 text-amber-800">
                              <Lock className="h-4 w-4 flex-shrink-0" />
                              <p className="text-sm font-semibold">Job Description Locked</p>
                            </div>
                            <p className="text-sm text-gray-700">{LOCKED_DESCRIPTION_MESSAGE}</p>
                            <Link
                              to="/subscription"
                              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                              Upgrade Plan
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">{job.description}</p>
                    )}
                  </div>

                  {job.requirements && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Requirements</h3>
                      <p
                        className={`whitespace-pre-wrap ${
                          isLocked
                            ? 'text-gray-400 blur-sm select-none pointer-events-none'
                            : 'text-gray-900'
                        }`}
                  >
                    {job.requirements}
                  </p>
                </div>
              )}
                </>
              )}

              <div className="text-sm text-gray-500">
                Posted {format(new Date(job.createdAt), 'MMMM d, yyyy')}
                {job.deadline && (
                  <span className="ml-4">
                    Deadline: {format(new Date(job.deadline), 'MMMM d, yyyy')}
                  </span>
                )}
              </div>

              {(job.company?.website || job.company?.socialLinks?.linkedin || job.company?.socialLinks?.twitter || job.company?.size || job.company?.foundedYear) && (
                <div className="pt-4 mt-4 border-t border-gray-200 grid gap-3 md:grid-cols-2 text-sm">
                  {job.company?.size && (
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Company Size:</span> {job.company.size} people
                    </p>
                  )}
                  {job.company?.foundedYear && (
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Founded:</span> {job.company.foundedYear}
                    </p>
                  )}
                  {job.company?.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                  {job.company?.socialLinks?.linkedin && (
                    <a
                      href={job.company.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {job.company?.socialLinks?.twitter && (
                    <a
                      href={job.company.socialLinks.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </a>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Zone Info Card */}
          {(job.countryName || job.zoneLockReason) && (
            <Card>
              <CardTitle>Zone Information</CardTitle>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">This job is in:</span>
                    <ZoneBadge
                      zoneName={job.countryName || job.zoneLockReason?.zone?.name || job.zoneLockReason?.zoneName}
                      zoneId={job.zoneLockReason?.zone?.id ?? job.zoneLockReason?.zoneId}
                      isLocked={job.isZoneLocked}
                      size="md"
                    />
                  </div>
                  {job.isZoneLocked ? (
                    <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                      You don't have access to this zone. Unlock it through a subscription upgrade, zone add-on, or pay-per-job option below.
                    </p>
                  ) : isWithdrawnStatus && job.accessSource === 'applied' ? (
                    <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                      You withdrew your application to this job. Your previous access was through your application. To apply again, you may need to unlock this zone based on your current subscription.
                    </p>
                  ) : (
                    <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3 border border-green-200">
                      You have access to this zone and can apply to this job.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardTitle>Apply</CardTitle>
            <CardContent>
              {job.hasApplied && !isWithdrawnStatus ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    You have already applied to this job.
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      job.applicationStatus === ApplicationStatus.HIRED
                        ? 'bg-green-100 text-green-800'
                        : job.applicationStatus === ApplicationStatus.REJECTED
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {job.applicationStatus}
                  </span>
                </div>
              ) : (
                <>
                  {hasWithdrawn && (
                    <Alert variant={job.accessSource === 'applied' ? 'warning' : 'info'} className="mb-4">
                      {job.accessSource === 'applied' ? (
                        <>
                          Your previous application was withdrawn. Your access to this zone was through that application. To reapply, you may need to unlock this zone based on your current subscription.
                        </>
                      ) : (
                        <>Your previous application was withdrawn. You can reapply if you'd like.</>
                      )}
                    </Alert>
                  )}
                  {(isQuotaReached || showLimitReachedPrompt) && (
                    <Alert variant="warning" className="mb-4">
                      <div className="space-y-2">
                        <p className="font-medium">Application limit reached</p>
                        <p className="text-sm">
                          You have used {quota?.applicationsUsed ?? 'all'} of{' '}
                          {quota?.applicationLimit ?? 'your'} allowed applications. Upgrade your
                          plan to continue applying.
                        </p>
                        <Link
                          to="/subscription"
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Upgrade Plan
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </Alert>
                  )}
                  {isZoneLocked && (
                    <Alert variant="warning" className="mb-4">
                      <p className="text-sm font-medium">Unlock this job to apply</p>
                      <p className="text-sm mt-1">See the unlock options below for pricing details.</p>
                    </Alert>
                  )}
                  {!user?.student?.profileLink && (
                    <Alert variant="warning" className="mb-4">
                      Add a profile link before applying.
                    </Alert>
                  )}
                  <Button
                    onClick={handleApply}
                    disabled={!canApply}
                    isLoading={isApplying}
                    className="w-full"
                  >
                    {stats?.isHired
                      ? 'Already Hired'
                      : isZoneLocked
                      ? 'Unlock to Apply'
                      : isQuotaReached
                      ? 'Limit Reached'
                      : hasWithdrawn
                      ? 'Reapply Now'
                      : 'Apply Now'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    One-click apply with your profile link
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
