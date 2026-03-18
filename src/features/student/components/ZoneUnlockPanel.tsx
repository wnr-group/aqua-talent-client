import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Lock, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import Button from '@/components/common/Button'
import Alert from '@/components/common/Alert'
import { useNotification } from '@/contexts/NotificationContext'
import { api } from '@/services/api/client'
import { startPayPerJobPayment, startZoneAddonPayment } from '@/services/payment/studentPayment'
import ZoneSelectionModal from './ZoneSelectionModal'
import type { ZoneLockReason, UnlockOption, StudentSubscriptionZones } from '@/types/entities'
import type { RazorpayPrefill } from '@/services/payment/razorpay'

interface ZoneUnlockPanelProps {
  zoneLockReason: ZoneLockReason
  jobId: string
  prefill?: RazorpayPrefill
  onUnlocked: () => void
}

function formatCurrency(amount?: number, currency?: string): string {
  if (amount == null) return ''
  if (currency === 'USD') return `$${amount}`
  return `₹${amount}`
}

export default function ZoneUnlockPanel({
  zoneLockReason,
  jobId,
  prefill,
  onUnlocked,
}: ZoneUnlockPanelProps) {
  const { success, error: showError } = useNotification()
  const [busyOptionIndex, setBusyOptionIndex] = useState<number | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [isFetchingZones, setIsFetchingZones] = useState(false)
  const [modalZones, setModalZones] = useState<Array<{ id: string; name: string; alreadyOwned?: boolean }> | null>(null)
  const [pendingOption, setPendingOption] = useState<{ option: UnlockOption; index: number } | null>(null)

  const handleUnlock = async (option: UnlockOption, index: number) => {
    setInlineError(null)
    setBusyOptionIndex(index)
    try {
      if (option.type === 'pay-per-job') {
        await startPayPerJobPayment(jobId, prefill)
        success('Job unlocked successfully!')
        onUnlocked()
      } else if (option.type === 'zone-addon' && option.addonId) {
        if (option.unlockAllZones === true) {
          // Addon that unlocks all zones — no zone selection needed
          await startZoneAddonPayment({
            addonId: option.addonId,
            zoneIds: [],
            currency: 'INR',
            prefill,
          })
          success('Zone unlocked successfully!')
          onUnlocked()
        } else if ((option.zonesIncluded ?? 1) > 1) {
          // Bundle addon — show zone selection modal
          setBusyOptionIndex(null)
          setIsFetchingZones(true)
          try {
            const zonesData = await api.get<StudentSubscriptionZones>('/student/subscription/zones')
            const accessibleIds = new Set(zonesData.accessibleZones.map((z) => z.id))
            const allZones = [...zonesData.accessibleZones, ...zonesData.lockedZones]
            setModalZones(
              allZones.map((z) => ({ id: z.id, name: z.name, alreadyOwned: accessibleIds.has(z.id) }))
            )
            setPendingOption({ option, index })
          } catch {
            showError('Failed to load zones. Please try again.')
          } finally {
            setIsFetchingZones(false)
          }
          return
        } else {
          // Single-zone addon — use the locked zone directly
          await startZoneAddonPayment({
            addonId: option.addonId,
            zoneIds: [zoneLockReason.zoneId],
            currency: 'INR',
            prefill,
          })
          success('Zone unlocked successfully!')
          onUnlocked()
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.'
      if (/cancelled/i.test(message)) {
        // user dismissed checkout — no error UI needed
      } else {
        setInlineError(message)
        showError(message)
      }
    } finally {
      setBusyOptionIndex(null)
    }
  }

  const handleModalConfirm = async (zoneIds: string[]) => {
    if (!pendingOption) return
    const { option, index } = pendingOption
    setBusyOptionIndex(index)
    try {
      await startZoneAddonPayment({
        addonId: option.addonId!,
        zoneIds,
        currency: 'INR',
        prefill,
      })
      setModalZones(null)
      setPendingOption(null)
      success('Zone unlocked successfully!')
      onUnlocked()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.'
      if (!/cancelled/i.test(message)) {
        setInlineError(message)
        showError(message)
      }
    } finally {
      setBusyOptionIndex(null)
    }
  }

  const isProcessing = busyOptionIndex !== null || isFetchingZones

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4 bg-amber-100 border-b border-amber-200">
        <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lock className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <p className="font-semibold text-amber-900 text-sm">Zone-locked job</p>
          <p className="text-xs text-amber-700 mt-0.5">{zoneLockReason.message}</p>
        </div>
      </div>

      {/* Unlock options */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unlock options</p>

        {zoneLockReason.unlockOptions.map((option, index) => {
          if (option.type === 'upgrade-plan') {
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    )}
                  </div>
                </div>
                <Link to="/subscription">
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    disabled={isProcessing}
                  >
                    Upgrade
                  </Button>
                </Link>
              </div>
            )
          }

          const isPpj = option.type === 'pay-per-job'
          const IconComponent = isPpj ? CheckCircle : Globe
          const iconBg = isPpj ? 'bg-green-100' : 'bg-purple-100'
          const iconColor = isPpj ? 'text-green-600' : 'text-purple-600'

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{option.label}</p>
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  )}
                  {option.price != null && (
                    <p className="text-xs font-semibold text-gray-700 mt-1">
                      {formatCurrency(option.price, option.currency)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                isLoading={busyOptionIndex === index}
                disabled={isProcessing}
                onClick={() => handleUnlock(option, index)}
              >
                Pay
              </Button>
            </div>
          )
        })}

        {inlineError && (
          <Alert variant="error" onClose={() => setInlineError(null)}>
            {inlineError}
          </Alert>
        )}
      </div>

      {pendingOption && (
        <ZoneSelectionModal
          isOpen={modalZones !== null}
          requiredCount={pendingOption.option.zonesIncluded ?? 1}
          zones={modalZones ?? []}
          price={pendingOption.option.price}
          currency={pendingOption.option.currency}
          addonName={pendingOption.option.label}
          onConfirm={handleModalConfirm}
          onClose={() => {
            setModalZones(null)
            setPendingOption(null)
          }}
          isLoading={busyOptionIndex !== null}
        />
      )}
    </div>
  )
}
