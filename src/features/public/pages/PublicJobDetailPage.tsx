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
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StudentNavbar from '@/components/layout/StudentNavbar'
import Logo from '@/components/common/Logo'

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
      <div className="min-h-screen ocean-bg flex items-center justify-center">
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
    <div className="min-h-screen ocean-bg">
      {/* Navigation - Use StudentNavbar for logged-in students */}
      {isStudent ? (
        <StudentNavbar />
      ) : (
        <nav className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/">
                <Logo size="md" />
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  to="/jobs"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl glass hover:border-glow-cyan/30 text-foreground font-medium transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/student"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep font-semibold"
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
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job header */}
              <div className="glass rounded-2xl p-8 animate-fade-in-up">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-glow-cyan/20 to-glow-teal/20 flex items-center justify-center border border-glow-cyan/20 flex-shrink-0">
                    <Building2 className="w-10 h-10 text-glow-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                          {job.title}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                          {job.company?.name}
                        </p>
                      </div>
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-glow-teal/10 text-glow-teal border border-glow-teal/20 whitespace-nowrap">
                        {job.jobType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      {job.salaryRange && (
                        <div className="text-glow-cyan">
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
              <div className="glass rounded-2xl p-8 animate-fade-in-up stagger-1">
                <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-glow-cyan" />
                  About the Role
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="glass rounded-2xl p-8 animate-fade-in-up stagger-2">
                  <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-glow-teal" />
                    Requirements
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </div>
                </div>
              )}

              {/* Company info */}
              {job.company && (
                <div className="glass rounded-2xl p-8 animate-fade-in-up stagger-3">
                  <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-glow-purple" />
                    About {job.company.name}
                  </h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Company Profile
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply card */}
              <div className="glass rounded-2xl p-6 sticky top-28 z-10 animate-fade-in-up stagger-1">
                {job.deadline && (
                  <div className={`flex items-center gap-2 mb-4 ${isDeadlinePassed ? 'text-coral' : 'text-muted-foreground'}`}>
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
                        ? 'bg-glow-teal/20'
                        : job.applicationStatus === ApplicationStatus.REJECTED
                        ? 'bg-coral/20'
                        : 'bg-glow-cyan/20'
                    }`}>
                      <CheckCircle className={`w-8 h-8 ${
                        job.applicationStatus === ApplicationStatus.HIRED
                          ? 'text-glow-teal'
                          : job.applicationStatus === ApplicationStatus.REJECTED
                          ? 'text-coral'
                          : 'text-glow-cyan'
                      }`} />
                    </div>
                    <p className="text-foreground font-medium mb-2">You've already applied!</p>
                    {job.applicationStatus && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                        job.applicationStatus === ApplicationStatus.HIRED
                          ? 'bg-glow-teal/20 text-glow-teal'
                          : job.applicationStatus === ApplicationStatus.REJECTED
                          ? 'bg-coral/20 text-coral'
                          : job.applicationStatus === ApplicationStatus.REVIEWED
                          ? 'bg-glow-purple/20 text-glow-purple'
                          : 'bg-sand/20 text-sand'
                      }`}>
                        {job.applicationStatus === ApplicationStatus.PENDING && 'Pending Review'}
                        {job.applicationStatus === ApplicationStatus.REVIEWED && 'Under Review'}
                        {job.applicationStatus === ApplicationStatus.HIRED && 'Hired'}
                        {job.applicationStatus === ApplicationStatus.REJECTED && 'Not Selected'}
                      </span>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Check your applications for updates
                    </p>
                    <Link
                      to="/my-applications"
                      className="mt-4 inline-block text-glow-cyan hover:text-glow-teal transition-colors text-sm"
                    >
                      View My Applications
                    </Link>
                  </div>
                ) : isRejected ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-coral/20">
                      <XCircle className="w-8 h-8 text-coral" />
                    </div>
                    <p className="text-foreground font-medium mb-2">Application Not Selected</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unfortunately, your application was not selected for this position.
                    </p>
                    <Link
                      to="/jobs"
                      className="inline-block text-glow-cyan hover:text-glow-teal transition-colors text-sm"
                    >
                      Browse Other Jobs
                    </Link>
                  </div>
                ) : isWithdrawn ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-sand/20">
                      <ArrowLeft className="w-8 h-8 text-sand" />
                    </div>
                    <p className="text-foreground font-medium mb-2">Application Withdrawn</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your previous application was withdrawn. You can reapply if you'd like.
                    </p>
                    {!isDeadlinePassed && (
                      <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep font-semibold glow-sm hover:glow-md transition-all disabled:opacity-50"
                      >
                        {isApplying ? 'Applying...' : 'Reapply Now'}
                      </button>
                    )}
                  </div>
                ) : isDeadlinePassed ? (
                  <button
                    disabled
                    className="w-full px-6 py-4 rounded-xl bg-ocean-surface text-muted-foreground font-semibold cursor-not-allowed"
                  >
                    Applications Closed
                  </button>
                ) : (
                  <>
                    {isStudent && dashboard && (
                      <div className="mb-4 text-sm">
                        {hasUnlimitedApplications ? (
                          <p className="text-glow-teal">Paid tier: Unlimited applications available.</p>
                        ) : (
                          <p className="text-muted-foreground">
                            {dashboard.applicationsUsed}/{applicationLimit} applications used
                          </p>
                        )}
                      </div>
                    )}

                    {isStudent && hasReachedFreeLimit ? (
                      <div className="rounded-xl border border-sand/30 bg-sand/10 p-4">
                        <p className="text-sm text-sand mb-3">
                          Free tier limit reached. Upgrade to apply to unlimited jobs.
                        </p>
                        <Link
                          to="/subscription"
                          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal px-6 py-3 font-semibold text-ocean-deep"
                        >
                          Upgrade to Unlimited
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleApply}
                        disabled={isApplying || (isStudent && !!dashboard?.isHired)}
                        className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep font-semibold glow-sm hover:glow-md transition-all disabled:opacity-50"
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
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account?{' '}
                    <Link to="/register/student" className="text-glow-cyan hover:text-glow-teal">
                      Sign up
                    </Link>
                  </p>
                )}

              </div>

              {/* Quick info */}
              <div className="glass rounded-2xl p-6 animate-fade-in-up stagger-2">
                <h3 className="font-display font-semibold mb-4">Quick Info</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Job Type</dt>
                    <dd className="text-foreground font-medium">{job.jobType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Location</dt>
                    <dd className="text-foreground font-medium">{job.location}</dd>
                  </div>
                  {job.salaryRange && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Salary Range</dt>
                      <dd className="text-glow-cyan font-medium">{job.salaryRange}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-muted-foreground">Posted</dt>
                    <dd className="text-foreground font-medium">
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
