import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  Check,
  X,
} from 'lucide-react'

interface StudentListItem {
  id: string
  fullName: string
  email: string
  subscriptionTier: 'free' | 'paid'
  isHired: boolean
  hasResume: boolean
  hasVideo: boolean
  totalApplications: number
  activeApplications: number
  createdAt: string
}

interface StudentListResponse {
  students: StudentListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminStudents() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [students, setStudents] = useState<StudentListItem[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  // Filters from URL
  const subscriptionTier = searchParams.get('subscriptionTier') || 'all'
  const hasActiveApplications = searchParams.get('hasActiveApplications') || 'all'
  const isHired = searchParams.get('isHired') || 'all'
  const hasResume = searchParams.get('hasResume') || 'all'
  const hasVideo = searchParams.get('hasVideo') || 'all'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (subscriptionTier !== 'all') params.set('subscriptionTier', subscriptionTier)
      if (hasActiveApplications !== 'all') params.set('hasActiveApplications', hasActiveApplications)
      if (isHired !== 'all') params.set('isHired', isHired)
      if (hasResume !== 'all') params.set('hasResume', hasResume)
      if (hasVideo !== 'all') params.set('hasVideo', hasVideo)
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('limit', '20')

      const data = await api.get<StudentListResponse>(`/admin/students?${params.toString()}`)
      setStudents(data.students)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setIsLoading(false)
    }
  }, [subscriptionTier, hasActiveApplications, isHired, hasResume, hasVideo, search, page])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all') {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    newParams.set('page', '1') // Reset to page 1 on filter change
    setSearchParams(newParams)
  }

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams)
    if (searchInput) {
      newParams.set('search', searchInput)
    } else {
      newParams.delete('search')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', String(newPage))
    setSearchParams(newParams)
  }

  const FilterSelect = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <PageContainer
      title="Student Management"
      description="View and manage all registered students"
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <FilterSelect
              label="Subscription"
              value={subscriptionTier}
              onChange={(v) => updateFilter('subscriptionTier', v)}
              options={[
                { value: 'all', label: 'All Tiers' },
                { value: 'free', label: 'Free' },
                { value: 'paid', label: 'Paid' },
              ]}
            />
            <FilterSelect
              label="Active Applications"
              value={hasActiveApplications}
              onChange={(v) => updateFilter('hasActiveApplications', v)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Has Active' },
                { value: 'false', label: 'No Active' },
              ]}
            />
            <FilterSelect
              label="Hired Status"
              value={isHired}
              onChange={(v) => updateFilter('isHired', v)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Hired' },
                { value: 'false', label: 'Not Hired' },
              ]}
            />
            <FilterSelect
              label="Has Resume"
              value={hasResume}
              onChange={(v) => updateFilter('hasResume', v)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
            />
            <FilterSelect
              label="Has Video"
              value={hasVideo}
              onChange={(v) => updateFilter('hasVideo', v)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Search</label>
              <div className="flex gap-2">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Name or email..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleSearch} className="px-3">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No students found matching your filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tier</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Applications</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Resume</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Video</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{student.fullName}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={student.subscriptionTier === 'paid' ? 'success' : 'secondary'}
                        >
                          {student.subscriptionTier === 'paid' ? 'Paid' : 'Free'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {student.totalApplications} / {student.activeApplications} active
                      </td>
                      <td className="py-3 px-4 text-center">
                        {student.hasResume ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {student.hasVideo ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {student.isHired ? (
                          <Badge variant="success">Hired</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(student.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/students/${student.id}`)
                          }}
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
