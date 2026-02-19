export interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  themeColor?: string
}

export interface RazorpayCheckoutResult {
  paymentId: string
  orderId?: string
  signature?: string
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

export function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<RazorpayCheckoutResult> {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay === 'undefined') {
      reject(new Error('Razorpay SDK not loaded'))
      return
    }

    const razorpayOptions: Record<string, unknown> = {
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      notes: options.notes,
      theme: options.themeColor ? { color: options.themeColor } : undefined,
      handler: (response: RazorpayResponse) => {
        resolve({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        })
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'))
        },
      },
    }

    const razorpay = new window.Razorpay(razorpayOptions)
    razorpay.open()
  })
}
