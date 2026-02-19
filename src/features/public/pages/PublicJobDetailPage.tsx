import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '@/services/api/client'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { JobPosting, UserType, ApplicationStatus } from '@/types'
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
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StudentNavbar from '@/components/layout/StudentNavbar'
import Logo from '@/components/common/Logo'
import CompanyAvatar from '@/components/common/CompanyAvatar'
import Badge from '@/components/common/Badge'

export default function PublicJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthContext()
  const { success, error: showError } = useNotification()

  const [job, setJob] = useState<JobPosting & { hasApplied?: boolean; applicationStatus?: ApplicationStatus } | null>(null)
  const [dashboard, setDashboard] = useState<{ applicationsUsed: number; applicationLimit?: number | null; isHired: boolean } | null>(null)
  const [subscription, setSubscription] = useState<{ subscriptionTier: 'free' | 'paid' } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)

  // Only students are authenticated on the main domain
  const isStudent = isAuthenticated && user?.userType === UserType.STUDENT

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return
      setIsLoading(true)
      try {
        const data = await api.get<JobPosting & { hasApplied?: boolean; applicationStatus?: ApplicationStatus }>(`/student/jobs/${jobId}`)
        setJob(data)

        if (isStudent) {
          const [dashboardData, subscriptionData] = await Promise.all([
            api.get<{ applicationsUsed: number; applicationLimit?: number | null; isHired: boolean }>('/student/dashboard'),
            api.get<{ subscriptionTier: 'free' | 'paid' }>('/student/subscription'),
          ])
          setDashboard(dashboardData)
          setSubscription(subscriptionData)
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

  const applicationLimit = dashboard?.applicationLimit ?? 2
  const isPaidTier = subscription?.subscriptionTier === 'paid'
  const hasUnlimitedApplications = applicationLimit === null || applicationLimit === Number.POSITIVE_INFINITY || isPaidTier
  const hasReachedFreeLimit = !hasUnlimitedApplications && (dashboard?.applicationsUsed ?? 0) >= applicationLimit

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

    if (hasReachedFreeLimit) {
      showError('Application limit reached for free tier (2). Upgrade to apply to unlimited jobs.')
      return
    }

    setIsApplying(true)
    try {
      await api.post(`/student/jobs/${jobId}/apply`)
      success('Application submitted successfully!')
      // Refetch job data to get accurate application status
      const updatedJob = await api.get<JobPosting & { hasApplied?: boolean; applicationStatus?: ApplicationStatus }>(`/student/jobs/${jobId}`)
      setJob(updatedJob)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to apply')
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

  // Check application status - only withdrawn can reapply (not rejected)
  const isWithdrawn = (job?.applicationStatus as string) === 'withdrawn'
  const isRejected = (job?.applicationStatus as string) === 'rejected'
  const hasActiveApplication = job?.hasApplied && !isWithdrawn

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Use StudentNavbar for logged-in students */}
      {isStudent ? (
        <StudentNavbar />
      ) : (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-teal-600 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/">
                <Logo size="md" />
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  to="/jobs"
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/student"
                  className="px-5 py-2.5 rounded-xl bg-white text-teal-600 font-semibold hover:bg-gray-100 transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up">
                <div className="flex items-start gap-6">
                  <CompanyAvatar
                    name={job.company?.name || 'Company'}
                    logoUrl={job.company?.logo}
                    size="xl"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">
                          {job.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-gray-500">
                          <p className="text-lg">
                            {job.company?.name}
                          </p>
                          {job.company?.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {job.company.industry}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
                        {job.jobType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      {job.salaryRange && (
                        <div className="text-teal-600 font-medium">
                          {job.salaryRange}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job description */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up stagger-1">
                <h2 className="text-xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  About the Role
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up stagger-2">
                  <h2 className="text-xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-500" />
                    Requirements
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </div>
                </div>
              )}

              {/* Company info */}
              {job.company && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up stagger-3">
                  <h2 className="text-xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-purple-600" />
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
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {job.company.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">
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
                          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
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
                          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
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
                          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
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
            <div className="space-y-6">
              {/* Apply card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-28 z-10 animate-fade-in-up stagger-1">
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
                        : 'bg-teal-100'
                    }`}>
                      <CheckCircle className={`w-8 h-8 ${
                        job.applicationStatus === ApplicationStatus.HIRED
                          ? 'text-green-600'
                          : job.applicationStatus === ApplicationStatus.REJECTED
                          ? 'text-red-600'
                          : 'text-teal-600'
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
                      className="mt-4 inline-block text-teal-600 hover:text-teal-700 transition-colors text-sm"
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
                      className="inline-block text-teal-600 hover:text-teal-700 transition-colors text-sm"
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
                        className="w-full px-6 py-4 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all disabled:opacity-50 shadow-sm"
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
                    {isStudent && dashboard && (
                      <div className="mb-4 text-sm">
                        {hasUnlimitedApplications ? (
                          <p className="text-teal-600">Paid tier: Unlimited applications available.</p>
                        ) : (
                          <p className="text-gray-500">
                            {dashboard.applicationsUsed}/{applicationLimit} applications used
                          </p>
                        )}
                      </div>
                    )}

                    {isStudent && hasReachedFreeLimit ? (
                      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-sm text-yellow-700 mb-3">
                          Free tier limit reached. Upgrade to apply to unlimited jobs.
                        </p>
                        <Link
                          to="/subscription"
                          className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700 transition-all"
                        >
                          Upgrade to Unlimited
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleApply}
                        disabled={isApplying || (isStudent && !!dashboard?.isHired)}
                        className="w-full px-6 py-4 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all disabled:opacity-50 shadow-sm"
                      >
                        {isApplying
                          ? 'Applying...'
                          : dashboard?.isHired
                          ? 'Already Hired'
                          : isAuthenticated
                          ? 'Apply Now'
                          : 'Sign In to Apply'}
                      </button>
                    )}
                  </>
                )}

                {!isAuthenticated && !hasActiveApplication && !isWithdrawn && !isRejected && !isDeadlinePassed && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account?{' '}
                    <Link to="/register/student" className="text-teal-600 hover:text-teal-700">
                      Sign up
                    </Link>
                  </p>
                )}

              </div>

              {/* Quick info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in-up stagger-2">
                <h3 className="font-display font-semibold text-gray-900 mb-4">Quick Info</h3>
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
                      <dd className="text-teal-600 font-medium">{job.salaryRange}</dd>
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
