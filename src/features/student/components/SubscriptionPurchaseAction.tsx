import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import Button from '@/components/common/Button'
import Alert from '@/components/common/Alert'
import { useNotification } from '@/contexts/NotificationContext'
import { api } from '@/services/api/client'
import {
  startStudentServicePayment,
  type StudentPaymentCurrency,
} from '@/services/payment/studentPayment'
import { Company } from '@/types'

interface CompanyListResponse {
  companies?: Company[]
  data?: Company[]
}

interface PaymentPrefill {
  name?: string
  email?: string
  contact?: string
}

interface SubscriptionPurchaseActionProps {
  serviceId: string
  serviceName: string
  currency: StudentPaymentCurrency
  requiresCompanySelection: boolean
  disabled?: boolean
  prefill?: PaymentPrefill
  onPaymentSuccess: () => Promise<void> | void
}

function getCompaniesFromResponse(response: CompanyListResponse | Company[]): Company[] {
  if (Array.isArray(response)) {
    return response
  }

  return response.companies || response.data || []
}

export default function SubscriptionPurchaseAction({
  serviceId,
  serviceName,
  currency,
  requiresCompanySelection,
  disabled = false,
  prefill,
  onPaymentSuccess,
}: SubscriptionPurchaseActionProps) {
  const { success, error: showError, warning } = useNotification()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [inlineMessage, setInlineMessage] = useState<string | null>(null)
  const [inlineVariant, setInlineVariant] = useState<'error' | 'warning'>('error')
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (!requiresCompanySelection) {
      setCompanies([])
      setSelectedCompanyId('')
      return
    }

    let isMounted = true

    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true)
        const response = await api.get<CompanyListResponse | Company[]>('/companies', {
          active: 'true',
        })

        if (!isMounted) {
          return
        }

        const activeCompanies = getCompaniesFromResponse(response)
        setCompanies(activeCompanies)
      } catch {
        if (!isMounted) {
          return
        }

        setInlineVariant('error')
        setInlineMessage('Unable to load companies right now. Please try again.')
      } finally {
        if (isMounted) {
          setIsLoadingCompanies(false)
        }
      }
    }

    void loadCompanies()

    return () => {
      isMounted = false
    }
  }, [requiresCompanySelection])

  const canBuy = useMemo(() => {
    if (disabled || isProcessing) {
      return false
    }

    if (!requiresCompanySelection) {
      return true
    }

    return Boolean(selectedCompanyId) && !isLoadingCompanies
  }, [disabled, isLoadingCompanies, isProcessing, requiresCompanySelection, selectedCompanyId])

  const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompanyId(event.target.value)
    if (inlineVariant === 'warning') {
      setInlineMessage(null)
    }
  }

  const handleBuy = async () => {
    if (requiresCompanySelection && !selectedCompanyId) {
      setInlineVariant('warning')
      setInlineMessage('Select a company to continue.')
      return
    }

    try {
      setIsProcessing(true)
      setInlineMessage(null)
      setShowRetry(false)

      await startStudentServicePayment({
        serviceId,
        companyId: requiresCompanySelection ? selectedCompanyId : undefined,
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
      {requiresCompanySelection && (
        <select
          value={selectedCompanyId}
          onChange={handleCompanyChange}
          disabled={disabled || isLoadingCompanies || isProcessing}
          aria-label={`${serviceName} company selector`}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">
            {isLoadingCompanies ? 'Loading companies...' : 'Select company'}
          </option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      )}

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