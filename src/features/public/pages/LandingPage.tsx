import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api/client'
import { useAuthContext } from '@/contexts/AuthContext'
import { JobPosting, UserType } from '@/types'
import {
  Briefcase,
  Building2,
  Users,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Search,
  LayoutDashboard,
  GraduationCap,
} from 'lucide-react'
import StudentNavbar from '@/components/layout/StudentNavbar'
import Logo from '@/components/common/Logo'

interface PublicJobsResponse {
  jobs: JobPosting[]
  total: number
}

export default function LandingPage() {
  const { user, isAuthenticated } = useAuthContext()
  const [featuredJobs, setFeaturedJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // On main domain, only students are authenticated (company/admin tokens not stored here)
  const isStudent = isAuthenticated && user?.userType === UserType.STUDENT

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.get<PublicJobsResponse>('/student/jobs?limit=6')
        setFeaturedJobs(data.jobs)
      } catch {
        // Silently fail for public page
      } finally {
        setIsLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const stats = [
    { label: 'Active Jobs', value: '150+', icon: Briefcase },
    { label: 'Companies', value: '50+', icon: Building2 },
    { label: 'Students Hired', value: '500+', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Use StudentNavbar for logged-in students */}
      {isStudent ? (
        <StudentNavbar />
      ) : (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 shadow-sm">
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
                  className="px-5 py-2.5 rounded-xl bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-60 right-1/4 w-64 h-64 bg-indigo-100/30 rounded-full blur-[80px]" />

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {isStudent
                    ? `Welcome back, ${user?.student?.fullName?.split(' ')[0]}!`
                    : 'The future of student recruitment'}
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 animate-fade-in-up stagger-1 text-gray-900">
              {isStudent ? (
                <>
                  Find Your{' '}
                  <span className="text-blue-600">Perfect Role</span>
                </>
              ) : (
                <>
                  Dive Into Your{' '}
                  <span className="text-blue-600">Dream Career</span>
                </>
              )}
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed mb-10 animate-fade-in-up stagger-2">
              {isStudent
                ? 'Browse the latest opportunities and find the perfect match for your skills. Your next career move is just a click away.'
                : 'Connect with top companies seeking fresh talent. Whether you\'re a student looking for opportunities or a company searching for rising stars, Aqua Talent makes it seamless.'}
            </p>

            {/* Search Bar */}
            <div className="animate-fade-in-up stagger-3">
              <div className="relative max-w-2xl">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search jobs, companies, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 py-3"
                    />
                  </div>
                  <Link
                    to={`/jobs${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    Search
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-8 mt-12 animate-fade-in-up stagger-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-200">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="absolute top-20 right-0 w-1/3 hidden lg:block animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-3xl shadow-lg border border-gray-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">New Opportunity</div>
                    <div className="text-sm text-gray-500">Software Engineer</div>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tech Corp Inc.</span>
                  <span className="text-blue-600">$80k - $120k</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 px-6 relative bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-gray-900">
                Featured <span className="text-blue-600">Opportunities</span>
              </h2>
              <p className="text-gray-500 text-lg">
                Discover the latest openings from top companies
              </p>
            </div>
            <Link
              to="/jobs"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              View all jobs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job, index) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group animate-fade-in-up stagger-${index + 1}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {job.jobType}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>

                  <p className="text-gray-500 text-sm mb-4">
                    {job.company?.name || 'Company'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <span>{job.salaryRange}</span>
                      </div>
                    )}
                  </div>

                  {job.deadline && (
                    <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        Apply by {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs available yet</h3>
              <p className="text-gray-500">
                Check back soon for new opportunities
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - For Students */}
      <section className="py-20 px-6 relative overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900">
                {isStudent ? 'Manage Your Job Search' : 'Ready to Launch Your Career?'}
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                {isStudent
                  ? 'Track your applications, update your profile, and stay on top of new opportunities from your personalized dashboard.'
                  : 'Create your profile, showcase your skills, and connect with companies actively looking for talented students like you.'}
              </p>
              <div className="flex flex-wrap gap-4">
                {isStudent ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Go to Dashboard
                    </Link>
                    <Link
                      to="/my-applications"
                      className="px-8 py-4 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                    >
                      View My Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register/student"
                      className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      Create Student Account
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/jobs"
                      className="px-8 py-4 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                    >
                      Browse Jobs First
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    {isStudent ? (
                      <GraduationCap className="w-10 h-10 text-blue-600" />
                    ) : (
                      <Users className="w-10 h-10 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isStudent ? 'Your Dashboard' : 'Student Benefits'}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {(isStudent
                    ? [
                        'View and track all your applications',
                        'Update your profile anytime',
                        'Get notified on application updates',
                        'Apply to up to 2 jobs at a time',
                      ]
                    : [
                        'Access to exclusive job listings',
                        'Direct connection with employers',
                        'Track your applications',
                        'Build your professional profile',
                      ]
                  ).map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - For Companies (only show to non-authenticated users) */}
      {!isStudent && (
        <section className="py-20 px-6 relative bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 text-center relative overflow-hidden border border-purple-100">
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 mb-6">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">For Employers</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900">
                  Find Your Next Star Employee
                </h2>
                <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
                  Post jobs, review applications, and hire talented students ready to make an impact. Join hundreds of companies already using Aqua Talent.
                </p>

                <Link
                  to="/register/company"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all"
                >
                  Register Your Company
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="md" />

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link to="/jobs" className="hover:text-gray-900 transition-colors">
                Jobs
              </Link>
              {isStudent ? (
                <>
                  <Link to="/dashboard" className="hover:text-gray-900 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/my-applications" className="hover:text-gray-900 transition-colors">
                    My Applications
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-gray-900 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register/student" className="hover:text-gray-900 transition-colors">
                    For Students
                  </Link>
                  <Link to="/register/company" className="hover:text-gray-900 transition-colors">
                    For Companies
                  </Link>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Aqua Talent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
