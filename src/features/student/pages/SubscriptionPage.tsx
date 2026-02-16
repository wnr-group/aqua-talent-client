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
    } catch (error) {
      console.error('Failed loading subscription data', error)
      setErrorMessage('Unable to load subscription details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (serviceId: string) => {
    try {
      await api.post('/student/subscription', { serviceId })

      await loadData()
    } catch (error) {
      console.error('Upgrade failed', error)
      setErrorMessage('Upgrade failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen ocean-bg flex items-center justify-center">
        <p className="text-white">Loading subscription...</p>
      </div>
    )
  }

  const isFree = subscription?.subscriptionTier === 'free'
  const rawApplicationLimit = dashboard?.applicationLimit
  const hasUnlimitedApplications =
    rawApplicationLimit === null || rawApplicationLimit === Number.POSITIVE_INFINITY
  const applicationLimit = hasUnlimitedApplications ? null : (rawApplicationLimit ?? 2)
  const usageText = hasUnlimitedApplications
    ? `${dashboard?.applicationsUsed ?? 0} applications used`
    : `${dashboard?.applicationsUsed ?? 0}/${applicationLimit} applications used`

  return (
    <div className="min-h-screen ocean-bg">
      <StudentNavbar showDashboardButton={false} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Subscription
          </h1>
          <p className="text-muted-foreground mt-2">
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
          <Card className="mb-6 bg-white/95" padding="md">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Subscription</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={isFree ? 'secondary' : 'primary'}
                    className={isFree ? '' : 'bg-glow-cyan/20 text-glow-cyan border border-glow-cyan/30'}
                  >
                    {isFree ? 'Free Tier' : subscription.currentSubscription?.service?.name || 'Paid Tier'}
                  </Badge>
                </div>
              </div>

              {subscription.currentSubscription?.endDate && (
                <p className="text-sm text-gray-600">
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
          <Card className="mb-6 bg-white/95" padding="md">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{usageText}</span>
            </p>
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
              onCtaClick={() => handleUpgrade(service._id)}
            />
          ))}
        </div>

        {/* Expiry Display */}
        {subscription?.currentSubscription && (
          <Card className="mt-6 bg-white/95" padding="md">
            <p className="text-sm text-gray-600">
              Expires on{' '}
              <span className="font-medium text-gray-900">
                {new Date(
                  subscription.currentSubscription.endDate
                ).toLocaleDateString()}
              </span>
            </p>
          </Card>
        )}

        {/* Feature Comparison Table */}
        <Card className="mt-8 border-border bg-white/95" padding="lg">
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-glow-cyan" />
              <CardTitle className="text-xl font-display">
                Feature Comparison
              </CardTitle>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-3 pr-4 font-semibold">Feature</th>
                    <th className="px-4 py-3 font-semibold">Free</th>
                    <th className="px-4 py-3 font-semibold">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      Active applications
                    </td>
                    <td className="px-4 py-3">2 max</td>
                    <td className="px-4 py-3">Unlimited</td>
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      Priority support
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <Minus className="inline w-4 h-4" /> No
                    </td>
                    <td className="px-4 py-3 text-glow-teal">
                      <Check className="inline w-4 h-4" /> Yes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade benefits */}
        <Card className="mt-6 border-border bg-white/95" padding="md">
          <CardContent>
            <p className="text-sm font-medium text-gray-900 mb-2">Why upgrade?</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-glow-teal" />
                Apply to more opportunities each month
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-glow-teal" />
                Access premium features included in paid plans
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-glow-teal" />
                Keep your job search momentum without limits
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
