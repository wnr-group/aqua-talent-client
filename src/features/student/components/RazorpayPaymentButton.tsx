import { useEffect, useRef } from 'react'

interface RazorpayPaymentButtonProps {
  paymentButtonId: string
}

export default function RazorpayPaymentButton({ paymentButtonId }: RazorpayPaymentButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    container.innerHTML = ''

    const form = document.createElement('form')

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js'
    script.async = true
    script.setAttribute('data-payment_button_id', paymentButtonId)

    form.appendChild(script)
    container.appendChild(form)

    return () => {
      container.innerHTML = ''
    }
  }, [paymentButtonId])

  return <div ref={containerRef} className="w-full" />
}