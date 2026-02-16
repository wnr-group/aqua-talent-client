import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Badge from '@/components/common/Badge'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { api } from '@/services/api/client'
import {
  LogOut,
  Briefcase,
  FileText,
  User,
  Save,
  X,
  Info
} from 'lucide-react'
import Logo from '@/components/common/Logo'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  profileLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function StudentProfile() {
  const { user, refreshUser, logout } = useAuthContext()
  const navigate = useNavigate()
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

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

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

  return (
    <div className="min-h-screen ocean-bg">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <Logo size="md" />
            </Link>

            <div className="flex items-center gap-6">
              <Link
                to="/jobs"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Link>
              <Link
                to="/my-applications"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                My Applications
              </Link>
              <Link
                to="/profile"
                className="text-foreground flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-coral transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
          <div className="mt-3 flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{user?.student?.fullName || user?.username}</p>
            <Badge
              variant={(user as { student?: { subscriptionTier?: 'free' | 'paid' } } | null)?.student?.subscriptionTier === 'paid' ? 'primary' : 'secondary'}
              className={(user as { student?: { subscriptionTier?: 'free' | 'paid' } } | null)?.student?.subscriptionTier === 'paid'
                ? 'bg-glow-cyan/20 text-foreground border border-glow-cyan/30'
                : 'bg-ocean-dark/50 text-muted-foreground border border-border'}
            >
              {(user as { student?: { subscriptionTier?: 'free' | 'paid' } } | null)?.student?.subscriptionTier === 'paid' ? 'Paid Tier' : 'Free Tier'}
            </Badge>
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Form Card */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-xl font-display font-semibold text-foreground mb-6">
                Profile Information
              </h2>

              {/* Info Alert */}
              <div className="mb-6 p-4 rounded-xl bg-glow-cyan/10 border border-glow-cyan/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-glow-cyan flex-shrink-0 mt-0.5" />
                <p className="text-sm text-glow-cyan">
                  Your profile link is shared with companies when you apply to jobs. Make sure it's up to date!
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('fullName')}
                    type="text"
                    className={`
                      w-full px-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all
                      text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-glow-cyan/50 focus:border-glow-cyan
                      ${errors.fullName ? 'border-coral' : 'border-border hover:border-glow-cyan/30'}
                    `}
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-sm text-coral">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`
                      w-full px-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all
                      text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-glow-cyan/50 focus:border-glow-cyan
                      ${errors.email ? 'border-coral' : 'border-border hover:border-glow-cyan/30'}
                    `}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-coral">{errors.email.message}</p>
                  )}
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Used for notifications from companies
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Profile Link
                  </label>
                  <input
                    {...register('profileLink')}
                    type="text"
                    placeholder="https://linkedin.com/in/yourprofile"
                    className={`
                      w-full px-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all
                      text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-glow-cyan/50 focus:border-glow-cyan
                      ${errors.profileLink ? 'border-coral' : 'border-border hover:border-glow-cyan/30'}
                    `}
                  />
                  {errors.profileLink && (
                    <p className="mt-1.5 text-sm text-coral">{errors.profileLink.message}</p>
                  )}
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    LinkedIn, portfolio, or resume link that companies will see
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !isDirty}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-glow-cyan to-glow-teal text-ocean-deep font-semibold glow-sm hover:glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-ocean-deep/30 border-t-ocean-deep rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Changes
                  </button>
                  {isDirty && (
                    <button
                      type="button"
                      onClick={() => reset()}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-glow-cyan/30 transition-all"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Account Info Card */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-xl font-display font-semibold text-foreground mb-6">
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium text-foreground">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-glow-purple/20 text-glow-purple border border-glow-purple/30">
                    Free Tier (2 applications)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
