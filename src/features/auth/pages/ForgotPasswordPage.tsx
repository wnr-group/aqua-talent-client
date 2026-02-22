import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/types/schemas/auth'
import { api } from '@/services/api/client'
import { Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react'
import Logo from '@/components/common/Logo'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/auth/forgot-password',
        { email: data.email }
      )
      setSuccessMessage(response.message)
      setIsSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/">
            <Logo size="lg" variant="dark" />
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
            <KeyRound className="w-10 h-10 text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Reset Your Password
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Don't worry, it happens to the best of us. Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            Remember your password?{' '}
            <Link to="/login" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-up">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <Logo size="lg" variant="light" />
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Forgot Password
            </h1>
            <p className="text-gray-500">
              {isSuccess
                ? 'Check your email for instructions'
                : 'Enter your email to receive a reset link'
              }
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up stagger-1">
            {isSuccess ? (
              /* Success State */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-500 mb-6">
                  {successMessage}
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email address"
                      className={`
                        w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border transition-all
                        text-gray-900 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                        ${errors.email ? 'border-red-500' : 'border-gray-200 hover:border-blue-300'}
                      `}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Inline error message */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    w-full py-4 rounded-xl font-semibold transition-all
                    bg-blue-600 hover:bg-blue-700 text-white
                    shadow-sm disabled:opacity-50
                    flex items-center justify-center gap-2
                  "
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            )}

            {!isSuccess && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
