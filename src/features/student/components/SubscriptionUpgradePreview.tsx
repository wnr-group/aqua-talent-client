import { ArrowRight, Check, AlertTriangle } from 'lucide-react'
import Badge from '@/components/common/Badge'

interface ZoneInfo {
  id: string
  name: string
}

interface PlanInfo {
  id: string
  name: string
  maxApplications: number | null
  zones?: ZoneInfo[]
  allZonesIncluded?: boolean
}

interface SubscriptionUpgradePreviewProps {
  currentPlan: PlanInfo
  newPlan: PlanInfo
  applicationsUsed: number
  applicationsRemaining: number
  currency: 'INR' | 'USD'
  newPlanPrice: number
}

export default function SubscriptionUpgradePreview({
  currentPlan,
  newPlan,
  applicationsUsed,
  applicationsRemaining,
  currency,
  newPlanPrice,
}: SubscriptionUpgradePreviewProps) {
  const isUpgrade =
    (newPlan.maxApplications === null && currentPlan.maxApplications !== null) ||
    (newPlan.maxApplications !== null &&
      currentPlan.maxApplications !== null &&
      newPlan.maxApplications > currentPlan.maxApplications)

  const isDowngrade = !isUpgrade && currentPlan.id !== newPlan.id

  // Calculate new total applications (stacking)
  const newPlanApps = newPlan.maxApplications ?? 'Unlimited'
  const stackedTotal =
    newPlan.maxApplications === null
      ? 'Unlimited'
      : newPlan.maxApplications + applicationsRemaining

  // Determine zones that will be lost on downgrade
  const newZoneIds = new Set(newPlan.zones?.map((z) => z.id) ?? [])
  const lostZones =
    currentPlan.allZonesIncluded && !newPlan.allZonesIncluded
      ? currentPlan.zones?.filter((z) => !newZoneIds.has(z.id)) ?? []
      : currentPlan.zones?.filter((z) => !newZoneIds.has(z.id) && !newPlan.allZonesIncluded) ?? []

  const formatPrice = (amount: number) => {
    if (currency === 'USD') return `$${amount}`
    return `₹${amount.toLocaleString()}`
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
      <h4 className="text-sm font-semibold text-gray-900">
        {isUpgrade ? 'Upgrade Preview' : isDowngrade ? 'Downgrade Preview' : 'Plan Change Preview'}
      </h4>

      {/* Plan Change Visual */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Current Plan</p>
          <p className="font-semibold text-gray-900">{currentPlan.name}</p>
          <p className="text-sm text-gray-600">
            {applicationsUsed} of {currentPlan.maxApplications ?? '∞'} used
          </p>
        </div>

        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-600">New Plan</p>
          <p className="font-semibold text-blue-900">{newPlan.name}</p>
          <p className="text-sm text-blue-700">{formatPrice(newPlanPrice)}</p>
        </div>
      </div>

      {/* Application Stacking Info */}
      {applicationsRemaining > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-800">Your remaining applications will be preserved</p>
            <p className="text-green-700 mt-1">
              {newPlanApps === 'Unlimited' ? (
                <>New plan has unlimited applications</>
              ) : (
                <>
                  {newPlanApps} (new plan) + {applicationsRemaining} (remaining) ={' '}
                  <strong>{stackedTotal} total applications</strong>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Zone Loss Warning for Downgrade */}
      {isDowngrade && lostZones.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">You will lose access to these zones:</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {lostZones.map((zone) => (
                <Badge key={zone.id} variant="warning" className="text-xs">
                  {zone.name}
                </Badge>
              ))}
            </div>
            <p className="text-amber-700 mt-2 text-xs">
              Jobs in these zones will become inaccessible. Zones purchased as add-ons will be preserved.
            </p>
          </div>
        </div>
      )}

      {/* Premium to Limited Warning */}
      {currentPlan.allZonesIncluded && !newPlan.allZonesIncluded && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">
              You currently have access to all zones
            </p>
            <p className="text-amber-700 mt-1">
              The new plan only includes {newPlan.zones?.length ?? 0} zone(s). You will lose access
              to jobs in other zones.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
