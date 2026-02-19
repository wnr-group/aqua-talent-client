import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { loginSchema, LoginFormData } from '@/types/schemas/auth'
import { UserType, LoginResponse } from '@/types'
import { getPortalType, getPortalBaseUrl } from '@/utils/subdomain'
import { api } from '@/services/api/client'
import { GraduationCap, Building2, User, Lock, Shield, Briefcase, Users, TrendingUp } from 'lucide-react'
import Logo from '@/components/common/Logo'

const publicUserTypeConfig = {
  [UserType.STUDENT]: {
    label: 'Student',
    icon: GraduationCap,
    description: 'Find your dream job',
    bgClass: 'bg-teal-600',
    hoverClass: 'hover:bg-teal-700',
    panelBg: 'from-teal-600 to-teal-700',
  },
  [UserType.COMPANY]: {
    label: 'Company',
    icon: Building2,
    description: 'Hire top talent',
    bgClass: 'bg-purple-600',
    hoverClass: 'hover:bg-purple-700',
    panelBg: 'from-purple-600 to-purple-700',
  },
}

const adminUserTypeConfig = {
  [UserType.ADMIN]: {
    label: 'Admin',
    icon: Shield,
    description: 'Manage platform',
    bgClass: 'bg-orange-500',
    hoverClass: 'hover:bg-orange-600',
    panelBg: 'from-orange-500 to-orange-600',
  },
}

const companyUserTypeConfig = {
  [UserType.COMPANY]: {
    label: 'Company',
    icon: Building2,
    description: 'Hire top talent',
    bgClass: 'bg-purple-600',
    hoverClass: 'hover:bg-purple-700',
    panelBg: 'from-purple-600 to-purple-700',
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const { login } = useAuthContext()
  const { error: showError } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Detect portal context via subdomain
  const currentPortal = getPortalType()
  const isAdminLogin = currentPortal === 'admin'
  const isCompanyLogin = currentPortal === 'company'

  const [userType, setUserType] = useState<UserType>(
    isAdminLogin ? UserType.ADMIN : isCompanyLogin ? UserType.COMPANY : UserType.STUDENT
  )

  // Update userType if portal context changes
  useEffect(() => {
    if (isAdminLogin) {
      setUserType(UserType.ADMIN)
    } else if (isCompanyLogin) {
      setUserType(UserType.COMPANY)
    }
  }, [isAdminLogin, isCompanyLogin])

  const userTypeConfig = isAdminLogin ? adminUserTypeConfig : isCompanyLogin ? companyUserTypeConfig : publicUserTypeConfig

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setLoginError(null)
    try {
      // For company/admin login on main domain, get token and redirect with it
      if (currentPortal === 'public' && (userType === UserType.COMPANY || userType === UserType.ADMIN)) {
        // Get token from login
        const response = await api.post<LoginResponse>('/auth/login', {
          username: data.username,
          password: data.password,
          userType,
        })
        // Redirect to their portal with token for seamless login
        const portalType = userType === UserType.COMPANY ? 'company' : 'admin'
        const token = encodeURIComponent(response.token)
        window.location.href = `${getPortalBaseUrl(portalType)}?token=${token}`
        return
      }

      // Normal login flow (students on main domain, or company/admin on their subdomains)
      await login(data.username, data.password, userType)

      // Handle redirect based on user type and current portal
      if (userType === UserType.STUDENT) {
        // Students stay on main domain
        navigate(redirect || '/dashboard')
      } else if (userType === UserType.COMPANY) {
        // Companies on company subdomain
        navigate(redirect || '/')
      } else if (userType === UserType.ADMIN) {
        // Admins on admin subdomain
        navigate(redirect || '/')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setLoginError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const allConfigs = { ...publicUserTypeConfig, ...adminUserTypeConfig, ...companyUserTypeConfig }
  const config = allConfigs[userType as keyof typeof allConfigs] || publicUserTypeConfig[UserType.STUDENT]
  const IconComponent = config.icon

  // Determine if this is a dedicated portal login (admin or company subdomain)
  const isDedicatedPortal = isAdminLogin || isCompanyLogin

  // User type selector component (reused in both mobile and desktop)
  const UserTypeSelector = ({ className = '' }: { className?: string }) => (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {Object.entries(userTypeConfig).map(([type, typeConfig]) => {
        const TypeIcon = typeConfig.icon
        const isSelected = userType === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => setUserType(type as UserType)}
            className={`
              flex flex-col items-center gap-2 py-4 px-4 rounded-xl font-medium transition-all duration-300
              ${
                isSelected
                  ? `${typeConfig.bgClass} text-white shadow-sm`
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
              }
            `}
          >
            <TypeIcon className="w-6 h-6" />
            <span className="text-sm">{typeConfig.label}</span>
          </button>
        )
      })}
    </div>
  )

  // Left panel user type selector for desktop (styled for dark background)
  const DesktopUserTypeSelector = () => (
    <div>
      <p className="text-white/80 text-sm font-medium mb-4">I am a...</p>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(userTypeConfig).map(([type, typeConfig]) => {
          const TypeIcon = typeConfig.icon
          const isSelected = userType === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => setUserType(type as UserType)}
              className={`
                flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-xl font-medium transition-all duration-300
                ${
                  isSelected
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }
              `}
            >
              <TypeIcon className="w-10 h-10" />
              <span className="text-sm font-semibold">{typeConfig.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Desktop only */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${config.panelBg} p-12 flex-col justify-between relative overflow-hidden`}>
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
          {/* Illustration/Icons */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Fixed height container for text to prevent layout shift */}
          <div className="h-32">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              {userType === UserType.STUDENT
                ? 'Launch Your Career'
                : userType === UserType.COMPANY
                ? 'Find Top Talent'
                : 'Manage Your Platform'}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              {userType === UserType.STUDENT
                ? 'Connect with top companies and discover opportunities that match your skills and aspirations.'
                : userType === UserType.COMPANY
                ? 'Access a pool of talented students ready to bring fresh perspectives to your team.'
                : 'Full control over users, jobs, and applications on the platform.'}
            </p>
          </div>

          {/* User type selector - Desktop */}
          {!isDedicatedPortal && <DesktopUserTypeSelector />}
        </div>

        {/* Footer stats */}
        <div className="relative z-10 flex items-center gap-8">
          <div>
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-sm text-white/70">Students Hired</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <div className="text-2xl font-bold text-white">150+</div>
            <div className="text-sm text-white/70">Active Jobs</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-sm text-white/70">Companies</div>
          </div>
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
              {isAdminLogin ? 'Admin Portal' : isCompanyLogin ? 'Company Portal' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500">
              {isAdminLogin ? 'Sign in to manage the platform' : isCompanyLogin ? 'Sign in to hire top talent' : 'Sign in to your account'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fade-in-up stagger-1">
            {/* User type selector - Mobile only (or dedicated portal badge) */}
            {isDedicatedPortal ? (
              <div className={`flex items-center justify-center gap-3 mb-8 py-4 px-4 rounded-xl ${
                isAdminLogin ? 'bg-orange-500' : 'bg-purple-600'
              }`}>
                {isAdminLogin ? (
                  <Shield className="w-6 h-6 text-white" />
                ) : (
                  <Building2 className="w-6 h-6 text-white" />
                )}
                <span className="text-white font-semibold">
                  {isAdminLogin ? 'Administrator Login' : 'Company Login'}
                </span>
              </div>
            ) : (
              <div className="lg:hidden">
                <UserTypeSelector className="mb-8" />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    placeholder="Enter your username"
                    className={`
                      w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border transition-all
                      text-gray-900 placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      ${errors.username ? 'border-red-500' : 'border-gray-200 hover:border-blue-300'}
                    `}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.username.message}</p>
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
                    placeholder="Enter your password"
                    className={`
                      w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border transition-all
                      text-gray-900 placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      ${errors.password ? 'border-red-500' : 'border-gray-200 hover:border-blue-300'}
                    `}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Inline error message */}
              {loginError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm font-medium">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-4 rounded-xl font-semibold transition-all
                  ${config.bgClass} ${config.hoverClass} text-white
                  shadow-sm disabled:opacity-50
                  flex items-center justify-center gap-2
                `}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <IconComponent className="w-5 h-5" />
                    Sign In as {config.label}
                  </>
                )}
              </button>
            </form>

            {!isDedicatedPortal && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link
                  to={userType === UserType.COMPANY ? '/register/company' : '/register/student'}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Register here
                </Link>
              </div>
            )}
            {isCompanyLogin && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  Register your company
                </Link>
              </div>
            )}
          </div>

          {/* Demo credentials */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-fade-in-up stagger-2">
            <p className="text-sm text-center">
              <span className="font-medium text-gray-900">Demo Credentials:</span>
              <br />
              <span className="text-gray-500">
                {isAdminLogin ? (
                  'Admin: admin / password123'
                ) : isCompanyLogin ? (
                  'Company: infosys / password123'
                ) : (
                  <>
                    Student: rahul / password123
                    <br />
                    Company: infosys / password123
                  </>
                )}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
