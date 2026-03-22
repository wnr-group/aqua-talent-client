import { useEffect, useState, useCallback } from 'react'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { api } from '@/services/api/client'
import { Package, Plus, Pencil, Trash2, Globe, Briefcase } from 'lucide-react'

interface Addon {
  id: string
  name: string
  description?: string
  type: 'zone' | 'jobs'
  priceINR: number
  priceUSD: number
  // zone addon
  zoneCount?: number | null
  unlockAllZones?: boolean
  // job addon
  jobCreditCount?: number | null
}

type AddonType = 'zone' | 'jobs'

interface AddonFormData {
  name: string
  description: string
  type: AddonType
  priceINR: number
  priceUSD: number
  // zone addon
  zoneCount: number
  unlockAllZones: boolean
  // job addon
  jobCreditCount: number
}

const defaultAddonForm: AddonFormData = {
  name: '',
  description: '',
  type: 'zone',
  priceINR: 0,
  priceUSD: 0,
  zoneCount: 1,
  unlockAllZones: false,
  jobCreditCount: 1,
}

export default function AdminAddons() {
  const { success, error: showError } = useNotification()
  const [addons, setAddons] = useState<Addon[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Create/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [form, setForm] = useState<AddonFormData>(defaultAddonForm)
  const [isSaving, setIsSaving] = useState(false)

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [addonToDelete, setAddonToDelete] = useState<Addon | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchAddons = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.get<{ addons: Addon[] }>('/admin/addons')
      console.log('Addon API response:', data.addons)
      setAddons(data.addons)
    } catch {
      showError('Failed to load addons')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchAddons()
  }, [fetchAddons])

  const openCreateModal = () => {
    setEditingAddon(null)
    setForm(defaultAddonForm)
    setIsModalOpen(true)
  }

  const openEditModal = (addon: Addon) => {
    setEditingAddon(addon)
    setForm({
      name: addon.name || '',
      description: addon.description || '',
      type: addon.type ?? 'zone',
      priceINR: addon.priceINR || 0,
      priceUSD: addon.priceUSD || 0,
      zoneCount: addon.zoneCount || 1,
      unlockAllZones: addon.unlockAllZones || false,
      jobCreditCount: addon.jobCreditCount || 1,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError('Addon name is required')
      return
    }
    if (!form.priceINR || form.priceINR <= 0) {
      showError('India price (priceINR) is required')
      return
    }
    if (!form.priceUSD || form.priceUSD <= 0) {
      showError('International price (priceUSD) is required')
      return
    }
    if (form.type === 'zone' && !form.unlockAllZones && (!form.zoneCount || form.zoneCount < 1)) {
      showError('Zone count is required when not unlocking all zones')
      return
    }
    if (form.type === 'jobs' && (!form.jobCreditCount || form.jobCreditCount < 1)) {
      showError('Job credit count is required')
      return
    }

    let payload: Record<string, unknown>
    if (form.type === 'zone') {
      if (form.unlockAllZones) {
        payload = {
          name: form.name.trim(),
          description: form.description.trim(),
          type: 'zone',
          priceINR: form.priceINR,
          priceUSD: form.priceUSD,
          unlockAllZones: true,
        }
      } else {
        payload = {
          name: form.name.trim(),
          description: form.description.trim(),
          type: 'zone',
          priceINR: form.priceINR,
          priceUSD: form.priceUSD,
          zoneCount: form.zoneCount,
          unlockAllZones: false,
        }
      }
    } else {
      payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: 'jobs',
        priceINR: form.priceINR,
        priceUSD: form.priceUSD,
        jobCreditCount: form.jobCreditCount,
      }
    }

    console.log('[AdminAddons] payload:', payload)

    setIsSaving(true)
    try {
      if (editingAddon) {
        await api.patch(`/admin/addons/${editingAddon.id}`, payload)
        success('Addon updated successfully')
      } else {
        await api.post('/admin/addons', payload)
        success('Addon created successfully')
      }
      setIsModalOpen(false)
      fetchAddons()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save addon')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!addonToDelete) return
    setIsDeleting(true)
    try {
      await api.delete(`/admin/addons/${addonToDelete.id}`)
      success('Addon deleted successfully')
      setDeleteModalOpen(false)
      setAddonToDelete(null)
      fetchAddons()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete addon')
    } finally {
      setIsDeleting(false)
    }
  }

  const getAddonDescription = (addon: Addon): string => {
    if (addon.description) return addon.description
    if (addon.type === 'zone') {
      if (addon.unlockAllZones) return 'Unlock all zones'
      return `${addon.zoneCount ?? 1} zone(s)`
    }
    return `${addon.jobCreditCount ?? 1} job credits`
  }

  return (
    <PageContainer
      title="Addon Management"
      description="Manage zone and job addons available for purchase"
      actions={
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create Addon
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : addons.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No addons found</p>
            <Button onClick={openCreateModal} className="mt-4">
              Create Your First Addon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addons.map((addon) => (
            <Card key={addon.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {addon.type === 'zone' ? (
                        <Globe className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{addon.name}</h3>
                      <Badge variant="secondary" className="mt-0.5 text-xs">
                        {addon.type === 'zone' ? 'Zone Addon' : 'Job Addon'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{getAddonDescription(addon)}</p>

                <div className="space-y-1.5 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">India Price</span>
                    <span className="font-medium text-gray-900">
                      {addon.priceINR ? `₹${addon.priceINR}` : '—'}
                    </span>
                  </div>
                  {(addon.priceUSD ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">International</span>
                      <span className="font-medium text-gray-900">
                        {`$${addon.priceUSD}`}
                      </span>
                    </div>
                  )}
                  {addon.type === 'zone' && !addon.unlockAllZones && (addon.zoneCount ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Zones included</span>
                      <span className="font-medium text-gray-900">{addon.zoneCount}</span>
                    </div>
                  )}
                  {addon.type === 'zone' && addon.unlockAllZones && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Coverage</span>
                      <Badge variant="success" className="text-xs">All Zones</Badge>
                    </div>
                  )}
                  {addon.type === 'jobs' && (addon.jobCreditCount ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Job credits</span>
                      <span className="font-medium text-gray-900">{addon.jobCreditCount}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(addon)}
                    leftIcon={<Pencil className="w-3 h-3" />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddonToDelete(addon)
                      setDeleteModalOpen(true)
                    }}
                    leftIcon={<Trash2 className="w-3 h-3" />}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddon ? 'Edit Addon' : 'Create Addon'}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Addon Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., 1 Extra Zone"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as AddonType }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="zone">Zone Addon</option>
                <option value="jobs">Job Credit Addon</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              placeholder="Describe what this addon provides..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="India Price (₹)"
              type="number"
              value={form.priceINR}
              onChange={(e) =>
                setForm((p) => ({ ...p, priceINR: parseFloat(e.target.value) || 0 }))
              }
              min={0}
              step={1}
            />
            <Input
              label="International Price ($)"
              type="number"
              value={form.priceUSD}
              onChange={(e) =>
                setForm((p) => ({ ...p, priceUSD: parseFloat(e.target.value) || 0 }))
              }
              min={0}
              step={0.01}
            />
          </div>

          {form.type === 'zone' && (
            <>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={form.unlockAllZones}
                  onChange={(e) => setForm((p) => ({ ...p, unlockAllZones: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Unlock All Zones</p>
                  <p className="text-xs text-gray-500">
                    Grants access to all available zones (ignores zone count)
                  </p>
                </div>
              </label>
              {!form.unlockAllZones && (
                <Input
                  label="Zone Count"
                  type="number"
                  value={form.zoneCount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, zoneCount: parseInt(e.target.value) || 1 }))
                  }
                  min={1}
                  helperText="Number of zones this addon unlocks"
                />
              )}
            </>
          )}

          {form.type === 'jobs' && (
            <Input
              label="Job Credit Count"
              type="number"
              value={form.jobCreditCount}
              onChange={(e) =>
                setForm((p) => ({ ...p, jobCreditCount: parseInt(e.target.value) || 1 }))
              }
              min={1}
              helperText="Number of individual job unlocks this addon provides"
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {editingAddon ? 'Update Addon' : 'Create Addon'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Addon"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{addonToDelete?.name}</span>?
          </p>
          <p className="text-sm text-gray-500">
            Students who have already purchased this addon will retain their access.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>
              Delete Addon
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
