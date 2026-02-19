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
    w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border transition-all
    text-gray-900 placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
    ${hasError ? 'border-red-500' : 'border-gray-200 hover:border-teal-300'}
  `

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Logo size="lg" variant="light" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Join Aqua Talent
          </h1>
          <p className="text-gray-500">Create your student account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Student Account</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                <p className="mt-1.5 text-sm text-red-600">{errors.fullName.message}</p>
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
                  placeholder="Your email address"
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

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Profile Link <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <input
                  {...register('profileLink')}
                  type="url"
                  placeholder="LinkedIn or portfolio URL"
                  className={inputClasses(!!errors.profileLink)}
                />
              </div>
              <p className="mt-1.5 text-sm text-gray-500">
                Add a link to your LinkedIn, portfolio, or resume
              </p>
              {errors.profileLink && (
                <p className="mt-1.5 text-sm text-red-600">{errors.profileLink.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 rounded-xl font-semibold transition-all bg-teal-600 text-white hover:bg-teal-700 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
