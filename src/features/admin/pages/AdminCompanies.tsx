import { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Company, CompanyStatus } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'

const statusStyles: Record<CompanyStatus, { bg: string; text: string }> = {
  [CompanyStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [CompanyStatus.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800' },
  [CompanyStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800' },
}

export default function AdminCompanies() {
  const { success, error: showError } = useNotification()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<CompanyStatus | 'all'>(CompanyStatus.PENDING)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true)
      try {
        const params = filter !== 'all' ? `?status=${filter}` : ''
        const data = await api.get<{ companies: (Company & { _id?: string })[] }>(`/admin/companies${params}`)
        // Normalize MongoDB _id to id
        const normalizedCompanies = data.companies.map(c => ({
          ...c,
          id: c.id || c._id || '',
        }))
        setCompanies(normalizedCompanies)
      } catch {
        // Companies will remain empty
      } finally {
        setIsLoading(false)
      }
    }
    fetchCompanies()
  }, [filter])

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

  return (
    <PageContainer title="Manage Companies">
      <div className="mb-6 flex gap-2">
        {([CompanyStatus.PENDING, CompanyStatus.APPROVED, CompanyStatus.REJECTED, 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : companies.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No companies found.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{company.name}</p>
                  <p className="text-sm text-gray-500">{company.email}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Registered {format(new Date(company.createdAt), 'MMM d, yyyy')}
                  </p>
                  {company.status === CompanyStatus.REJECTED && company.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Rejection reason: {company.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusStyles[company.status].bg
                    } ${statusStyles[company.status].text}`}
                  >
                    {company.status}
                  </span>
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
              </div>
            </Card>
          ))}
        </div>
      )}

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
            className="w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
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
    </PageContainer>
  )
}
