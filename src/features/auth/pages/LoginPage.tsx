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
import { GraduationCap, Building2, User, Lock, ArrowLeft, Shield } from 'lucide-react'
import Logo from '@/components/common/Logo'

const publicUserTypeConfig = {
  [UserType.STUDENT]: {
    label: 'Student',
    icon: GraduationCap,
    description: 'Find your dream job',
    gradient: 'from-glow-cyan to-glow-teal',
  },
  [UserType.COMPANY]: {
    label: 'Company',
    icon: Building2,
    description: 'Hire top talent',
    gradient: 'from-glow-purple to-glow-blue',
  },
}

const adminUserTypeConfig = {
  [UserType.ADMIN]: {
    label: 'Admin',
    icon: Shield,
    description: 'Manage platform',
    gradient: 'from-coral to-sand',
  },
}

const companyUserTypeConfig = {
  [UserType.COMPANY]: {
    label: 'Company',
    icon: Building2,
    description: 'Hire top talent',
    gradient: 'from-glow-purple to-glow-blue',
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

  return (
    <div className="min-h-screen ocean-bg flex items-center justify-center p-4 particles-bg">
      {/* Back to home - only show on student portal */}
      {!isDedicatedPortal && (
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      )}

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Logo size="lg" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            {isAdminLogin ? 'Admin Portal' : isCompanyLogin ? 'Company Portal' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground">
            {isAdminLogin ? 'Sign in to manage the platform' : isCompanyLogin ? 'Sign in to hire top talent' : 'Sign in to your account'}
          </p>
        </div>

        <div className="glass rounded-2xl p-8 animate-fade-in-up stagger-1">
          {/* User type selector */}
          {isDedicatedPortal ? (
            <div className={`flex items-center justify-center gap-3 mb-8 py-4 px-4 rounded-xl bg-gradient-to-r ${
              isAdminLogin ? 'from-coral to-sand' : 'from-glow-purple to-glow-blue'
            }`}>
              {isAdminLogin ? (
                <Shield className="w-6 h-6 text-ocean-deep" />
              ) : (
                <Building2 className="w-6 h-6 text-ocean-deep" />
              )}
              <span className="text-ocean-deep font-semibold">
                {isAdminLogin ? 'Administrator Login' : 'Company Login'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-8">
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
                          ? `bg-gradient-to-r ${typeConfig.gradient} text-ocean-deep glow-sm`
                          : 'bg-ocean-dark/50 text-muted-foreground hover:text-foreground hover:bg-ocean-surface/50 border border-border'
                      }
                    `}
                  >
                    <TypeIcon className="w-6 h-6" />
                    <span className="text-sm">{typeConfig.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  placeholder="Enter your username"
                  className={`
                    w-full pl-12 pr-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-glow-cyan/50 focus:border-glow-cyan
                    ${errors.username ? 'border-coral' : 'border-border hover:border-glow-cyan/30'}
                  `}
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-sm text-coral">{errors.username.message}</p>
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
                  placeholder="Enter your password"
                  className={`
                    w-full pl-12 pr-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-glow-cyan/50 focus:border-glow-cyan
                    ${errors.password ? 'border-coral' : 'border-border hover:border-glow-cyan/30'}
                  `}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-coral">{errors.password.message}</p>
              )}
            </div>

            {/* Inline error message */}
            {loginError && (
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50">
                <p className="text-red-400 text-sm font-medium">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-4 rounded-xl font-semibold transition-all
                bg-gradient-to-r ${config.gradient} text-ocean-deep
                glow-sm hover:glow-md disabled:opacity-50
                flex items-center justify-center gap-2
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-ocean-deep/30 border-t-ocean-deep rounded-full animate-spin" />
              ) : (
                <>
                  <IconComponent className="w-5 h-5" />
                  Sign In as {config.label}
                </>
              )}
            </button>
          </form>

          {!isDedicatedPortal && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to={userType === UserType.COMPANY ? '/register/company' : '/register/student'}
                className="text-glow-cyan hover:text-glow-teal font-medium transition-colors"
              >
                Register here
              </Link>
            </div>
          )}
          {isCompanyLogin && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-glow-cyan hover:text-glow-teal font-medium transition-colors"
              >
                Register your company
              </Link>
            </div>
          )}
        </div>

        {/* Demo credentials */}
        <div className="mt-6 glass rounded-xl p-4 animate-fade-in-up stagger-2">
          <p className="text-sm text-center">
            <span className="font-medium text-foreground">Demo Credentials:</span>
            <br />
            <span className="text-muted-foreground">
              {isAdminLogin ? (
                'Admin: admin / password123'
              ) : isCompanyLogin ? (
                'Company: acme / password123'
              ) : (
                <>
                  Student: john / password123
                  <br />
                  Company: acme / password123
                </>
              )}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
