import { useEffect, useState } from 'react'
import { Check, Minus, Sparkles } from 'lucide-react'
import Card, { CardContent, CardTitle } from '@/components/common/Card'
import Alert from '@/components/common/Alert'
import StudentNavbar from '@/components/layout/StudentNavbar'
import PricingCard from '@/features/student/components/PricingCard'
import Badge from '@/components/common/Badge'
import { api } from '@/services/api/client'

interface ServicePlan {
  _id: string
  name: string
  price: number
  description: string
  features: string[]
  maxApplications?: number
}

interface ServicesResponse {
  services: ServicePlan[]
}

interface CurrentSubscription {
  service?: {
    _id: string
    name: string
  }
  endDate: string
}

interface SubscriptionResponse {
  subscriptionTier: 'free' | 'paid'
  currentSubscription?: CurrentSubscription | null
}

interface DashboardResponse {
  applicationsUsed: number
  applicationLimit?: number | null
}

export default function SubscriptionPage() {
  const [services, setServices] = useState<ServicePlan[]>([])
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [processingServiceId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setErrorMessage(null)
      const [servicesData, subscriptionData, dashboardData] = await Promise.all([
        api.get<ServicesResponse | ServicePlan[]>('/services'),
        api.get<SubscriptionResponse>('/student/subscription'),
        api.get<DashboardResponse>('/student/dashboard'),
      ])

      setServices(Array.isArray(servicesData) ? servicesData : servicesData.services || [])
      setSubscription(subscriptionData)
      setDashboard(dashboardData)
    } catch {
      setErrorMessage('Unable to load subscription details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (service: ServicePlan) => {
    if (processingServiceId) return

    setErrorMessage(null)
    setProcessingServiceId(service._id)

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID

    try {
      let paymentId: string

      if (razorpayKey) {
        // Real Razorpay payment flow (production)
        if (!service.price || service.price <= 0) {
          setErrorMessage('Invalid plan amount. Please select a valid subscription plan.')
          return
        }

        const paymentResult = await openRazorpayCheckout({
          key: razorpayKey,
          amount: Math.round(service.price * 100),
          currency: 'INR',
          name: 'AquaTalent',
          description: `${service.name} Subscription`,
          prefill: {
            name: user?.student?.fullName || user?.username,
            email: user?.student?.email,
          },
          notes: {
            serviceId: service._id,
            serviceName: service.name,
          },
          themeColor: '#22d3ee',
        })
        paymentId = paymentResult.paymentId
      } else {
        // Dev / mock mode — Razorpay key not configured, apply upgrade directly
        paymentId = `mock_pay_${Date.now()}`
      }

      await api.post('/student/subscription', {
        serviceId: service._id,
        paymentId,
      })

      await loadData()

      navigate('/subscription/success', {
        state: {
          planName: service.name,
          paymentId,
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed. Please try again.'
      setErrorMessage(message)
    } finally {
      setProcessingServiceId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">Loading subscription...</p>
      </div>
    )
  }

  const isFree = subscription?.subscriptionTier === 'free'
  const applicationLimit = dashboard?.applicationLimit
  const hasUnlimitedApplications = applicationLimit === Number.POSITIVE_INFINITY
  const usageText = hasUnlimitedApplications
    ? `${dashboard?.applicationsUsed ?? 0} applications used`
    : `${dashboard?.applicationsUsed ?? 0} / ${applicationLimit ?? '-'} applications`

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      <StudentNavbar showDashboardButton={false} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Subscription
          </h1>
          <p className="text-gray-500 mt-2">
            Choose a plan that matches your job search pace.
          </p>
        </div>

        {errorMessage && (
          <Alert variant="error" className="mb-6">
            {errorMessage}
          </Alert>
        )}

        {/* Current subscription status */}
        {subscription && (
          <Card className="mb-6" padding="md">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Subscription</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={isFree ? 'secondary' : 'primary'}
                    className={isFree ? '' : 'bg-teal-100 text-teal-700 border border-teal-200'}
                  >
                    {isFree ? 'Free Tier' : subscription.currentSubscription?.service?.name || 'Paid Tier'}
                  </Badge>
                </div>
              </div>

              {subscription.currentSubscription?.endDate && (
                <p className="text-sm text-gray-500">
                  Expires on{' '}
                  <span className="font-medium text-gray-900">
                    {new Date(subscription.currentSubscription.endDate).toLocaleDateString()}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Usage Display */}
        {dashboard && (
          <Card className="mb-6" padding="md">
            <div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{usageText}</span>
              </p>
            </div>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Free Plan */}
          <PricingCard
            name="Free"
            price="₹0/month"
            description="Great for getting started"
            features={[
              'Up to 2 active applications',
              'Basic profile visibility',
              'Standard email notifications',
            ]}
            isCurrentPlan={isFree}
            ctaLabel="Continue Free"
          />

          {/* Paid Plans from API */}
          {services.map((service) => (
            <PricingCard
              key={service._id}
              name={service.name}
              price={`₹${service.price}/month`}
              description={service.description}
              features={service.features}
              isCurrentPlan={
                subscription?.currentSubscription?.service?._id === service._id
              }
              ctaLabel="Upgrade"
              onCtaClick={() => handleUpgrade(service)}
              isProcessing={processingServiceId === service._id}
            />
          ))}
        </div>

        {/* Expiry Display */}
        {subscription?.currentSubscription && (
          <Card className="mt-6" padding="md">
            <div>
              <p className="text-sm text-gray-500">
                Expires on{' '}
                <span className="font-medium text-gray-900">
                  {new Date(
                    subscription.currentSubscription.endDate
                  ).toLocaleDateString()}
                </span>
              </p>
            </div>
          </Card>
        )}

        {/* Feature Comparison Table */}
        <Card className="mt-8" padding="lg">
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-xl font-display text-gray-900">
                Feature Comparison
              </CardTitle>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-3 pr-4 font-semibold">Feature</th>
                    <th className="px-4 py-3 font-semibold">Free</th>
                    <th className="px-4 py-3 font-semibold">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      Active applications
                    </td>
                    <td className="px-4 py-3 text-gray-900">2 max</td>
                    <td className="px-4 py-3 text-gray-900">Unlimited</td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      Priority support
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <Minus className="inline w-4 h-4" /> No
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <Check className="inline w-4 h-4 text-teal-600" /> Yes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade benefits */}
        <Card className="mt-6" padding="md">
          <CardContent>
            <p className="text-sm font-medium text-gray-900 mb-2">Why upgrade?</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                Apply to more opportunities each month
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                Access premium features included in paid plans
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                Keep your job search momentum without limits
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
