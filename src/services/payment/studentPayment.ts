import { api } from '@/services/api/client'
import { openRazorpayCheckout } from '@/services/razorpay'

export type StudentPaymentCurrency = 'INR' | 'USD'

interface CreateOrderResponse {
  orderId: string
  amount: number
  currency: string
  key: string
  serviceName: string
  serviceDescription: string
}

interface VerifyPaymentResponse {
  success: boolean
  subscriptionId: string
  message?: string
}

interface StartPaymentOptions {
  serviceId: string
  companyId?: string
  currency: StudentPaymentCurrency
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
}

export async function startStudentServicePayment(
  options: StartPaymentOptions
): Promise<void> {
  const { serviceId, companyId, currency, prefill } = options

  // Step 1: Create order on backend
  const orderResponse = await api.post<CreateOrderResponse>(
    '/payments/create-order',
    {
      serviceId,
      companyId,
      currency,
    }
  )

  // Step 2: Open Razorpay checkout
  const paymentResult = await openRazorpayCheckout({
    key: orderResponse.key,
    amount: orderResponse.amount,
    currency: orderResponse.currency,
    name: orderResponse.serviceName,
    description: orderResponse.serviceDescription,
    orderId: orderResponse.orderId,
    prefill,
    notes: {
      serviceId,
      ...(companyId && { companyId }),
    },
    themeColor: '#2563eb',
  })

  // Step 3: Verify payment on backend
  const verifyResponse = await api.post<VerifyPaymentResponse>(
    '/payments/verify',
    {
      razorpay_order_id: paymentResult.orderId,
      razorpay_payment_id: paymentResult.paymentId,
      razorpay_signature: paymentResult.signature,
    }
  )

  if (!verifyResponse.success) {
    throw new Error(verifyResponse.message || 'Payment verification failed')
  }
}

interface PayPerJobOrderResponse {
  orderId: string
  amount: number
  currency: string
  key: string
  jobTitle: string
}

interface RazorpayPrefill {
  name?: string
  email?: string
  contact?: string
}

export async function startPayPerJobPayment(
  jobId: string,
  prefill?: RazorpayPrefill
): Promise<void> {
  // Step 1: Create pay-per-job order
  const orderResponse = await api.post<PayPerJobOrderResponse>(
    '/payments/pay-per-job/create-order',
    { jobId }
  )

  // Step 2: Open Razorpay checkout
  const paymentResult = await openRazorpayCheckout({
    key: orderResponse.key,
    amount: orderResponse.amount,
    currency: orderResponse.currency,
    name: 'Job Unlock',
    description: `Unlock: ${orderResponse.jobTitle}`,
    orderId: orderResponse.orderId,
    prefill,
    notes: { jobId },
    themeColor: '#2563eb',
  })

  // Step 3: Verify payment
  const verifyResponse = await api.post<VerifyPaymentResponse>(
    '/payments/pay-per-job/verify',
    {
      razorpay_order_id: paymentResult.orderId,
      razorpay_payment_id: paymentResult.paymentId,
      razorpay_signature: paymentResult.signature,
    }
  )

  if (!verifyResponse.success) {
    throw new Error(verifyResponse.message || 'Payment verification failed')
  }
}

interface ZoneAddonOrderResponse {
  orderId: string
  amount: number
  currency: string
  key: string
  addonName: string
}

interface ZoneAddonPaymentOptions {
  addonId: string
  zoneIds: string[]
  currency: StudentPaymentCurrency
  prefill?: RazorpayPrefill
}

export async function startZoneAddonPayment(
  options: ZoneAddonPaymentOptions
): Promise<void> {
  const { addonId, zoneIds, currency, prefill } = options

  // Step 1: Create zone addon order
  const orderResponse = await api.post<ZoneAddonOrderResponse>(
    '/payments/zone-addon/create-order',
    { addonId, zoneIds, currency }
  )

  // Step 2: Open Razorpay checkout
  const paymentResult = await openRazorpayCheckout({
    key: orderResponse.key,
    amount: orderResponse.amount,
    currency: orderResponse.currency,
    name: 'Zone Addon',
    description: orderResponse.addonName,
    orderId: orderResponse.orderId,
    prefill,
    notes: { addonId, zoneIds: zoneIds.join(',') },
    themeColor: '#2563eb',
  })

  // Step 3: Verify payment
  const verifyResponse = await api.post<VerifyPaymentResponse>(
    '/payments/zone-addon/verify',
    {
      razorpay_order_id: paymentResult.orderId,
      razorpay_payment_id: paymentResult.paymentId,
      razorpay_signature: paymentResult.signature,
      addonId,
      zoneIds,
    }
  )

  if (!verifyResponse.success) {
    throw new Error(verifyResponse.message || 'Payment verification failed')
  }
}
