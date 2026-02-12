import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNotification } from '@/contexts/NotificationContext'
import { companyRegisterSchema, CompanyRegisterFormData } from '@/types/schemas/auth'
import { api } from '@/services/api/client'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { Building2, User, Mail, Lock, CheckCircle } from 'lucide-react'

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

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Submitted
            </h2>
            <p className="text-gray-600 mb-6">
              Your company registration is pending admin approval. You will be notified once approved.
            </p>
            <Button onClick={() => navigate('/login')} size="lg">
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner with Aqua Talent</h1>
          <p className="text-gray-600">Register your company</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <Alert variant="info" className="mb-6">
            Company accounts require admin approval before activation.
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Company Name"
              {...register('companyName')}
              error={errors.companyName?.message}
              placeholder="Enter company name"
              leftIcon={<Building2 className="w-4 h-4" />}
            />
            <Input
              label="Username"
              {...register('username')}
              error={errors.username?.message}
              placeholder="Choose a username"
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Company email address"
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Create a password"
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Confirm your password"
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Register Company
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
