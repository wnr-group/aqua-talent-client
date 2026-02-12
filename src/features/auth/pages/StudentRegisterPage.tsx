import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { studentRegisterSchema, StudentRegisterFormData } from '@/types/schemas/auth'
import { api } from '@/services/api/client'
import { UserType } from '@/types'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { GraduationCap, User, Mail, Lock, Link as LinkIcon } from 'lucide-react'

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
      // Auto-login after registration
      await login(data.username, data.password, UserType.STUDENT)
      navigate('/student')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Aqua Talent</h1>
          <p className="text-gray-600">Create your student account</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              {...register('fullName')}
              error={errors.fullName?.message}
              placeholder="Enter your full name"
              leftIcon={<User className="w-4 h-4" />}
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
              placeholder="Your email address"
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
            <Input
              label="Profile Link (Optional)"
              {...register('profileLink')}
              error={errors.profileLink?.message}
              placeholder="LinkedIn or portfolio URL"
              helperText="Add a link to your LinkedIn, portfolio, or resume"
              leftIcon={<LinkIcon className="w-4 h-4" />}
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create Account
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
