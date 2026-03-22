import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Button from '@/components/common/Button'
import Card, { CardContent } from '@/components/common/Card'
import StudentNavbar from '@/components/layout/StudentNavbar'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planName = searchParams.get('plan') || 'Premium'

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/subscription')
    }, 10000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <StudentNavbar />

      <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Payment Successful
            </h1>

            <p className="mb-6 text-gray-600">
              Your {planName} subscription has been activated successfully.
              You now have access to all premium features.
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/subscription')}
              >
                View Subscription
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              You will be redirected to the subscription page in 10 seconds.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
