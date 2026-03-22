import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Lock, Zap, ArrowRight } from 'lucide-react'
import Button from '@/components/common/Button'
import Alert from '@/components/common/Alert'
import { useNotification } from '@/contexts/NotificationContext'
import { startJobsAddonPayment } from '@/services/payment/studentPayment'
import type { QuotaLockReason, UnlockOption } from '@/types/entities'

interface RazorpayPrefill {
  name?: string
  email?: string
  contact?: string
}

interface QuotaUnlockPanelProps {
  quotaLockReason: QuotaLockReason
  prefill?: RazorpayPrefill
  onUnlocked: () => void
  currency?: 'INR' | 'USD'
}

function formatCurrency(priceINR?: number, priceUSD?: number, currency?: 'INR' | 'USD'): string {
  if (currency === 'USD' && priceUSD != null) return `$${priceUSD}`
  if (priceINR != null) return `₹${priceINR}`
  return ''
}

export default function QuotaUnlockPanel({
  quotaLockReason,
  prefill,
  onUnlocked,
  currency = 'INR',
}: QuotaUnlockPanelProps) {
  const { success, error: showError } = useNotification()
  const [busyOptionIndex, setBusyOptionIndex] = useState<number | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)

  const handleUnlock = async (option: UnlockOption, index: number) => {
    setInlineError(null)
    setBusyOptionIndex(index)
    try {
      if (option.type === 'jobs-addon' && option.addonId) {
        await startJobsAddonPayment({
          addonId: option.addonId,
          currency,
          prefill,
        })
        success('Job credits added successfully!')
        onUnlocked()
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

  const isProcessing = busyOptionIndex !== null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4 bg-amber-100 border-b border-amber-200">
        <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lock className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <p className="font-semibold text-amber-900 text-sm">Application limit reached</p>
          <p className="text-xs text-amber-700 mt-0.5">
            You've used {quotaLockReason.applicationsUsed} of {quotaLockReason.applicationLimit} job applications
          </p>
        </div>
      </div>

      {/* Unlock options */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Get more applications</p>

        {quotaLockReason.unlockOptions.map((option, index) => {
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
                <Link to={option.url || '/subscription'}>
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

          if (option.type === 'jobs-addon') {
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    )}
                    {(option.priceINR != null || option.priceUSD != null) && (
                      <p className="text-xs font-semibold text-gray-700 mt-1">
                        {formatCurrency(option.priceINR, option.priceUSD, currency)}
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
                  Buy
                </Button>
              </div>
            )
          }

          return null
        })}

        {inlineError && (
          <Alert variant="error" onClose={() => setInlineError(null)}>
            {inlineError}
          </Alert>
        )}
      </div>
    </div>
  )
}
