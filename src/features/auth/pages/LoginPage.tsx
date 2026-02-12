import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { loginSchema, LoginFormData } from '@/types/schemas/auth'
import { UserType } from '@/types'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Droplet, GraduationCap, Building2, Shield } from 'lucide-react'

const userTypeConfig = {
  [UserType.STUDENT]: {
    label: 'Student',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'Find your dream job',
  },
  [UserType.COMPANY]: {
    label: 'Company',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Hire top talent',
  },
  [UserType.ADMIN]: {
    label: 'Admin',
    icon: <Shield className="w-5 h-5" />,
    description: 'Manage platform',
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthContext()
  const { error: showError } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<UserType>(UserType.STUDENT)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.username, data.password, userType)
      const redirectPath = {
        [UserType.COMPANY]: '/company',
        [UserType.STUDENT]: '/student',
        [UserType.ADMIN]: '/admin',
      }[userType]
      navigate(redirectPath)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <Droplet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aqua Talent</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-3 gap-2 mb-6">
            {Object.entries(userTypeConfig).map(([type, config]) => (
              <button
                key={type}
                type="button"
                onClick={() => setUserType(type as UserType)}
                className={`
                  flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-medium transition-all
                  ${
                    userType === type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {config.icon}
                <span>{config.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Username"
              {...register('username')}
              error={errors.username?.message}
              placeholder="Enter your username"
            />
            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Enter your password"
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          {userType !== UserType.ADMIN && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to={userType === UserType.COMPANY ? '/register/company' : '/register/student'}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Register here
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white/60 backdrop-blur rounded-lg p-4">
          <p className="text-sm text-gray-700 text-center">
            <span className="font-semibold">Demo Credentials:</span>
            <br />
            <span className="text-gray-600">
              Student: john / password123
              <br />
              Company: acme / password123
              <br />
              Admin: admin / password123
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
