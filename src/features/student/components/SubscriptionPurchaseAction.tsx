import { useMemo, useState } from 'react'
import Button from '@/components/common/Button'
import Alert from '@/components/common/Alert'
import { useNotification } from '@/contexts/NotificationContext'
import {
  startStudentServicePayment,
  type StudentPaymentCurrency,
} from '@/services/payment/studentPayment'

interface PaymentPrefill {
  name?: string
  email?: string
  contact?: string
}

interface SubscriptionPurchaseActionProps {
  serviceId: string
  currency: StudentPaymentCurrency
  disabled?: boolean
  prefill?: PaymentPrefill
  onPaymentSuccess: () => Promise<void> | void
}

export default function SubscriptionPurchaseAction({
  serviceId,
  currency,
  disabled = false,
  prefill,
  onPaymentSuccess,
}: SubscriptionPurchaseActionProps) {
  const { success, error: showError, warning } = useNotification()
  const [isProcessing, setIsProcessing] = useState(false)
  const [inlineMessage, setInlineMessage] = useState<string | null>(null)
  const [inlineVariant, setInlineVariant] = useState<'error' | 'warning'>('error')
  const [showRetry, setShowRetry] = useState(false)

  const canBuy = useMemo(() => {
    return !disabled && !isProcessing
  }, [disabled, isProcessing])

  const handleBuy = async () => {
    try {
      setIsProcessing(true)
      setInlineMessage(null)
      setShowRetry(false)

      await startStudentServicePayment({
        serviceId,
        currency,
        prefill,
      })

      await onPaymentSuccess()
      success('Subscription activated successfully.')
    } catch (paymentError) {
      const message = paymentError instanceof Error
        ? paymentError.message
        : 'Payment failed. Please try again.'

      if (/cancelled/i.test(message)) {
        setInlineVariant('warning')
        setInlineMessage('Payment cancelled. You can try again.')
        warning('Payment cancelled. You can try again.')
        return
      }

      setInlineVariant('error')
      setInlineMessage(message)
      setShowRetry(true)
      showError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full space-y-3">
      {inlineMessage && (
        <Alert variant={inlineVariant}>
          {inlineMessage}
        </Alert>
      )}

      <Button
        variant="primary"
        size="md"
        className="w-full"
        onClick={handleBuy}
        disabled={!canBuy}
        isLoading={isProcessing}
      >
        {showRetry ? 'Retry' : 'Buy'}
      </Button>
    </div>
  )
}