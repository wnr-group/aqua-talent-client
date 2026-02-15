import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { studentRegisterSchema, StudentRegisterFormData } from '@/types/schemas/auth'
import { api } from '@/services/api/client'
import { UserType } from '@/types'
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Link as LinkIcon,
  ArrowLeft,
} from 'lucide-react'
import Logo from '@/components/common/Logo'

export default function StudentRegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthContext()
  const { success, error: showError } = useNotification()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentRegisterFormData>({
    resolver: zodResolver(studentRegisterSchema),
  })

  const onSubmit = async (data: StudentRegisterFormData) => {
    setIsLoading(true)
    try {
      await api.post('/auth/register/student', data)
      success('Registration successful!')
      await login(data.username, data.password, UserType.STUDENT)
      navigate('/dashboard')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClasses = (hasError: boolean) => `
    w-full pl-12 pr-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-glow-cyan/50 focus:border-glow-cyan
    ${hasError ? 'border-coral' : 'border-border hover:border-glow-cyan/30'}
  `

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
            Join Aqua Talent
          </h1>
          <p className="text-muted-foreground">Create your student account</p>
        </div>

        <div className="glass rounded-2xl p-8 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-glow-cyan to-glow-teal flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-ocean-deep" />
            </div>
            <span className="text-lg font-semibold text-foreground">Student Account</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="Enter your full name"
                  className={inputClasses(!!errors.fullName)}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-sm text-coral">{errors.fullName.message}</p>
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
                  placeholder="Your email address"
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Profile Link <span className="text-muted-foreground">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <input
                  {...register('profileLink')}
                  type="url"
                  placeholder="LinkedIn or portfolio URL"
                  className={inputClasses(!!errors.profileLink)}
                />
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Add a link to your LinkedIn, portfolio, or resume
              </p>
              {errors.profileLink && (
                <p className="mt-1.5 text-sm text-coral">{errors.profileLink.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 rounded-xl font-semibold transition-all bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep glow-sm hover:glow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-ocean-deep/30 border-t-ocean-deep rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-glow-cyan hover:text-glow-teal font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
