import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageContainer } from '@/components/layout'
import Card, { CardTitle, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { api } from '@/services/api/client'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  profileLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function StudentProfile() {
  const { user, refreshUser } = useAuthContext()
  const { success, error: showError } = useNotification()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get<ProfileFormData>('/student/profile')
        reset(data)
      } catch {
        // Use default values from user context if API fails
        if (user?.student) {
          reset({
            fullName: user.student.fullName,
            email: user.student.email,
            profileLink: user.student.profileLink ?? '',
          })
        }
      } finally {
        setIsFetching(false)
      }
    }
    fetchProfile()
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      await api.patch('/student/profile', data)
      await refreshUser()
      success('Profile updated successfully!')
      reset(data)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <PageContainer title="My Profile">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="My Profile">
      <div className="max-w-2xl">
        <Card>
          <CardTitle>Profile Information</CardTitle>
          <CardContent>
            <Alert variant="info" className="mb-6">
              Your profile link is shared with companies when you apply to jobs. Make sure it's up to date!
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Full Name"
                {...register('fullName')}
                error={errors.fullName?.message}
              />

              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                helperText="Used for notifications from companies"
              />

              <Input
                label="Profile Link"
                {...register('profileLink')}
                error={errors.profileLink?.message}
                placeholder="https://linkedin.com/in/yourprofile"
                helperText="LinkedIn, portfolio, or resume link that companies will see"
              />

              <div className="flex gap-4">
                <Button type="submit" isLoading={isLoading} disabled={!isDirty}>
                  Save Changes
                </Button>
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardTitle>Account Information</CardTitle>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium">Free Tier (2 applications)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
