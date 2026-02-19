import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNotification } from '@/contexts/NotificationContext'
import { companyRegisterSchema, CompanyRegisterFormData } from '@/types/schemas/auth'
import { api } from '@/services/api/client'
import {
  Building2,
  User,
  Mail,
  Lock,
  CheckCircle,
  Info,
} from 'lucide-react'
import Logo from '@/components/common/Logo'

export default function CompanyRegisterPage() {
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
  })

  const onSubmit = async (data: CompanyRegisterFormData) => {
    setIsLoading(true)
    try {
      await api.post('/auth/register/company', data)
      setIsRegistered(true)
      success('Registration submitted! Please wait for admin approval.')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClasses = (hasError: boolean) => `
    w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border transition-all
    text-gray-900 placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
    ${hasError ? 'border-red-500' : 'border-gray-200 hover:border-purple-300'}
  `

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Registration Submitted
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your company registration is pending admin approval.
              You will be notified once approved.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-xl font-semibold transition-all bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Logo size="lg" variant="light" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Partner with Aqua Talent
          </h1>
          <p className="text-gray-500">Register your company</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up stagger-1">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200 mb-6">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Company accounts require admin approval before activation.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Company Account</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Company Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  {...register('companyName')}
                  type="text"
                  placeholder="Enter company name"
                  className={inputClasses(!!errors.companyName)}
                />
              </div>
              {errors.companyName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  {...register('username')}
                  type="text"
                  placeholder="Choose a username"
                  className={inputClasses(!!errors.username)}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Company email address"
                  className={inputClasses(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Create a password"
                  className={inputClasses(!!errors.password)}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirm your password"
                  className={inputClasses(!!errors.confirmPassword)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 rounded-xl font-semibold transition-all bg-purple-600 text-white hover:bg-purple-700 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Register Company'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
