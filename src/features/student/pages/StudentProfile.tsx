import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save,
  X,
  Info,
  UploadCloud,
  FileDown,
  Video,
  MapPin,
  CalendarClock,
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import StudentNavbar from '@/components/layout/StudentNavbar'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { api, fetchApi } from '@/services/api/client'
import { getMediaUrl } from '@/services/media'
import SkillsSection from '@/features/student/components/SkillsSection'
import EducationSection from '@/features/student/components/EducationSection'
import ExperienceSection from '@/features/student/components/ExperienceSection'
import ProfileCompleteness from '@/features/student/components/ProfileCompleteness'
import type {
  StudentProfileFormValues,
  ProfileCompletenessData,
  ExperienceFormValue,
} from '@/features/student/types'

interface StudentProfileApiResponse {
  studentId?: string
  fullName: string
  email: string
  isDGShipping?: 'yes' | 'no'
  profileLink?: string | null
  bio?: string | null
  location?: string | null
  availableFrom?: string | null
  introVideoUrl?: string | null
  resumeUrl?: string | null
  skills?: string[] | null
  education?: Array<{
    institution: string
    degree: string
    field: string
    startYear?: number | null
    endYear?: number | null
  }> | null
  experience?: Array<{
    company: string
    title: string
    startDate: string
    endDate?: string | null
    description?: string | null
  }> | null
}

const MAX_RESUME_SIZE = 5 * 1024 * 1024
const MAX_VIDEO_SIZE = 30 * 1024 * 1024
const PDF_MAGIC = '%PDF'
const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/x-msvideo',
  'video/3gpp',
]

const yearSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^[0-9]{4}$/.test(value), {
    message: 'Enter a 4-digit year',
  })

const educationSchema = z
  .object({
    institution: z.string().min(2, 'Institution is required'),
    degree: z.string().min(2, 'Degree is required'),
    field: z.string().min(2, 'Field is required'),
    startYear: yearSchema,
    endYear: yearSchema,
  })
  .refine(
    (value) => {
      if (!value.startYear || !value.endYear) return true
      return Number(value.endYear) >= Number(value.startYear)
    },
    {
      message: 'End year must be greater than start year',
      path: ['endYear'],
    }
  )

const experienceSchema = z
  .object({
    company: z.string().min(2, 'Company is required'),
    title: z.string().min(2, 'Role is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string(),
    description: z.string().max(500, 'Keep description under 500 characters'),
  })
  .refine(
    (value) => {
      if (!value.endDate) return true
      return new Date(value.endDate) >= new Date(value.startDate)
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  isDGShipping: z.enum(['yes', 'no']), 
  profileLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  bio: z.string().max(600, 'Bio must be under 600 characters').optional(),
  location: z.string().max(120, 'Location must be under 120 characters').optional(),
  availableFrom: z.string().optional(),
  introVideoUrl: z.string().url('Enter a valid video link').or(z.literal('')).optional(),
  skills: z.array(z.string()).max(25, 'Limit to 25 skills'),
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
})

const DEFAULT_FORM_VALUES: StudentProfileFormValues = {
  fullName: '',
  email: '',
  isDGShipping: 'no',
  profileLink: '',
  bio: '',
  location: '',
  availableFrom: '',
  introVideoUrl: '',
  skills: [],
  education: [],
  experience: [],
}

const inputClasses = `
  w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all text-gray-900
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
  border-gray-200 hover:border-blue-300
`

const textareaClasses = `${inputClasses} min-h-[140px] resize-none`

async function validatePdfFile(file: File) {
  if (file.type !== 'application/pdf') {
    throw new Error('Resume must be a PDF file')
  }
  if (file.size > MAX_RESUME_SIZE) {
    throw new Error('Resume must be under 5MB')
  }

  // Simple magic-byte validation for PDF files
  const header = await file.slice(0, PDF_MAGIC.length).text()
  if (!header.startsWith(PDF_MAGIC)) {
    throw new Error('Uploaded file is not a valid PDF document')
  }
}

function validateVideoFile(file: File) {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    throw new Error('Video must be MP4, WebM, MOV, or AVI format')
  }
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error('Video must be under 30MB')
  }
}

function mapApiToFormValues(data: StudentProfileApiResponse): StudentProfileFormValues {
  return {
    fullName: data.fullName ?? '',
    email: data.email ?? '',
    isDGShipping: data.isDGShipping ?? 'no',
    profileLink: data.profileLink ?? '',
    bio: data.bio ?? '',
    location: data.location ?? '',
    availableFrom: data.availableFrom ? data.availableFrom.split('T')[0] : '',
    introVideoUrl: data.introVideoUrl ?? '',
    skills: data.skills ?? [],
    education:
      data.education?.map((entry) => ({
        institution: entry.institution ?? '',
        degree: entry.degree ?? '',
        field: entry.field ?? '',
        startYear: entry.startYear ? String(entry.startYear) : '',
        endYear: entry.endYear ? String(entry.endYear) : '',
      })) ?? [],
    experience:
      (data.experience?.map<ExperienceFormValue>((entry) => ({
        company: entry.company ?? '',
        title: entry.title ?? '',
        startDate: entry.startDate?.split('T')[0] ?? '',
        endDate: entry.endDate?.split('T')[0] ?? '',
        description: entry.description ?? '',
      })) ?? []),
  }
}

function mapFormValuesToPayload(values: StudentProfileFormValues) {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    isDGShipping: values.isDGShipping,
    profileLink: values.profileLink?.trim() || null,
    bio: values.bio?.trim() || null,
    location: values.location?.trim() || null,
    availableFrom: values.availableFrom || null,
    introVideoUrl: values.introVideoUrl?.trim() || null,
    skills: values.skills,
    education: values.education.map((entry) => ({
      institution: entry.institution.trim(),
      degree: entry.degree.trim(),
      field: entry.field.trim(),
      startYear: entry.startYear ? Number(entry.startYear) : null,
      endYear: entry.endYear ? Number(entry.endYear) : null,
    })),
    experience: values.experience.map((entry) => ({
      company: entry.company.trim(),
      title: entry.title.trim(),
      startDate: entry.startDate,
      endDate: entry.endDate || null,
      description: entry.description?.trim() || null,
    })),
  }
}

export default function StudentProfile() {
  const { user, refreshUser } = useAuthContext()
  const { success, error: showError } = useNotification()

  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [completeness, setCompleteness] = useState<ProfileCompletenessData | null>(null)
  const [isCompletenessLoading, setIsCompletenessLoading] = useState(true)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [isDGShippingDisplay, setIsDGShippingDisplay] = useState<'yes' | 'no'>('no')

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const introVideoUrlValue = watch('introVideoUrl')

  const fetchCompleteness = useCallback(async () => {
    setIsCompletenessLoading(true)
    try {
      const data = await api.get<ProfileCompletenessData>('/student/profile/completeness')
      setCompleteness(data)
    } catch {
      setCompleteness(null)
    } finally {
      setIsCompletenessLoading(false)
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    setIsFetching(true)
    try {
      const data = await api.get<StudentProfileApiResponse>('/student/profile')

      // Resolve S3 keys to presigned URLs
      const [resolvedResumeUrl, resolvedVideoUrl] = await Promise.all([
        getMediaUrl(data.resumeUrl),
        getMediaUrl(data.introVideoUrl),
      ])

      const formValues = mapApiToFormValues(data)
      if (resolvedVideoUrl) {
        formValues.introVideoUrl = resolvedVideoUrl
      }
      reset(formValues)
      setResumeUrl(resolvedResumeUrl)
      setStudentId(data.studentId ?? null)
      setIsDGShippingDisplay(data.isDGShipping ?? 'no')
    } catch (error) {
      if (user?.student) {
        reset({
          ...DEFAULT_FORM_VALUES,
          fullName: user.student.fullName,
          email: user.student.email,
          profileLink: user.student.profileLink ?? '',
        })
      }
      showError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setIsFetching(false)
    }
  }, [reset, showError, user?.student])

  useEffect(() => {
    fetchProfile()
    fetchCompleteness()
  }, [fetchProfile, fetchCompleteness])

  const handleResumeUpload = async (file?: File) => {
    if (!file) return
    setResumeError(null)
    try {
      await validatePdfFile(file)
      setIsUploadingResume(true)
      const formData = new FormData()
      formData.append('resume', file)
      const response = await fetchApi<{ resumeUrl: string }>('/student/profile/resume', {
        method: 'POST',
        body: formData,
      })
      const resolvedUrl = await getMediaUrl(response?.resumeUrl)
      setResumeUrl(resolvedUrl)
      success('Resume uploaded successfully')
      await fetchCompleteness()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload resume'
      setResumeError(message)
      showError(message)
    } finally {
      setIsUploadingResume(false)
    }
  }

  const handleVideoUpload = async (file?: File) => {
    if (!file) return
    setVideoError(null)
    try {
      validateVideoFile(file)
      setIsUploadingVideo(true)
      const formData = new FormData()
      formData.append('video', file)
      const response = await fetchApi<{ introVideoUrl: string }>('/student/profile/video', {
        method: 'POST',
        body: formData,
      })
      if (response?.introVideoUrl) {
        const resolvedUrl = await getMediaUrl(response.introVideoUrl)
        if (resolvedUrl) {
          setValue('introVideoUrl', resolvedUrl, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      }
      success('Intro video uploaded successfully')
      await fetchCompleteness()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload video'
      setVideoError(message)
      showError(message)
    } finally {
      setIsUploadingVideo(false)
    }
  }

  const [isDeletingVideo, setIsDeletingVideo] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteAccount = () => {
    const email = user?.student?.email || ''
    const name = user?.student?.fullName || user?.username || ''
    const subject = encodeURIComponent('Account Deletion Request')
    const body = encodeURIComponent(
      `Hi,\n\nI would like to request deletion of my Aquatalentz account.\n\nName: ${name}\nEmail: ${email}\n\nPlease confirm once my account and data have been removed.\n\nThank you.`
    )
    window.open(`mailto:support@aquatalentz.com?subject=${subject}&body=${body}`)
    setShowDeleteModal(false)
  }

  const handleVideoDelete = async () => {
    setVideoError(null)
    setIsDeletingVideo(true)
    try {
      await api.delete('/student/profile/video')
      setValue('introVideoUrl', '', { shouldDirty: false, shouldValidate: true })
      success('Intro video deleted successfully')
      await fetchCompleteness()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete video'
      setVideoError(message)
      showError(message)
    } finally {
      setIsDeletingVideo(false)
    }
  }

  const onSubmit = async (values: StudentProfileFormValues) => {
    setIsSaving(true)
    try {
      const payload = mapFormValuesToPayload(values)
      await api.patch('/student/profile', payload)
      await refreshUser()
      success('Profile updated successfully!')
      await fetchProfile()
      await fetchCompleteness()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const resumeLabel = useMemo(() => {
    if (!resumeUrl) return 'No resume uploaded yet'
    try {
      const url = new URL(resumeUrl)
      const segments = url.pathname.split('/')
      return segments.pop() || 'resume.pdf'
    } catch {
      const segments = resumeUrl.split('/')
      return segments.pop() || 'resume.pdf'
    }
  }, [resumeUrl])

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    handleResumeUpload(file)
  }

  const scrollToForm = () => {
    const element = document.getElementById('student-profile-form')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  const subscriptionTier =
    (user as { student?: { subscriptionTier?: 'free' | 'paid' } } | null)?.student?.subscriptionTier ?? 'free'

  const completionPercentage = completeness?.percentage ?? 0
  const isProfileComplete = completionPercentage >= 100
  const profileHealthText = isCompletenessLoading
    ? 'Measuring profile health…'
    : isProfileComplete
    ? 'Profile complete'
    : `Profile ${completionPercentage}% ready`
  const profileHealth = useMemo(() => {
    const percent = completeness?.percentage ?? 0

    if (percent >= 91) {
      return { label: 'Excellent', colorClass: 'text-green-600' }
    }
    if (percent >= 71) {
      return { label: 'Good', colorClass: 'text-blue-600' }
    }
    if (percent >= 41) {
      return { label: 'Average', colorClass: 'text-yellow-600' }
    }
    return { label: 'Poor', colorClass: 'text-red-500' }
  }, [completeness?.percentage])

  const memberSince = useMemo(() => {
    const createdAt = user?.student?.createdAt
    if (!createdAt) return '—'
    const date = new Date(createdAt)
    if (Number.isNaN(date.getTime())) {
      return '—'
    }
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  }, [user?.student?.createdAt])

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Student Profile</h1>
              <p className="text-gray-500">
                Showcase your background so companies can match with you faster.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {user?.student?.fullName || user?.username}
                </p>
                {studentId && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    ID: {studentId}
                  </span>
                )}
                {isDGShippingDisplay === 'yes' && (
                  <Badge
                    variant="success"
                    className="bg-teal-100 text-teal-700 border border-teal-200"
                  >
                    DGS Certified
                  </Badge>
                )}
                <Badge
                  variant={subscriptionTier === 'paid' ? 'primary' : 'secondary'}
                  className={
                    subscriptionTier === 'paid'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : ''
                  }
                >
                  {subscriptionTier === 'paid' ? 'Paid Tier' : 'Free Tier'}
                </Badge>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    isProfileComplete
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-purple-100 text-purple-700 border-purple-200'
                  }`}
                >
                  {profileHealthText}
                </span>
              </div>
            </div>
            <div className="max-w-sm text-sm text-gray-500">
              Profiles above 80% completeness get highlighted to companies. Keep your story fresh to stand out.
            </div>
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <form
              id="student-profile-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Keep your profile up to date. Recruiters see this information before inviting you to interviews.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                    <input className={inputClasses} {...register('fullName')} />
                    {errors.fullName && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                    <input type="email" className={inputClasses} {...register('email')} />
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Used for notifications and interview invites.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Profile Link</label>
                  <input
                    className={inputClasses}
                    placeholder="https://linkedin.com/in/yourprofile"
                    {...register('profileLink')}
                  />
                  {errors.profileLink && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.profileLink.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Share your LinkedIn, portfolio, or Notion resume.
                  </p>
                </div>

                 <div>
  <label className="block text-sm font-medium text-gray-900 mb-3">
    Are you a Directorate General of Shipping?
  </label>

  <div className="flex items-center gap-6">
    <label className="flex items-center gap-2 text-gray-700">
      <input
        {...register('isDGShipping')}
        type="radio"
        value="yes"
        className="text-blue-600 focus:ring-blue-500"
      />
      Yes
    </label>

    <label className="flex items-center gap-2 text-gray-700">
      <input
        {...register('isDGShipping')}
        type="radio"
        value="no"
        className="text-blue-600 focus:ring-blue-500"
      />
      No
    </label>
  </div>

  {errors.isDGShipping && (
    <p className="mt-1.5 text-sm text-red-600">
      {errors.isDGShipping.message}
    </p>
  )}
</div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Location
                    </label>
                    <input className={inputClasses} placeholder="San Francisco, CA" {...register('location')} />
                    {errors.location && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CalendarClock className="w-4 h-4" /> Available From
                    </label>
                    <input type="date" className={inputClasses} {...register('availableFrom')} />
                    <p className="mt-1 text-xs text-gray-500">
                      Let companies know when you can start.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
                  <textarea
                    className={textareaClasses}
                    placeholder="Tell us about your mission, strengths, and what you're looking for."
                    {...register('bio')}
                  />
                  {errors.bio && <p className="mt-1.5 text-sm text-red-600">{errors.bio.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4" /> Tell me about yourself video
                  </label>
                  <input type="hidden" {...register('introVideoUrl')} />
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      Upload a short intro video (MP4, WebM, MOV up to 30MB).
                    </p>
                    <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
                      Upload video
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(event) => {
                          handleVideoUpload(event.target.files?.[0])
                          event.target.value = ''
                        }}
                      />
                    </label>
                    {isUploadingVideo && (
                      <p className="mt-2 text-xs text-gray-500">Uploading...</p>
                    )}
                    {videoError && <p className="mt-2 text-sm text-red-600">{videoError}</p>}
                    {introVideoUrlValue ? (
                      <div className="mt-4 space-y-2">
                        <video
                          src={introVideoUrlValue}
                          controls
                          className="w-full rounded-xl border border-gray-200"
                        />
                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                          <a
                            href={introVideoUrlValue}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            Open in new tab
                          </a>
                          <button
                            type="button"
                            onClick={handleVideoDelete}
                            disabled={isDeletingVideo}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            {isDeletingVideo ? 'Deleting...' : 'Delete video'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-gray-500">
                        Share your story in under 60 seconds. Strong intros stand out to recruiters.
                      </p>
                    )}
                  </div>
                  {errors.introVideoUrl && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.introVideoUrl.message}</p>
                  )}
                </div>
              </div>

              <SkillsSection control={control} error={errors.skills?.message as string | undefined} />
              <EducationSection control={control} register={register} errors={errors} />
              <ExperienceSection control={control} register={register} errors={errors} />

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-display font-semibold text-gray-900">Resume</h3>
                  <p className="text-sm text-gray-500">
                    Upload a PDF resume (max 5MB). We'll share it with companies when you apply.
                  </p>
                </div>
                <div
                  className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <UploadCloud className="w-10 h-10 mx-auto text-blue-600 mb-3" />
                  <p className="text-sm text-gray-500 mb-3">
                    Drag and drop your PDF here, or
                  </p>
                  <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
                    Browse files
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        handleResumeUpload(event.target.files?.[0])
                        event.target.value = ''
                      }}
                    />
                  </label>
                  <p className="mt-3 text-sm text-gray-900 flex items-center justify-center gap-2">
                    <FileDown className="w-4 h-4" /> {resumeLabel}
                  </p>
                  {resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 underline mt-2 inline-flex items-center gap-2"
                    >
                      Download current resume
                    </a>
                  )}
                  {resumeError && <p className="mt-2 text-sm text-red-600">{resumeError}</p>}
                  {isUploadingResume && (
                    <p className="mt-2 text-xs text-gray-500">Uploading...</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save Changes
                </button>
                {isDirty && (
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-6">
              <ProfileCompleteness
                percentage={completeness?.percentage}
                missingItems={completeness?.missingItems}
                isLoading={isCompletenessLoading}
                title="Profile health"
                description="Checklist of what companies still need to see."
                healthInfo={profileHealth}
                actionSlot={
                  completeness && completeness.percentage < 100 ? (
                    <button
                      type="button"
                      onClick={scrollToForm}
                      className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Complete Profile
                    </button>
                  ) : null
                }
              />

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-display font-semibold text-gray-900 mb-4">
                  Account Details
                </h2>
                <div className="space-y-4 text-sm">
                  {studentId && (
                    <div>
                      <p className="text-gray-500">Student ID</p>
                      <p className="font-medium text-gray-900">{studentId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Username</p>
                    <p className="font-medium text-gray-900">{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">DG Shipping</p>
                    {isDGShippingDisplay === 'yes' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-teal-100 text-teal-700 border-teal-200">
                        DGS Certified
                      </span>
                    ) : (
                      <p className="font-medium text-gray-900">No</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500">Member since</p>
                    <p className="font-medium text-gray-900">{memberSince}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        user?.student?.isHired
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-purple-100 text-purple-700 border-purple-200'
                      }`}
                    >
                      {user?.student?.isHired ? 'Hired' : 'Actively searching'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Subscription</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                      {subscriptionTier === 'paid' ? 'Paid tier' : 'Free tier (2 apps)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-8 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-red-400 font-semibold text-lg mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-400 mb-4">
            Request permanent deletion of your account and all associated data. Your account will remain active until our support team processes the request.
          </p>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            Delete My Account
          </Button>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Account"
          >
            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to request account deletion? This will open your email client with a pre-filled deletion request to our support team. Your account will remain active until we process the request.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Yes, Request Deletion
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  )
}
