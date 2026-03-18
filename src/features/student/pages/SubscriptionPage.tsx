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

// Service from GET /api/services endpoint (quota-based, one-time purchase)
interface SubscriptionService {
  _id: string
  name: string
  tier: SubscriptionTier
  description: string
  maxApplications: number | null
  price: number
  indianPrice?: number | null
  internationalPrice?: number | null
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
      indianPrice?: number | null
      internationalPrice?: number | null
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
function formatPrice(price: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
  }

  const symbol = currencySymbols[currency] || currency

  if (price === 0) {
    return 'Free'
  }

  return `${symbol}${price.toLocaleString()}`
}

// Helper to calculate original price before discount
function calculateOriginalPrice(price: number, discount: number): number {
  if (discount <= 0 || discount >= 100) return price
  return Math.round(price / (1 - discount / 100))
}

function getIndianPrice(service: Pick<SubscriptionService, 'indianPrice' | 'price' | 'currency'>): number | null {
  return service.indianPrice ?? (service.currency === 'INR' ? service.price : null)
}

function getInternationalPrice(service: Pick<SubscriptionService, 'internationalPrice' | 'price' | 'currency'>): number | null {
  return service.internationalPrice ?? (service.currency === 'USD' ? service.price : null)
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
  service: Pick<SubscriptionService, 'indianPrice' | 'internationalPrice' | 'price' | 'currency'>,
  preferredCurrency: SupportedCurrency
): { amount: number; currency: string } {
  if (preferredCurrency === 'USD') {
    const internationalPrice = getInternationalPrice(service)
    if (internationalPrice !== null) {
      return { amount: internationalPrice, currency: 'USD' }
    }
  }

  if (preferredCurrency === 'INR') {
    const indianPrice = getIndianPrice(service)
    if (indianPrice !== null) {
      return { amount: indianPrice, currency: 'INR' }
    }
  }

  return { amount: service.price, currency: service.currency }
}

function getAlternatePrice(
  service: Pick<SubscriptionService, 'indianPrice' | 'internationalPrice' | 'price' | 'currency'>,
  preferredCurrency: SupportedCurrency
): { amount: number; currency: string } | null {
  if (preferredCurrency === 'USD') {
    const indianPrice = getIndianPrice(service)
    if (indianPrice !== null) {
      return { amount: indianPrice, currency: 'INR' }
    }
  }

  if (preferredCurrency === 'INR') {
    const internationalPrice = getInternationalPrice(service)
    if (internationalPrice !== null) {
      return { amount: internationalPrice, currency: 'USD' }
    }
  }

  return null
}

function getPrimaryPriceLabel(
  service: Pick<SubscriptionService, 'indianPrice' | 'internationalPrice' | 'price' | 'currency'>,
  preferredCurrency: SupportedCurrency
): string {
  const displayPrice = getDisplayPrice(service, preferredCurrency)
  return formatPrice(displayPrice.amount, displayPrice.currency)
}

function getSecondaryPriceLabel(
  service: Pick<SubscriptionService, 'indianPrice' | 'internationalPrice' | 'price' | 'currency'>,
  preferredCurrency: SupportedCurrency
): string | null {
  const alternatePrice = getAlternatePrice(service, preferredCurrency)
  if (!alternatePrice) {
    return null
  }

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
  const { user } = useAuthContext()
  const [services, setServices] = useState<SubscriptionService[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscriptionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currency, setCurrency] = useState<SupportedCurrency>('USD')
  const [zonesData, setZonesData] = useState<StudentSubscriptionZones | null>(null)
  const [zoneAddons, setZoneAddons] = useState<ZoneAddon[]>([])
  const [planZoneData, setPlanZoneData] = useState<Record<string, { allZonesIncluded: boolean; zones: Array<{ id: string; name: string }> }>>({})
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

      // Fetch zone coverage per plan
      const zoneResults = await Promise.allSettled(
        sortedServices.map(async (s) => {
          const d = await api.get<{ allZonesIncluded: boolean; zoneIds: string[]; availableZones: { id: string; name: string }[] }>(
            `/admin/plans/${s._id}/zones`
          )
          const zones = d.allZonesIncluded
            ? d.availableZones
            : d.availableZones.filter((z) => d.zoneIds.includes(z.id))
          return { id: s._id, info: { allZonesIncluded: d.allZonesIncluded, zones } }
        })
      )
      const zoneDataMap: Record<string, { allZonesIncluded: boolean; zones: Array<{ id: string; name: string }> }> = {}
      for (const result of zoneResults) {
        if (result.status === 'fulfilled') {
          zoneDataMap[result.value.id] = result.value.info
        }
      }
      setPlanZoneData(zoneDataMap)
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
  const applicationLimit = currentSubscription?.applicationLimit
  const applicationsUsed = currentSubscription?.applicationsUsed ?? 0
  const hasLimitedApplications = hasPositiveApplicationLimit(applicationLimit)

  // Separate free and paid plans for display
  const freeServices = services.filter((s) => s.tier === 'free')
  const paidServices = services.filter((s) => s.tier === 'paid')

  // Quota-based subscription (all plans are now quota-based, one-time purchase)
  const applicationsRemaining = currentSubscription?.applicationsRemaining ?? 0
  const isQuotaExhausted = hasLimitedApplications && applicationsRemaining <= 0
  const paymentPrefill = {
    name: user?.student?.fullName || user?.username,
    email: user?.student?.email,
  }

  // Build comparison data - use applicationLimit pattern (2 for free, unlimited for paid)
  const comparisonFeatures = [
    {
      label: 'Active applications',
      free: freeServices.length > 0 ? '2' : null,
      paid: paidServices.length > 0 ? 'Unlimited' : null,
    },
    {
      label: 'Priority support',
      free: freeServices[0]?.prioritySupport,
      paid: paidServices[0]?.prioritySupport,
    },
    {
      label: 'Profile boost',
      free: freeServices[0]?.profileBoost,
      paid: paidServices[0]?.profileBoost,
    },
    {
      label: 'Application highlight',
      free: freeServices[0]?.applicationHighlight,
      paid: paidServices[0]?.applicationHighlight,
    },
  ].filter((f) => f.free !== null && f.free !== undefined || f.paid !== null && f.paid !== undefined)

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
                      {hasLimitedApplications && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Applications</p>
                            <p className="text-sm font-medium text-gray-900">
                              {`${applicationsUsed} / ${applicationLimit}`}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Remaining Applications */}
                      {hasLimitedApplications && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Remaining</p>
                            <p className={`text-sm font-medium ${applicationsRemaining > 0 ? 'text-gray-900' : 'text-yellow-600'}`}>
                              {applicationsRemaining > 0
                                ? `${applicationsRemaining} applications`
                                : 'Quota exhausted'}
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
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Your Usage</h4>

                    {/* Applications Usage */}
                    {hasLimitedApplications && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Applications</span>
                          <span className="font-medium text-gray-900">
                            {`${applicationsUsed} / ${applicationLimit}`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isQuotaExhausted ? 'bg-yellow-500' : 'bg-blue-600'
                            }`}
                            style={{
                              width: `${Math.min((applicationsUsed / applicationLimit) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        {isQuotaExhausted && (
                          <p className="text-xs text-yellow-600 mt-2">
                            All applications used. Buy more to continue applying.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Additional Plan Benefits from API */}
                    {/* Plan Benefits from API */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      {currentService.prioritySupport && (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-gray-600">Priority support</span>
                        </div>
                      )}
                      {currentService.profileBoost && (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="text-sm text-gray-600">Profile boost</span>
                        </div>
                      )}
                      {currentService.applicationHighlight && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-gray-600">Application highlight</span>
                        </div>
                      )}
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
                      {zonesData.accessibleZones.map((zone) => (
                        <span
                          key={zone.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {zone.name}
                        </span>
                      ))}
                      {zonesData.accessibleZones.length === 0 && (
                        <p className="text-sm text-gray-500">No zones currently accessible.</p>
                      )}
                    </div>
                  </div>

                  {/* Locked zones */}
                  {zonesData.lockedZones.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Locked Zones</p>
                      <div className="flex flex-wrap gap-2">
                        {zonesData.lockedZones.map((zone) => (
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
                                  zoneIds,
                                  prefill: paymentPrefill,
                                })
                                setSelectedLockedZoneId(null)
                                await loadData(false)
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
              // Only allow buying any plan when quota is exhausted
              // No reason to buy if user still has applications remaining
              const canBuy = isQuotaExhausted
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
                    isCurrentPlan && !canBuy
                      ? 'Current Plan'
                      : service.tier === 'free'
                      ? 'Downgrade'
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
                        onPaymentSuccess={() => loadData(false)}
                      />
                    ) : undefined
                  }
                  badge={service.badge || undefined}
                  discount={service.discount > 0 ? service.discount : undefined}
                  originalPrice={originalPrice}
                  maxApplications={service.maxApplications}
                  zoneInfo={planZoneData[service._id]}
                />
              )
            })}
          </div>
        </div>

        {/* Feature Comparison Table - Only show if we have data from both tiers */}
        {freeServices.length > 0 && paidServices.length > 0 && comparisonFeatures.length > 0 && (
          <Card className="mb-6" padding="lg">
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl font-display text-gray-900">
                  Feature Comparison
                </CardTitle>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-3 pr-4 font-semibold">Feature</th>
                      <th className="px-4 py-3 font-semibold">{freeServices[0]?.name}</th>
                      <th className="px-4 py-3 font-semibold">{paidServices[0]?.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature) => (
                      <tr key={feature.label} className="border-b border-gray-200">
                        <td className="py-3 pr-4 font-medium text-gray-900">{feature.label}</td>
                        <td className="px-4 py-3">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="inline w-4 h-4 text-blue-600" />
                            ) : (
                              <Minus className="inline w-4 h-4 text-gray-400" />
                            )
                          ) : feature.free !== null ? (
                            <span className="text-gray-900">{feature.free}</span>
                          ) : (
                            <Minus className="inline w-4 h-4 text-gray-400" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {typeof feature.paid === 'boolean' ? (
                            feature.paid ? (
                              <Check className="inline w-4 h-4 text-blue-600" />
                            ) : (
                              <Minus className="inline w-4 h-4 text-gray-400" />
                            )
                          ) : feature.paid !== null ? (
                            <span className="text-gray-900">{feature.paid}</span>
                          ) : (
                            <Minus className="inline w-4 h-4 text-gray-400" />
                          )}
                        </td>
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
