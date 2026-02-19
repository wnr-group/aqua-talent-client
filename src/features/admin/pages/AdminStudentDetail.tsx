import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardContent, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { api } from '@/services/api/client'
import { SubscriptionPlan } from '@/types'
import { format } from 'date-fns'
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Calendar,
  Link as LinkIcon,
  FileText,
  Video,
  Briefcase,
  GraduationCap,
  CreditCard,
  Crown,
  Edit,
  ExternalLink,
  Download,
  Play,
} from 'lucide-react'

interface Education {
  institution: string
  degree: string
  field: string
  startYear?: number | null
  endYear?: number | null
}

interface Experience {
  company: string
  title: string
  startDate: string
  endDate?: string | null
  description?: string | null
}

interface StudentProfile {
  id: string
  fullName: string
  email: string
  profileLink: string | null
  bio: string | null
  location: string | null
  availableFrom: string | null
  skills: string[]
  education: Education[]
  experience: Experience[]
  resumeUrl: string | null
  introVideoUrl: string | null
  isHired: boolean
  createdAt: string

  subscription: {
    tier: 'free' | 'paid'
    current: {
      id: string
      status: 'active' | 'expired' | 'cancelled' | 'pending'
      startDate: string
      endDate: string
      autoRenew: boolean
      plan: {
        id: string
        name: string
        description: string
        price: number
        billingCycle: string
        features: string[]
      } | null
    } | null
  }

  payments: {
    id: string
    amount: number
    currency: string
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    paymentDate: string
    paymentMethod: string
    transactionId: string
    plan: { name: string; price: number } | null
  }[]

  applications: {
    id: string
    status: 'pending' | 'reviewed' | 'hired' | 'rejected' | 'withdrawn'
    createdAt: string
    reviewedAt: string | null
    rejectionReason: string | null
    job: {
      id: string
      title: string
      location: string
      jobType: string
      salaryRange: string
      status: string
      company: { id: string; name: string } | null
    } | null
  }[]
}

export default function AdminStudentDetail() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'payments' | 'applications'>('profile')

  // Subscription modal state
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [autoRenew, setAutoRenew] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  const fetchStudent = useCallback(async () => {
    if (!studentId) return
    setIsLoading(true)
    try {
      const data = await api.get<StudentProfile>(`/admin/students/${studentId}`)
      setStudent(data)
    } catch (error) {
      showError('Failed to load student profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [studentId, showError])

  const fetchPlans = async () => {
    try {
      const data = await api.get<{ plans: SubscriptionPlan[] }>('/admin/subscription-plans')
      setPlans(data.plans?.filter((p) => p.isActive) || [])
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])

  const openSubscriptionModal = async () => {
    await fetchPlans()
    setSelectedPlanId(student?.subscription.current?.plan?.id || '')
    setCustomEndDate('')
    setAutoRenew(false)
    setShowSubscriptionModal(true)
  }

  const handleAssignSubscription = async () => {
    if (!selectedPlanId || !studentId) return

    setIsAssigning(true)
    try {
      await api.patch(`/admin/students/${studentId}/subscription`, {
        serviceId: selectedPlanId,
        endDate: customEndDate || undefined,
        autoRenew,
      })
      success('Subscription assigned successfully')
      setShowSubscriptionModal(false)
      fetchStudent()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to assign subscription')
    } finally {
      setIsAssigning(false)
    }
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!student) {
    return (
      <PageContainer title="Student Not Found">
        <Card className="py-12 text-center">
          <CardContent>
            <p className="text-gray-500 mb-4">The requested student could not be found.</p>
            <Button onClick={() => navigate('/students')}>Back to Students</Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const statusColors: Record<string, 'warning' | 'primary' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning',
    reviewed: 'primary',
    hired: 'success',
    rejected: 'destructive',
    withdrawn: 'secondary',
  }

  const paymentStatusColors: Record<string, 'warning' | 'success' | 'destructive' | 'primary'> = {
    pending: 'warning',
    completed: 'success',
    failed: 'destructive',
    refunded: 'primary',
  }

  return (
    <PageContainer
      title={student.fullName}
      description={student.email}
      actions={
        <Button variant="outline" onClick={() => navigate('/students')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Students
        </Button>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(['profile', 'subscription', 'payments', 'applications'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  {student.isHired && <Badge variant="success">Hired</Badge>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{student.email}</p>
                    </div>
                  </div>
                  {student.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">{student.location}</p>
                      </div>
                    </div>
                  )}
                  {student.availableFrom && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Available From</p>
                        <p className="text-sm text-gray-900">
                          {format(new Date(student.availableFrom), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                  {student.profileLink && (
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Profile Link</p>
                        <a
                          href={student.profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {student.bio && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                    <p className="text-sm text-gray-700">{student.bio}</p>
                  </div>
                )}

                {student.skills && student.skills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            {student.education && student.education.length > 0 && (
              <Card>
                <CardContent>
                  <CardTitle className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                  <div className="space-y-4">
                    {student.education.map((edu, i) => (
                      <div key={i} className="border-l-2 border-blue-200 pl-4">
                        <p className="font-medium text-gray-900">{edu.degree} in {edu.field}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-xs text-gray-500">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {student.experience && student.experience.length > 0 && (
              <Card>
                <CardContent>
                  <CardTitle className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5" />
                    Experience
                  </CardTitle>
                  <div className="space-y-4">
                    {student.experience.map((exp, i) => (
                      <div key={i} className="border-l-2 border-green-200 pl-4">
                        <p className="font-medium text-gray-900">{exp.title}</p>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(exp.startDate), 'MMM yyyy')} -{' '}
                          {exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resume & Video */}
            <Card>
              <CardContent>
                <CardTitle className="mb-4">Documents</CardTitle>
                <div className="space-y-3">
                  {student.resumeUrl ? (
                    <a
                      href={student.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Resume</p>
                        <p className="text-xs text-gray-500">Click to download</p>
                      </div>
                      <Download className="w-4 h-4 text-gray-400" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">No resume uploaded</p>
                    </div>
                  )}

                  {student.introVideoUrl ? (
                    <a
                      href={student.introVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Video className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Intro Video</p>
                        <p className="text-xs text-gray-500">Click to watch</p>
                      </div>
                      <Play className="w-4 h-4 text-gray-400" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <Video className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">No video uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent>
                <CardTitle className="mb-4">Account Info</CardTitle>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Joined</span>
                    <span className="text-sm text-gray-900">
                      {format(new Date(student.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Applications</span>
                    <span className="text-sm text-gray-900">{student.applications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Subscription</span>
                    <Badge variant={student.subscription.tier === 'paid' ? 'success' : 'secondary'}>
                      {student.subscription.tier === 'paid' ? 'Paid' : 'Free'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Subscription Details
              </CardTitle>
              <Button onClick={openSubscriptionModal} leftIcon={<Edit className="w-4 h-4" />}>
                Change Subscription
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Tier</p>
                <Badge
                  variant={student.subscription.tier === 'paid' ? 'success' : 'secondary'}
                  className="text-base"
                >
                  {student.subscription.tier === 'paid' ? 'Paid' : 'Free'}
                </Badge>
              </div>

              {student.subscription.current ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <Badge
                      variant={student.subscription.current.status === 'active' ? 'success' : 'warning'}
                    >
                      {student.subscription.current.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Plan</p>
                    <p className="text-gray-900 font-medium">
                      {student.subscription.current.plan?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-gray-900">
                      ${student.subscription.current.plan?.price || 0} / {student.subscription.current.plan?.billingCycle}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                    <p className="text-gray-900">
                      {format(new Date(student.subscription.current.startDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">End Date</p>
                    <p className="text-gray-900">
                      {student.subscription.current.plan?.billingCycle === 'one-time'
                        ? 'Never expires'
                        : format(new Date(student.subscription.current.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Auto-Renew</p>
                    <Badge variant={student.subscription.current.autoRenew ? 'success' : 'secondary'}>
                      {student.subscription.current.autoRenew ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  {student.subscription.current.plan?.features && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-2">Features</p>
                      <ul className="grid grid-cols-2 gap-2">
                        {student.subscription.current.plan.features.map((feature, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="md:col-span-2">
                  <p className="text-gray-500">No active subscription. Student is on free tier.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <Card>
          <CardContent>
            <CardTitle className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5" />
              Payment History
            </CardTitle>

            {student.payments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No payment history available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">
                          {format(new Date(payment.paymentDate), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{payment.plan?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-900">
                          {payment.currency} {payment.amount}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={paymentStatusColors[payment.status]}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                          {payment.transactionId}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{payment.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <Card>
          <CardContent>
            <CardTitle className="flex items-center gap-2 mb-6">
              <Briefcase className="w-5 h-5" />
              Applications ({student.applications.length})
            </CardTitle>

            {student.applications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No applications yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Job Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Applied</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Reviewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.applications.map((app) => (
                      <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{app.job?.title || 'Unknown Job'}</p>
                          <p className="text-xs text-gray-500">
                            {app.job?.location} • {app.job?.jobType}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {app.job?.company?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusColors[app.status]}>{app.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {format(new Date(app.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {app.reviewedAt ? format(new Date(app.reviewedAt), 'MMM d, yyyy') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Change Subscription Modal */}
      <Modal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="Assign Subscription Plan"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => {
                setSelectedPlanId(e.target.value)
                const plan = plans.find((p) => p.id === e.target.value)
                setAutoRenew(plan?.billingCycle !== 'one-time')
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a plan...</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price}/{plan.billingCycle} ({plan.tier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom End Date (optional)
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to auto-calculate based on billing cycle
            </p>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              disabled={selectedPlan?.billingCycle === 'one-time'}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-renew subscription</span>
          </label>

          {student.subscription.current && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This will cancel the student's current subscription if applicable.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowSubscriptionModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubscription}
              disabled={!selectedPlanId || isAssigning}
              isLoading={isAssigning}
            >
              Assign Plan
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
