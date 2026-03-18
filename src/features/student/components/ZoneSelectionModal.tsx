import { useState } from 'react'
import { Globe } from 'lucide-react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'

interface ZoneOption {
  id: string
  name: string
  alreadyOwned?: boolean
}

interface ZoneSelectionModalProps {
  isOpen: boolean
  requiredCount: number
  zones: ZoneOption[]
  price?: number
  currency?: string
  addonName: string
  onConfirm: (zoneIds: string[]) => void
  onClose: () => void
  isLoading?: boolean
}

function formatCurrency(amount?: number, currency?: string): string {
  if (amount == null) return ''
  if (currency === 'USD') return `$${amount}`
  return `₹${amount}`
}

export default function ZoneSelectionModal({
  isOpen,
  requiredCount,
  zones,
  price,
  currency,
  addonName,
  onConfirm,
  onClose,
  isLoading = false,
}: ZoneSelectionModalProps) {
  const [selected, setSelected] = useState<string[]>([])

  const availableZones = zones.filter((z) => !z.alreadyOwned)
  const ownedZones = zones.filter((z) => z.alreadyOwned)

  const toggleZone = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((z) => z !== id)
        : prev.length < requiredCount
        ? [...prev, id]
        : prev
    )
  }

  const handleConfirm = () => {
    if (selected.length === requiredCount) {
      onConfirm(selected)
    }
  }

  const handleClose = () => {
    setSelected([])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Select Zones — ${addonName}`}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          This addon includes{' '}
          <strong>
            {requiredCount} zone{requiredCount > 1 ? 's' : ''}
          </strong>
          . Choose which zones you want to unlock.
          {price != null && (
            <span className="ml-1 font-semibold text-gray-900">
              {formatCurrency(price, currency)}
            </span>
          )}
        </p>

        <p className="text-xs font-medium text-purple-600">
          Selected: {selected.length} / {requiredCount}
        </p>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {availableZones.map((zone) => {
            const isChecked = selected.includes(zone.id)
            const isDisabled = !isChecked && selected.length >= requiredCount
            return (
              <label
                key={zone.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  isChecked
                    ? 'border-purple-300 bg-purple-50'
                    : isDisabled
                    ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => toggleZone(zone.id)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600"
                />
                <Globe className="h-4 w-4 flex-shrink-0 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">{zone.name}</span>
              </label>
            )
          })}

          {ownedZones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 opacity-70"
            >
              <input type="checkbox" checked disabled className="h-4 w-4" />
              <Globe className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span className="text-sm font-medium text-gray-500">{zone.name}</span>
              <span className="ml-auto text-xs font-medium text-green-600">Already owned</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={selected.length !== requiredCount || isLoading}
            isLoading={isLoading}
          >
            Confirm &amp; Pay
          </Button>
        </div>
      </div>
    </Modal>
  )
}
