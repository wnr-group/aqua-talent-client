import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Alert from '@/components/common/Alert'
import Modal from '@/components/common/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Company } from '@/types'
import { api, ApiClientError } from '@/services/api/client'
import { ArrowLeft, Globe, Linkedin, Twitter } from 'lucide-react'

const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media & Entertainment',
  'Consumer Goods',
  'Other',
]

const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

interface CompanyProfileFormValues {
  description: string
  website: string
  industry: string
  size: string
  foundedYear: string
  linkedin: string
  twitter: string
}

type AdminCompanyRecord = Company & { _id?: string }

const normalizeCompany = (item: Company & { _id?: string }): AdminCompanyRecord => ({
  ...item,
  id: item.id || item._id || '',
})

export default function AdminCompanyProfile() {
  const { companyId } = useParams<{ companyId?: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useNotification()
  const [company, setCompany] = useState<Company | null>(null)
  const [companyList, setCompanyList] = useState<AdminCompanyRecord[]>([])
  const [listSearch, setListSearch] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(companyId))
  const [isDirectoryLoading, setIsDirectoryLoading] = useState(!companyId)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectionLoading, setSelectionLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<AdminCompanyRecord | null>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isNotFoundError, setIsNotFoundError] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyProfileFormValues>({
    defaultValues: {
      description: '',
      website: '',
      industry: '',
      size: '',
      foundedYear: '',
      linkedin: '',
      twitter: '',
    },
  })

  useEffect(() => {
    if (!companyId) return

    let isMounted = true
    const fetchCompany = async () => {
      setIsLoading(true)
      setLoadError(null)
      setIsNotFoundError(false)
      try {
        const response = await api.get<Company | { company?: Company } | { data?: Company | { company?: Company } }>(
          `/admin/companies/${companyId}/profile`
        )
        if (!isMounted) return
        const directCompany = (response as { company?: Company }).company
        const nestedData = (response as { data?: Company | { company?: Company } }).data
        let nestedCompany: Company | undefined

        if (nestedData && typeof nestedData === 'object' && 'company' in nestedData) {
          nestedCompany = (nestedData as { company?: Company }).company
        } else {
          nestedCompany = nestedData as Company | undefined
        }

        const companyData = directCompany ?? nestedCompany ?? (response as Company)
        setCompany(companyData ?? null)
      } catch (err) {
        let message = 'Failed to load company'
        if (err instanceof ApiClientError) {
          if (err.status === 404) {
            message = 'Company not found. It may have been removed or is no longer accessible.'
            setIsNotFoundError(true)
          } else if (err.status === 403) {
            message = 'You are not authorized to view this company.'
          } else {
            message = err.message
          }
        } else if (err instanceof Error) {
          message = err.message
        }
        setLoadError(message)
        showError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCompany()

    return () => {
      isMounted = false
    }
  }, [companyId, showError])

  useEffect(() => {
    if (!company) return
    reset({
      description: company.description || '',
      website: company.website || '',
      industry: company.industry || '',
      size: company.size || '',
      foundedYear: company.foundedYear ? String(company.foundedYear) : '',
      linkedin: company.socialLinks?.linkedin || '',
      twitter: company.socialLinks?.twitter || '',
    })
  }, [company, reset])

  useEffect(() => {
    if (companyId) return
    const fetchCompanies = async () => {
      setIsDirectoryLoading(true)
      try {
        const data = await api.get<{ companies: (Company & { _id?: string })[] }>('/admin/companies')
        const normalized = data.companies.map((item) => normalizeCompany(item))
        setCompanyList(normalized)
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load companies')
      } finally {
        setIsDirectoryLoading(false)
      }
    }

    fetchCompanies()
  }, [companyId, showError])

  const filteredCompanies = useMemo(() => {
    const query = listSearch.toLowerCase().trim()
    if (!query) return companyList
    return companyList.filter((item) =>
      [item.name, item.email].some((field) => field?.toLowerCase().includes(query))
    )
  }, [companyList, listSearch])

  const handleViewProfile = async (id?: string | null) => {
    if (!id) {
      showError('Company identifier missing, please refresh and try again.')
      return
    }

    setSelectionLoading(true)
    setSelectionError(null)

    try {
      const response = await api.get<Company | { company: Company }>(`/admin/companies/${id}/profile`)
      const companyPayload = (response as { company?: Company })?.company ?? (response as Company)
      const normalized = normalizeCompany({ ...companyPayload, _id: id })
      setSelectedCompany(normalized)
      setIsPreviewModalOpen(true)
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setSelectedCompany(null)
        setSelectionError('Company not found. It may have been removed.')
        setIsPreviewModalOpen(true)
      } else {
        showError(err instanceof Error ? err.message : 'Failed to load latest profile details')
      }
    } finally {
      setSelectionLoading(false)
    }
  }

  const handleEditProfile = async (id?: string | null) => {
    if (!id) {
      showError('Company identifier missing, please refresh and try again.')
      return
    }

    setSelectionLoading(true)
    setSelectionError(null)

    try {
      const response = await api.get<Company | { company: Company }>(`/admin/companies/${id}/profile`)
      const companyPayload = (response as { company?: Company })?.company ?? (response as Company)
      const normalized = normalizeCompany({ ...companyPayload, _id: id })
      setSelectedCompany(normalized)
      const targetId = normalized.id || id
      if (!targetId) {
        showError('Unable to open editor for this company.')
        return
      }
      setIsPreviewModalOpen(false)
      navigate(`/companies/profiles/${targetId}`, { state: { company: normalized } })
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setSelectedCompany(null)
        setSelectionError('Company not found. It may have been removed.')
        setIsPreviewModalOpen(true)
      } else {
        showError(err instanceof Error ? err.message : 'Failed to load company profile for editing')
      }
    } finally {
      setSelectionLoading(false)
    }
  }

  const handleProfileSubmit = async (values: CompanyProfileFormValues) => {
    if (!companyId) return
    setIsSaving(true)
    try {
      const payload = {
        description: values.description?.trim() || null,
        website: values.website?.trim() || null,
        industry: values.industry || null,
        size: values.size || null,
        foundedYear: values.foundedYear ? Number(values.foundedYear) : null,
        socialLinks: {
          linkedin: values.linkedin?.trim() || null,
          twitter: values.twitter?.trim() || null,
        },
      }
      const updated = await api.patch<Company>(`/admin/companies/${companyId}/profile`, payload)
      setCompany(updated)
      success('Company profile updated successfully')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (company) {
      reset({
        description: company.description || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || '',
        foundedYear: company.foundedYear ? String(company.foundedYear) : '',
        linkedin: company.socialLinks?.linkedin || '',
        twitter: company.socialLinks?.twitter || '',
      })
    }
  }

  if (!companyId) {
    return (
      <PageContainer
        title="Company Profiles"
        description="Select a company to view or edit its public profile details."
      >
        <Card>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Search"
                placeholder="Search by name or email"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
              />
              {isDirectoryLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No companies found.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredCompanies.map((item) => {
                    const identifier = item._id || item.id
                    return (
                      <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.email}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewProfile(identifier)}
                          disabled={selectionLoading}
                        >
                          View Profile
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false)
            setSelectedCompany(null)
            setSelectionError(null)
          }}
          title={selectedCompany?.name || 'Company Profile'}
          size="lg"
        >
          {selectionLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : selectionError ? (
            <Alert variant="warning">{selectionError}</Alert>
          ) : selectedCompany ? (
            <div className="space-y-4 text-gray-900">
              {selectedCompany.logo && (
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCompany.logo}
                    alt={`${selectedCompany.name} logo`}
                    className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
                  />
                  <div>
                    <p className="text-sm text-gray-500">Logo</p>
                    <p className="font-medium text-gray-900">{selectedCompany.name}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedCompany.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant="secondary">{selectedCompany.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">{selectedCompany.industry || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company Size</p>
                  <p className="font-medium">{selectedCompany.size || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Founded</p>
                  <p className="font-medium">{selectedCompany.foundedYear || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  {selectedCompany.website ? (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {selectedCompany.website}
                    </a>
                  ) : (
                    <p className="font-medium">—</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1 text-gray-800 whitespace-pre-line">
                  {selectedCompany.description || 'No description provided.'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-900 mb-1">Social Links</p>
                <ul className="space-y-1">
                  <li>
                    LinkedIn:{' '}
                    {selectedCompany.socialLinks?.linkedin ? (
                      <a
                        href={selectedCompany.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {selectedCompany.socialLinks.linkedin}
                      </a>
                    ) : (
                      '—'
                    )}
                  </li>
                  <li>
                    Twitter:{' '}
                    {selectedCompany.socialLinks?.twitter ? (
                      <a
                        href={selectedCompany.socialLinks.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {selectedCompany.socialLinks.twitter}
                      </a>
                    ) : (
                      '—'
                    )}
                  </li>
                </ul>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPreviewModalOpen(false)
                    setSelectedCompany(null)
                    setSelectionError(null)
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const targetId = selectedCompany._id || selectedCompany.id
                    handleEditProfile(targetId)
                  }}
                >
                  Edit Profile
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

  if (isLoading && !company) {
    return (
      <PageContainer title="Company Profile">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    )
  }

  if (!company) {
    return (
      <PageContainer title="Company Profile">
        <Alert variant={isNotFoundError ? 'warning' : 'error'} className="mb-4">
          {loadError || (isNotFoundError ? 'Company not found.' : 'Unable to load company profile.')}
        </Alert>
        <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/companies/profiles')}>
          Back to Company Profiles
        </Button>
      </PageContainer>
    )
  }

  return (
    <PageContainer title={company.name} description="Review and edit the company profile shown to students.">
      <div className="mb-6">
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/companies/profiles')}
          className="text-gray-600"
        >
          Back to directory
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardContent>
            <div className="space-y-4">
              {company.logo && (
                <div className="flex items-center gap-4">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                  />
                  <div>
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="text-lg font-semibold text-gray-900">{company.name}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">
                  <Badge variant="secondary">{company.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{company.email}</p>
              </div>
              {company.website && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Globe className="w-4 h-4" />
                  <a href={company.website} target="_blank" rel="noreferrer" className="hover:underline">
                    {company.website}
                  </a>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="text-gray-500">Industry</p>
                  <p className="font-medium text-gray-900">{company.industry || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Company Size</p>
                  <p className="font-medium text-gray-900">{company.size || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Founded</p>
                  <p className="font-medium text-gray-900">{company.foundedYear || '—'}</p>
                </div>
              </div>
              <div className="space-y-2">
                {company.socialLinks?.linkedin && (
                  <a
                    href={company.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {company.socialLinks?.twitter && (
                  <a
                    href={company.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Share the company mission, culture, and highlights"
                  {...register('description')}
                />
              </div>

              <Input
                label="Website"
                placeholder="https://example.com"
                {...register('website')}
                error={errors.website?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    {...register('industry')}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    {...register('size')}
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Founded Year"
                  type="number"
                  placeholder="e.g., 2010"
                  {...register('foundedYear', {
                    validate: (value) => {
                      if (!value) return true
                      const year = Number(value)
                      if (Number.isNaN(year)) {
                        return 'Enter a valid year'
                      }
                      if (year < 1800 || year > new Date().getFullYear()) {
                        return `Year must be between 1800 and ${new Date().getFullYear()}`
                      }
                      return true
                    },
                  })}
                  error={errors.foundedYear?.message}
                />
                <Input
                  label="LinkedIn"
                  placeholder="https://linkedin.com/company/example"
                  {...register('linkedin')}
                />
              </div>

              <Input
                label="Twitter"
                placeholder="https://twitter.com/example"
                {...register('twitter')}
              />

              <div className="flex items-center gap-3">
                <Button type="submit" isLoading={isSaving} disabled={!isDirty && !isSaving}>
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
