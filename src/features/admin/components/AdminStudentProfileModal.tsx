import { useEffect, useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import {
  User,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  FileText,
  Video,
  Briefcase,
  GraduationCap,
  X,
} from 'lucide-react'

interface StudentProfile {
  id: string
  fullName: string
  email: string
  profileLink?: string | null
  bio?: string | null
  location?: string | null
  availableFrom?: string | null
  skills: string[]
  education: Array<{
    institution: string
    degree: string
    field: string
    startYear: number
    endYear?: number
  }>
  experience: Array<{
    company: string
    title: string
    startDate: string
    endDate?: string | null
    description?: string
  }>
  resumeUrl?: string | null
  introVideoUrl?: string | null
  isHired: boolean
  createdAt?: string
}

interface AdminStudentProfileModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: string | null
  studentName?: string
}

export default function AdminStudentProfileModal({
  isOpen,
  onClose,
  studentId,
  studentName = 'Student',
}: AdminStudentProfileModalProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = profile?.fullName || studentName

  useEffect(() => {
    if (!isOpen || !studentId) {
      setProfile(null)
      setError(null)
      return
    }

    const fetchProfile = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.get<StudentProfile>(`/admin/students/${studentId}`)
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load student profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [isOpen, studentId])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {profile.isHired && (
                    <Badge variant="success">Hired</Badge>
                  )}
                  {profile.createdAt && (
                    <span className="text-xs text-gray-400">
                      Joined {format(new Date(profile.createdAt), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
                <p className="text-sm text-gray-600">{profile.bio}</p>
              </div>
            )}

            {/* Availability */}
            {profile.availableFrom && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  Available from {format(new Date(profile.availableFrom), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience && profile.experience.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Experience
                </h3>
                <div className="space-y-3">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <p className="font-medium text-gray-900">{exp.title}</p>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(exp.startDate), 'MMM yyyy')} -{' '}
                        {exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </h3>
                <div className="space-y-3">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <p className="font-medium text-gray-900">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-500">
                        {edu.startYear} - {edu.endYear || 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents & Links */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  View Resume
                </a>
              )}
              {profile.introVideoUrl && (
                <a
                  href={profile.introVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  <Video className="w-4 h-4" />
                  Watch Intro Video
                </a>
              )}
              {profile.profileLink && (
                <a
                  href={profile.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  External Profile
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No profile data available</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
