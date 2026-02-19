import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import Alert from '@/components/common/Alert'
import MediaImage from '@/components/common/MediaImage'
import { useNotification } from '@/contexts/NotificationContext'
import { Company, CompanyStatus } from '@/types'
import { api, ApiClientError } from '@/services/api/client'
import { format } from 'date-fns'
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
  Globe,
  Linkedin,
  Twitter,
} from 'lucide-react'

const statusStyles: Record<CompanyStatus, { bg: string; text: string }> = {
  [CompanyStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [CompanyStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [CompanyStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
}

interface CompanyListItem extends Company {
  _id?: string
}

interface CompanyListResponse {
  companies: CompanyListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminCompanies() {
  const { success, error: showError } = useNotification()
  const [searchParams, setSearchParams] = useSearchParams()

  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  // Filters from URL
  const statusFilter = (searchParams.get('status') as CompanyStatus | 'all') || 'all'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')

  // Modal state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [companyProfile, setCompanyProfile] = useState<Company | null>(null)

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('limit', '20')

      const data = await api.get<CompanyListResponse>(`/admin/companies?${params.toString()}`)

      // Normalize MongoDB _id to id
      const normalizedCompanies = data.companies.map(c => ({
        ...c,
        id: c.id || c._id || '',
      }))

      setCompanies(normalizedCompanies)
      setPagination(data.pagination)
    } catch {
      showError('Failed to load companies')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, search, page, showError])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all' || !value) {
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

  const handleApprove = async (companyId: string) => {
    try {
      await api.patch(`/admin/companies/${companyId}`, {
        status: CompanyStatus.APPROVED,
      })
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId ? { ...c, status: CompanyStatus.APPROVED, rejectionReason: undefined } : c
        )
      )
      success('Company approved successfully')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to approve company')
    }
  }

  const handleSetPending = async (companyId: string) => {
    try {
      await api.patch(`/admin/companies/${companyId}`, {
        status: CompanyStatus.PENDING,
      })
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId ? { ...c, status: CompanyStatus.PENDING } : c
        )
      )
      success('Company set to pending')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update company')
    }
  }

  const handleReject = async () => {
    if (!selectedCompany) return
    try {
      await api.patch(`/admin/companies/${selectedCompany.id}`, {
        status: CompanyStatus.REJECTED,
        rejectionReason: rejectReason,
      })
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id ? { ...c, status: CompanyStatus.REJECTED, rejectionReason: rejectReason } : c
        )
      )
      success('Company rejected')
      setShowRejectModal(false)
      setSelectedCompany(null)
      setRejectReason('')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reject company')
    }
  }

  const openRejectModal = (company: Company) => {
    setSelectedCompany(company)
    setShowRejectModal(true)
  }

  const handleViewProfile = async (company: CompanyListItem) => {
    const companyId = company._id || company.id
    if (!companyId) {
      showError('Company identifier missing')
      return
    }

    setProfileLoading(true)
    setProfileError(null)
    setShowProfileModal(true)

    try {
      const response = await api.get<Company | { company: Company }>(`/admin/companies/${companyId}/profile`)
      const companyData = (response as { company?: Company })?.company ?? (response as Company)
      setCompanyProfile({
        ...companyData,
        id: companyData.id || companyId,
      })
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setProfileError('Company profile not found.')
      } else {
        setProfileError(err instanceof Error ? err.message : 'Failed to load profile')
      }
    } finally {
      setProfileLoading(false)
    }
  }

  const closeProfileModal = () => {
    setShowProfileModal(false)
    setCompanyProfile(null)
    setProfileError(null)
  }

  return (
    <PageContainer
      title="Manage Companies"
      description="Review and manage company registrations"
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', CompanyStatus.PENDING, CompanyStatus.APPROVED, CompanyStatus.REJECTED] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => updateFilter('status', status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex gap-2 flex-1 max-w-md ml-auto">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch} className="px-3">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : companies.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No companies found matching your filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Registered</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{company.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{company.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusStyles[company.status].bg
                          } ${statusStyles[company.status].text}`}
                        >
                          {company.status}
                        </span>
                        {company.status === CompanyStatus.REJECTED && company.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={company.rejectionReason}>
                            {company.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(company.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewProfile(company)}
                            leftIcon={<Eye className="w-3 h-3" />}
                          >
                            View
                          </Button>
                          {company.status === CompanyStatus.PENDING && (
                            <>
                              <Button size="sm" onClick={() => handleApprove(company.id)}>
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectModal(company)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {company.status === CompanyStatus.REJECTED && (
                            <>
                              <Button size="sm" onClick={() => handleApprove(company.id)}>
                                Re-approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSetPending(company.id)}
                              >
                                Set Pending
                              </Button>
                            </>
                          )}
                          {company.status === CompanyStatus.APPROVED && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectModal(company)}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSetPending(company.id)}
                              >
                                Set Pending
                              </Button>
                            </>
                          )}
                        </div>
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
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
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

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setSelectedCompany(null)
          setRejectReason('')
        }}
        title="Reject Company"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting{' '}
            <span className="font-medium">{selectedCompany?.name}</span>.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter rejection reason..."
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false)
                setSelectedCompany(null)
                setRejectReason('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject Company
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={closeProfileModal}
        title={companyProfile?.name || 'Company Profile'}
        size="lg"
      >
        {profileLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : profileError ? (
          <Alert variant="warning">{profileError}</Alert>
        ) : companyProfile ? (
          <div className="space-y-4 text-gray-900">
            {companyProfile.logo && (
              <div className="flex items-center gap-3">
                <MediaImage
                  src={companyProfile.logo}
                  alt={`${companyProfile.name} logo`}
                  className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
                />
                <div>
                  <p className="text-sm text-gray-500">Logo</p>
                  <p className="font-medium text-gray-900">{companyProfile.name}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{companyProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={companyProfile.status === CompanyStatus.APPROVED ? 'success' : 'secondary'}>
                  {companyProfile.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Industry</p>
                <p className="font-medium">{companyProfile.industry || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Company Size</p>
                <p className="font-medium">{companyProfile.size || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Founded</p>
                <p className="font-medium">{companyProfile.foundedYear || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Website</p>
                {companyProfile.website ? (
                  <a
                    href={companyProfile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    {companyProfile.website}
                  </a>
                ) : (
                  <p className="font-medium">—</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1 text-gray-800 whitespace-pre-line">
                {companyProfile.description || 'No description provided.'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p className="font-medium text-gray-900 mb-1">Social Links</p>
              <div className="flex gap-4">
                {companyProfile.socialLinks?.linkedin ? (
                  <a
                    href={companyProfile.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                ) : (
                  <span className="text-gray-400 flex items-center gap-1">
                    <Linkedin className="w-4 h-4" />
                    —
                  </span>
                )}
                {companyProfile.socialLinks?.twitter ? (
                  <a
                    href={companyProfile.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                ) : (
                  <span className="text-gray-400 flex items-center gap-1">
                    <Twitter className="w-4 h-4" />
                    —
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={closeProfileModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <Alert variant="info">Select a company to view its profile.</Alert>
        )}
      </Modal>
    </PageContainer>
  )
}
