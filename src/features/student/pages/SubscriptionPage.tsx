import { useEffect, useState } from 'react'
import {
  Check,
  Minus,
  Sparkles,
  Crown,
  Users,
  Star,
  Clock,
  Zap,
  Globe,
  Lock,
  CheckCircle2,
} from 'lucide-react'
import Card, { CardContent, CardTitle } from '@/components/common/Card'
import Alert from '@/components/common/Alert'
import StudentNavbar from '@/components/layout/StudentNavbar'
import PricingCard from '@/features/student/components/PricingCard'
import SubscriptionPurchaseAction from '@/features/student/components/SubscriptionPurchaseAction'
import Badge from '@/components/common/Badge'
import { useAuthContext } from '@/contexts/AuthContext'
import { api } from '@/services/api/client'
import { SubscriptionTier, StudentSubscriptionZones, ZoneAddon } from '@/types'
import { startZoneAddonPayment } from '@/services/payment/studentPayment'

type SupportedCurrency = 'INR' | 'USD'

// Zone info included in service response
interface ServiceZoneInfo {
  id: string
  name: string
  description?: string
}

// Service from GET /api/services endpoint (quota-based, one-time purchase)
interface SubscriptionService {
  _id: string
  name: string
  tier: SubscriptionTier
  description: string
  maxApplications: number | null
  price: number
  priceINR: number
  priceUSD: number
  currency: string
  discount: number
  features: string[]
  badge: string | null
  displayOrder: number
  resumeDownloads: number | null
  videoViews: number | null
  prioritySupport: boolean
  profileBoost: boolean
  applicationHighlight: boolean
  // Zone information included directly in service
  allZonesIncluded?: boolean
  zones?: ServiceZoneInfo[]
}

interface ServicesResponse {
  services?: SubscriptionService[]
  plans?: SubscriptionService[]
}

interface GeoLocationResponse {
  currency?: string
  countryCode?: string
  country_code?: string
  country?: string
}

// Current subscription from GET /api/student/subscription endpoint (quota-based)
interface CurrentSubscriptionResponse {
  subscriptionTier: SubscriptionTier
  status: string
  isActive: boolean
  inGracePeriod: boolean
  currentSubscription: {
    id: string
    service: {
      _id?: string
      name: string
      tier: string
      price: number
      priceINR?: number | null
      priceUSD?: number | null
      currency: string
      discount: number
      badge: string | null
      maxApplications: number | null
      features?: string[]
      prioritySupport: boolean
      profileBoost: boolean
      applicationHighlight: boolean
    }
    startDate: string
    endDate: string | null
    status: string
  } | null
  applicationLimit: number | null
  applicationsUsed: number
  applicationsRemaining: number | null
}

// Helper to format price with currency (quota-based, no recurring billing)
function formatPrice(price: number | null | undefined, currency: string): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
  }

  const symbol = currencySymbols[currency] || currency
  const safePrice = price ?? 0

  if (safePrice === 0) {
    return 'Free'
  }

  return `${symbol}${safePrice.toLocaleString()}`
}

// Helper to calculate original price before discount
function calculateOriginalPrice(price: number | null | undefined, discount: number): number {
  const safePrice = price ?? 0
  if (discount <= 0 || discount >= 100) return safePrice
  return Math.round(safePrice / (1 - discount / 100))
}

function getIndianPrice(service: { priceINR?: number | null; price?: number }): number {
  return service.priceINR ?? service.price ?? 0
}

function getInternationalPrice(service: { priceUSD?: number | null }): number {
  return service.priceUSD ?? 0
}

function resolveCurrency(geoLocation?: GeoLocationResponse | null): SupportedCurrency {
  const responseCurrency = geoLocation?.currency?.toUpperCase()
  if (responseCurrency === 'INR' || responseCurrency === 'USD') {
    return responseCurrency
  }

  const countryCode = (geoLocation?.countryCode || geoLocation?.country_code || '').toUpperCase()
  if (countryCode === 'IN') {
    return 'INR'
  }

  if (geoLocation?.country?.toLowerCase() === 'india') {
    return 'INR'
  }

  return 'USD'
}

function getDisplayPrice(
  service: { priceINR?: number | null; priceUSD?: number | null; price?: number },
  preferredCurrency: SupportedCurrency
): { amount: number; currency: string } {
  if (preferredCurrency === 'USD') {
    return { amount: getInternationalPrice(service), currency: 'USD' }
  }

  return { amount: getIndianPrice(service), currency: 'INR' }
}

function getAlternatePrice(
  service: { priceINR?: number | null; priceUSD?: number | null; price?: number },
  preferredCurrency: SupportedCurrency
): { amount: number; currency: string } {
  if (preferredCurrency === 'USD') {
    return { amount: getIndianPrice(service), currency: 'INR' }
  }

  return { amount: getInternationalPrice(service), currency: 'USD' }
}

function getPrimaryPriceLabel(
  service: { priceINR?: number | null; priceUSD?: number | null; price?: number },
  preferredCurrency: SupportedCurrency
): string {
  const displayPrice = getDisplayPrice(service, preferredCurrency)
  return formatPrice(displayPrice.amount, displayPrice.currency)
}

function getSecondaryPriceLabel(
  service: { priceINR?: number | null; priceUSD?: number | null; price?: number },
  preferredCurrency: SupportedCurrency
): string {
  const alternatePrice = getAlternatePrice(service, preferredCurrency)
  const suffix = alternatePrice.currency === 'USD' ? 'International' : 'India'
  return `${formatPrice(alternatePrice.amount, alternatePrice.currency)} ${suffix}`
}

function hasPositiveApplicationLimit(limit: number | null | undefined): limit is number {
  return typeof limit === 'number' && limit > 0
}

function getPlanCardFeatures(service: Pick<SubscriptionService, 'maxApplications' | 'features'>): string[] {
  const sanitizedFeatures = service.features.filter(
    (feature) => !/application/i.test(feature)
  )

  if (!hasPositiveApplicationLimit(service.maxApplications)) {
    return sanitizedFeatures
  }

  return [`${service.maxApplications} applications`, ...sanitizedFeatures]
}

function isVisibleService(service: Pick<SubscriptionService, 'name'>): boolean {
  return !service.name.trim().toLowerCase().includes('spotlight')
}

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuthContext()
  const [services, setServices] = useState<SubscriptionService[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscriptionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currency, setCurrency] = useState<SupportedCurrency>('USD')
  const [zonesData, setZonesData] = useState<StudentSubscriptionZones | null>(null)
  const [zoneAddons, setZoneAddons] = useState<ZoneAddon[]>([])
  const [selectedLockedZoneId, setSelectedLockedZoneId] = useState<string | null>(null)
  const [isUnlockingZone, setIsUnlockingZone] = useState(false)

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true)
      }

      setErrorMessage(null)
      const [servicesData, subscriptionData, geoLocation, zonesResponse, addonsResponse] = await Promise.all([
        api.get<ServicesResponse>('/services'),
        api.get<CurrentSubscriptionResponse>('/student/subscription'),
        api.get<GeoLocationResponse>('/geo-location').catch(() => null),
        api.get<StudentSubscriptionZones>('/student/subscription/zones').catch(() => null),
        api.get<{ addons: ZoneAddon[] }>('/student/zone-addons').catch(() => null),
      ])

      // Sort services by displayOrder
      const sortedServices = (servicesData.services || servicesData.plans || [])
        .filter(isVisibleService)
        .sort((a, b) => a.displayOrder - b.displayOrder)

      setServices(sortedServices)
      setCurrentSubscription(subscriptionData)
      setCurrency(resolveCurrency(geoLocation))
      if (zonesResponse) setZonesData(zonesResponse)
      if (addonsResponse) setZoneAddons(addonsResponse.addons)
      // Zone data is now included directly in the /services response - no need for additional API calls
    } catch {
      setErrorMessage('Unable to load subscription details. Please try again.')
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">Loading subscription...</p>
      </div>
    )
  }

  // Extract current plan details from subscription response
  const currentService = currentSubscription?.currentSubscription?.service
  const currentTier = currentSubscription?.subscriptionTier || 'free'
  const isFree = currentTier === 'free'

  // Usage data from API
  const applicationLimit = currentSubscription?.applicationLimit ?? null
const applicationsUsed = currentSubscription?.applicationsUsed ?? 0

const hasLimitedApplications =
  typeof applicationLimit === 'number' && applicationLimit > 0

const applicationsRemaining =
  hasLimitedApplications
    ? Math.max(0, applicationLimit - applicationsUsed)
    : null

const isQuotaExhausted =
  hasLimitedApplications && applicationsRemaining === 0
  const paymentPrefill = {
    name: user?.student?.fullName || user?.username,
    email: user?.student?.email,
  }

  // Build comparison data dynamically from all services
  type FeatureValue = string | number | boolean | null
  interface ComparisonFeature {
    label: string
    icon?: typeof Check
    values: Record<string, FeatureValue>
  }

  const buildComparisonFeatures = (): ComparisonFeature[] => {
    if (services.length === 0) return []

    const features: ComparisonFeature[] = []

    // Applications
    features.push({
      label: 'Job applications',
      values: Object.fromEntries(
        services.map((s) => [
          s._id,
          s.maxApplications === null ? 'Unlimited' : s.maxApplications,
        ])
      ),
    })

    // Zone access
    features.push({
      label: 'Zone access',
      values: Object.fromEntries(
        services.map((s) => {
          if (s.allZonesIncluded) return [s._id, 'All zones']
          if (s.zones && s.zones.length > 0) return [s._id, `${s.zones.length} zone${s.zones.length > 1 ? 's' : ''}`]
          return [s._id, 'View only']
        })
      ),
    })

    // Resume downloads
    const hasResumeDownloads = services.some((s) => s.resumeDownloads !== null && s.resumeDownloads !== undefined)
    if (hasResumeDownloads) {
      features.push({
        label: 'Resume downloads',
        values: Object.fromEntries(
          services.map((s) => [
            s._id,
            s.resumeDownloads === null ? 'Unlimited' : s.resumeDownloads ?? false,
          ])
        ),
      })
    }

    // Video profile views
    const hasVideoViews = services.some((s) => s.videoViews !== null && s.videoViews !== undefined)
    if (hasVideoViews) {
      features.push({
        label: 'Video profile views',
        values: Object.fromEntries(
          services.map((s) => [
            s._id,
            s.videoViews === null ? 'Unlimited' : s.videoViews ?? false,
          ])
        ),
      })
    }

    // Priority support
    features.push({
      label: 'Priority support',
      values: Object.fromEntries(services.map((s) => [s._id, s.prioritySupport])),
    })

    // Profile boost
    features.push({
      label: 'Profile boost in search',
      values: Object.fromEntries(services.map((s) => [s._id, s.profileBoost])),
    })

    // Application highlight
    features.push({
      label: 'Application highlight',
      values: Object.fromEntries(services.map((s) => [s._id, s.applicationHighlight])),
    })

    return features
  }

  const comparisonFeatures = buildComparisonFeatures()

  const renderFeatureValue = (value: FeatureValue | undefined) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="inline w-5 h-5 text-green-600" />
      ) : (
        <Minus className="inline w-5 h-5 text-gray-300" />
      )
    }
    if (value === null || value === undefined || value === 0) {
      return <Minus className="inline w-5 h-5 text-gray-300" />
    }
    return <span className="text-gray-900 font-medium">{value}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <StudentNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-500 mt-2">
            Manage your subscription and explore available plans.
          </p>
        </div>

        {errorMessage && (
          <Alert variant="error" className="mb-6">
            {errorMessage}
          </Alert>
        )}

        {/* Current Plan Section */}
        {currentService && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-blue-600" />
              Your Current Plan
            </h2>

            <Card className={`relative overflow-hidden ${!isFree ? 'border-blue-500 border-2' : ''}`}>
              {!isFree && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Active
                </div>
              )}
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentService.name}
                      </h3>
                      <Badge variant={isFree ? 'secondary' : 'success'} className="text-sm">
                        {currentService.tier === 'free' ? 'Free Tier' : 'Premium'}
                      </Badge>
                      {currentService.badge && (
                        <Badge variant="primary" className="text-sm">
                          {currentService.badge}
                        </Badge>
                      )}
                    </div>

                    {/* Plan Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {/* Applications Quota */}
                      {(
                       <div className="flex items-start gap-3">
  <div className="p-2 bg-green-50 rounded-lg">
    <Users className="w-4 h-4 text-green-600" />
  </div>
  <div>
    <p className="text-xs text-gray-500">Applications</p>
    <p className="text-sm font-medium text-gray-900">
      {hasLimitedApplications
  ? `${applicationsUsed} / ${applicationLimit}`
  : `${applicationsUsed} / Unlimited`}
    </p>
  </div>
</div>
                      )}

                      {/* Remaining Applications */}
                      {(
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Remaining</p>
                            <p className={`text-sm font-medium ${(applicationsRemaining ?? 0) > 0 ? 'text-gray-900' : 'text-yellow-600'}`}>
                              {hasLimitedApplications
  ? (applicationsRemaining ?? 0) > 0
    ? `${applicationsRemaining} applications`
    : 'Quota exhausted'
  : 'Unlimited'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Star className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              {getPrimaryPriceLabel(currentService, currency)}
                            </p>
                            {getSecondaryPriceLabel(currentService, currency) && (
                              <p className="text-xs text-gray-500">
                                {getSecondaryPriceLabel(currentService, currency)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    {currentService.features && currentService.features.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Included Features:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {currentService.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Usage Stats Sidebar */}
                  <div className="lg:border-l lg:border-gray-200 lg:pl-6">
  <h4 className="text-sm font-semibold text-gray-700 mb-4">
    Your Usage
  </h4>

  
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Applications</span>
       <span className="font-medium text-gray-900">
  {hasLimitedApplications
    ? `${applicationsUsed} / ${applicationLimit}`
    : `${applicationsUsed} / Unlimited`}
</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className={`h-2 rounded-full ${
      isQuotaExhausted ? 'bg-yellow-500' : 'bg-blue-600'
    }`}
   style={{
  width: hasLimitedApplications
    ? `${Math.min(
        (applicationsUsed / applicationLimit) * 100,
        100
      )}%`
    : '100%',
}}
  />
</div>

      <p className="text-xs mt-2 text-yellow-600">
        {hasLimitedApplications
  ? (applicationsRemaining ?? 0) > 0
    ? `${applicationsRemaining} applications remaining`
    : 'All applications used. Buy more to continue applying.'
  : `You have applied ${applicationsUsed} jobs (Unlimited plan)`}
      </p>
    </div>
   
  
</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Zones Section */}
        {zonesData && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              My Zones
            </h2>

            {zonesData.allZonesIncluded ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Global Access Included</p>
                      <p className="text-sm text-gray-500">
                        Your plan includes jobs from all geographic zones worldwide.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 space-y-5">
                  {/* Accessible zones */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Accessible Zones</p>
                    <div className="flex flex-wrap gap-2">
                      {(zonesData.accessibleZones ?? []).map((zone) => (
                        <span
                          key={zone.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {zone.name}
                        </span>
                      ))}
                      {(!zonesData.accessibleZones || zonesData.accessibleZones.length === 0) && (
                        <p className="text-sm text-gray-500">No zones currently accessible.</p>
                      )}
                    </div>
                  </div>

                  {/* Locked zones */}
                  {(zonesData.lockedZones ?? []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Locked Zones</p>
                      <div className="flex flex-wrap gap-2">
                        {(zonesData.lockedZones ?? []).map((zone) => (
                          <button
                            key={zone.id}
                            onClick={() =>
                              setSelectedLockedZoneId(
                                selectedLockedZoneId === zone.id ? null : zone.id
                              )
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              selectedLockedZoneId === zone.id
                                ? 'bg-amber-100 border-amber-300 text-amber-800'
                                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            {zone.name}
                            <span className="text-xs ml-0.5 opacity-70">· Unlock</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zone addon purchase panel */}
                  {selectedLockedZoneId && zoneAddons.length > 0 && (
                    <div className="border border-amber-200 rounded-xl bg-amber-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-amber-800">
                          Choose an unlock option
                        </p>
                        <button
                          onClick={() => setSelectedLockedZoneId(null)}
                          className="text-amber-600 hover:text-amber-800 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="space-y-2">
                        {zoneAddons.map((addon) => (
                          <button
                            key={addon.id}
                            disabled={isUnlockingZone}
                            onClick={async () => {
                              setIsUnlockingZone(true)
                              try {
                                const zoneIds =
                                  addon.isFlexible
                                    ? [selectedLockedZoneId]
                                    : undefined
                                await startZoneAddonPayment({
                                  addonId: addon.id,
                                  zoneIds: zoneIds ?? [],
                                  currency,
                                  prefill: paymentPrefill,
                                })
                                setSelectedLockedZoneId(null)
                                await loadData(false)
                                await refreshUser()
                              } catch {
                                // Payment cancelled or failed — no action needed
                              } finally {
                                setIsUnlockingZone(false)
                              }
                            }}
                            className="w-full flex items-start gap-3 p-3 bg-white border border-amber-200 rounded-lg hover:border-amber-400 transition-colors text-left disabled:opacity-50"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{addon.name}</p>
                              <p className="text-xs text-gray-500">{addon.description}</p>
                            </div>
                            <span className="text-sm font-bold text-amber-700 whitespace-nowrap">
                              {formatPrice(addon.price, addon.currency)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Available Plans Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            {isFree ? 'Upgrade Your Plan' : 'Available Plans'}
          </h2>

          <div
            className={`grid gap-6 ${
              services.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : services.length === 2
                ? 'grid-cols-1 lg:grid-cols-2'
                : services.length <= 4
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {services.map((service) => {
              // Compare by _id if available, otherwise by name
              const isCurrentPlan = currentService
                ? (currentService._id === service._id || currentService.name === service.name)
                : false
              const shouldShowPaymentAction = service.tier !== 'free'

              // V2 Business Rules:
              // Rule 1: Same plan with remaining apps - BLOCKED
              const isSamePlanWithRemainingApps = isCurrentPlan && hasLimitedApplications && (applicationsRemaining ?? 0) > 0
              // Rule 5: Free to paid - ALWAYS ALLOWED
              const isUpgradeFromFree = isFree && service.tier === 'paid'
              // Allow buying if: quota exhausted OR upgrading from free OR switching to different plan
              const canBuy = isQuotaExhausted || isUpgradeFromFree || (!isCurrentPlan && !isSamePlanWithRemainingApps)

              // Determine if this is a downgrade (for warning)
              const currentMaxApps = currentService?.maxApplications ?? 2
              const newMaxApps = service.maxApplications
              const isDowngrade =
                !isFree &&
                service.tier === 'paid' &&
                newMaxApps !== null &&
                (currentMaxApps === null || newMaxApps < currentMaxApps)

              const displayPrice = getDisplayPrice(service, currency)

              const originalPrice =
                service.discount > 0
                  ? formatPrice(
                      calculateOriginalPrice(displayPrice.amount, service.discount),
                      displayPrice.currency
                    )
                  : undefined

              return (
                <PricingCard
                  key={service._id}
                  name={service.name}
                  price={getPrimaryPriceLabel(service, currency)}
                  secondaryPrice={getSecondaryPriceLabel(service, currency)}
                  description={service.description}
                  features={getPlanCardFeatures(service)}
                  isCurrentPlan={isCurrentPlan && !canBuy}
                  ctaLabel={
                    isSamePlanWithRemainingApps
                      ? `${applicationsRemaining} apps remaining`
                      : isCurrentPlan
                      ? 'Current Plan'
                      : isDowngrade
                      ? 'Downgrade'
                      : service.tier === 'free'
                      ? 'Free Tier'
                      : 'Buy'
                  }
                  onCtaClick={undefined}
                  actionButton={
                    shouldShowPaymentAction ? (
                      <SubscriptionPurchaseAction
                        serviceId={service._id}
                        currency={currency}
                        disabled={!canBuy}
                        prefill={paymentPrefill}
                        onPaymentSuccess={async () => {
                          await loadData(false)
                          await refreshUser()
                        }}
                      />
                    ) : undefined
                  }
                  badge={service.badge || undefined}
                  discount={service.discount > 0 ? service.discount : undefined}
                  originalPrice={originalPrice}
                  maxApplications={service.maxApplications}
                  zoneInfo={
                    service.zones || service.allZonesIncluded !== undefined
                      ? {
                          allZonesIncluded: service.allZonesIncluded ?? false,
                          zones: (service.zones ?? []).map((z) => ({ id: z.id, name: z.name })),
                        }
                      : undefined
                  }
                />
              )
            })}
          </div>
        </div>

        {/* Feature Comparison Table - Show if we have multiple services */}
        {services.length > 1 && comparisonFeatures.length > 0 && (
          <Card className="mb-6" padding="lg">
            <CardContent>
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl font-display text-gray-900">
                  Feature Comparison
                </CardTitle>
              </div>

              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-4 pr-4 text-left font-semibold text-gray-600 min-w-[180px]">
                        Feature
                      </th>
                      {services.map((service) => {
                        const isCurrentPlan = currentService
                          ? currentService._id === service._id || currentService.name === service.name
                          : false
                        return (
                          <th
                            key={service._id}
                            className={`px-4 py-4 text-center font-semibold min-w-[120px] ${
                              isCurrentPlan ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span>{service.name}</span>
                              {isCurrentPlan && (
                                <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                              {service.badge && !isCurrentPlan && (
                                <span className="text-xs font-normal text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                  {service.badge}
                                </span>
                              )}
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Price row */}
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="py-4 pr-4 font-semibold text-gray-900">Price</td>
                      {services.map((service) => {
                        const isCurrentPlan = currentService
                          ? currentService._id === service._id || currentService.name === service.name
                          : false
                        return (
                          <td
                            key={service._id}
                            className={`px-4 py-4 text-center ${isCurrentPlan ? 'bg-blue-50' : ''}`}
                          >
                            <div className="font-bold text-gray-900">
                              {getPrimaryPriceLabel(service, currency)}
                            </div>
                            {service.tier !== 'free' && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {getSecondaryPriceLabel(service, currency)}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                    {/* Feature rows */}
                    {comparisonFeatures.map((feature, idx) => (
                      <tr
                        key={feature.label}
                        className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                      >
                        <td className="py-4 pr-4 font-medium text-gray-700">{feature.label}</td>
                        {services.map((service) => {
                          const isCurrentPlan = currentService
                            ? currentService._id === service._id || currentService.name === service.name
                            : false
                          return (
                            <td
                              key={service._id}
                              className={`px-4 py-4 text-center ${isCurrentPlan ? 'bg-blue-50' : ''}`}
                            >
                              {renderFeatureValue(feature.values[service._id])}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
