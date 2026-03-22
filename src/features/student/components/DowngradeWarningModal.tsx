import { AlertTriangle, Globe } from 'lucide-react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'

interface ZoneInfo {
  id: string
  name: string
}

interface DowngradeWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  currentPlanName: string
  newPlanName: string
  lostZones: ZoneInfo[]
  preservedAddonZones?: ZoneInfo[]
  newPlanPrice: number
  currency: 'INR' | 'USD'
}

export default function DowngradeWarningModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  currentPlanName,
  newPlanName,
  lostZones,
  preservedAddonZones = [],
  newPlanPrice,
  currency,
}: DowngradeWarningModalProps) {
  const formatPrice = (amount: number) => {
    if (currency === 'USD') return `$${amount}`
    return `₹${amount.toLocaleString()}`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Plan Change">
      <div className="space-y-5">
        {/* Warning Header */}
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">
              Downgrading from {currentPlanName} to {newPlanName}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              This change will affect your zone access.
            </p>
          </div>
        </div>

        {/* Zones Being Lost */}
        {lostZones.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-500" />
              You will lose access to:
            </p>
            <div className="flex flex-wrap gap-2">
              {lostZones.map((zone) => (
                <Badge key={zone.id} variant="destructive" className="text-sm">
                  {zone.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Jobs in these zones will become inaccessible until you upgrade or purchase zone add-ons.
            </p>
          </div>
        )}

        {/* Preserved Addon Zones */}
        {preservedAddonZones.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-500" />
              These add-on zones will be preserved:
            </p>
            <div className="flex flex-wrap gap-2">
              {preservedAddonZones.map((zone) => (
                <Badge key={zone.id} variant="success" className="text-sm">
                  {zone.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">New plan price</span>
            <span className="font-semibold text-gray-900">{formatPrice(newPlanPrice)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} isLoading={isLoading}>
            Confirm Downgrade
          </Button>
        </div>
      </div>
    </Modal>
  )
}
