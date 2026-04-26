import { useState } from 'react'
import { Briefcase, Plus, Check } from 'lucide-react'
import Button from '@/components/common/Button'
import { api } from '@/services/api/client'
import { openRazorpayCheckout } from '@/services/razorpay'
import { useNotification } from '@/contexts/NotificationContext'
import { useNavigate } from 'react-router-dom'

interface JobCreditAddon {
  id: string
  name: string
  description: string
  jobCreditCount: number
  priceINR: number
  priceUSD: number
}

interface JobCreditAddonPanelProps {
  addons: JobCreditAddon[]
  currency: 'INR' | 'USD'
  currentUsage: number
  currentLimit: number | null
  isFreeTier: boolean
  prefill?: { name?: string; email?: string }
  onPurchaseSuccess: () => void
}

export default function JobCreditAddonPanel({
  addons,
  currency,
  currentUsage,
  currentLimit,
  isFreeTier,
  prefill,
  onPurchaseSuccess,
}: JobCreditAddonPanelProps) {
  const { success, error: showError } = useNotification()
  const navigate = useNavigate()
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  const formatPrice = (addon: JobCreditAddon) => {
    const amount = currency === 'USD' ? addon.priceUSD : addon.priceINR
    return currency === 'USD' ? `$${amount}` : `₹${amount}`
  }

  const handlePurchase = async (addon: JobCreditAddon) => {
    setPurchasingId(addon.id)
    try {
      // Create order for job credit addon
      const orderResponse = await api.post<{
        orderId: string
        amount: number
        currency: string
        key: string
        addonName: string
      }>('/payments/jobs-addon/create-order', {
        addonId: addon.id,
        currency,
      })

      // Open Razorpay checkout
      const paymentResult = await openRazorpayCheckout({
        key: orderResponse.key,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Job Credits',
        description: orderResponse.addonName,
        orderId: orderResponse.orderId,
        prefill,
        notes: { addonId: addon.id },
        themeColor: '#2563eb',
      })

      // Verify payment
      const verifyResponse = await api.post<{ success: boolean; message?: string }>(
        '/payments/jobs-addon/verify',
        {
          orderId: orderResponse.orderId,
          paymentId: paymentResult.paymentId,
          signature: paymentResult.signature,
        }
      )

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message || 'Payment verification failed')
      }

      success(`${addon.jobCreditCount} job credits added to your account!`)
      onPurchaseSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      if (!/cancelled/i.test(message)) {
        showError(message)
      }
    } finally {
      setPurchasingId(null)
    }
  }

  if (isFreeTier) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Upgrade Your Plan
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Free plan users cannot purchase add-ons. Upgrade to unlock more applications.
        </p>
        <Button onClick={() => navigate('/subscription')}>
          View Plans
        </Button>
      </div>
    )
  }

  if (addons.length === 0) return null

  const remaining = currentLimit === null ? null : currentLimit - currentUsage

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Need More Applications?</h3>
          {remaining !== null && (
            <p className="text-xs text-gray-500">
              {remaining > 0
                ? `${remaining} application${remaining === 1 ? '' : 's'} remaining`
                : 'You have used all your applications'}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                <p className="text-xs text-gray-500">
                  +{addon.jobCreditCount} application{addon.jobCreditCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePurchase(addon)}
              isLoading={purchasingId === addon.id}
              disabled={purchasingId !== null}
              leftIcon={purchasingId === addon.id ? undefined : <Check className="w-3 h-3" />}
            >
              {formatPrice(addon)}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
