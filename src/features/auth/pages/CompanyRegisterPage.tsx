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
  ArrowLeft,
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
    w-full pl-12 pr-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-glow-purple/50 focus:border-glow-purple
    ${hasError ? 'border-coral' : 'border-border hover:border-glow-purple/30'}
  `

  if (isRegistered) {
    return (
      <div className="min-h-screen ocean-bg flex items-center justify-center p-4 particles-bg">
        <div className="max-w-md w-full">
          <div className="glass rounded-2xl p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-glow-teal/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-glow-teal" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              Registration Submitted
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your company registration is pending admin approval.
              You will be notified once approved.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-glow-purple to-glow-blue text-white glow-sm hover:glow-md"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ocean-bg flex items-center justify-center p-4 particles-bg">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Logo size="lg" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Partner with Aqua Talent
          </h1>
          <p className="text-muted-foreground">Register your company</p>
        </div>

        <div className="glass rounded-2xl p-8 animate-fade-in-up stagger-1">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-glow-purple/10 border border-glow-purple/20 mb-6">
            <Info className="w-5 h-5 text-glow-purple flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Company accounts require admin approval before activation.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-glow-purple to-glow-blue flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">Company Account</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                <p className="mt-1.5 text-sm text-coral">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                <p className="mt-1.5 text-sm text-coral">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                <p className="mt-1.5 text-sm text-coral">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                <p className="mt-1.5 text-sm text-coral">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                <p className="mt-1.5 text-sm text-coral">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 rounded-xl font-semibold transition-all bg-gradient-to-r from-glow-purple to-glow-blue text-white glow-sm hover:glow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Register Company'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-glow-purple hover:text-glow-blue font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
