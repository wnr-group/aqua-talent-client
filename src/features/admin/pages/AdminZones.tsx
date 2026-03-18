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
import { Globe, Plus, Pencil, Trash2, X } from 'lucide-react'

interface AdminCountry {
  id: string
  name: string
  code: string
}

interface AdminZone {
  id: string
  name: string
  description: string
  countries: AdminCountry[]
}

interface ZoneFormData {
  name: string
  description: string
}

const defaultZoneForm: ZoneFormData = { name: '', description: '' }

export default function AdminZones() {
  const { success, error: showError } = useNotification()
  const [zones, setZones] = useState<AdminZone[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Zone CRUD modal
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<AdminZone | null>(null)
  const [zoneForm, setZoneForm] = useState<ZoneFormData>(defaultZoneForm)
  const [isSaving, setIsSaving] = useState(false)

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [zoneToDelete, setZoneToDelete] = useState<AdminZone | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Inline add-country state
  const [addCountryZoneId, setAddCountryZoneId] = useState<string | null>(null)
  const [newCountryForm, setNewCountryForm] = useState({ name: '', code: '' })
  const [isAddingCountry, setIsAddingCountry] = useState(false)

  const fetchZones = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.get<{ zones: AdminZone[] }>('/admin/zones')
      setZones(data.zones)
    } catch {
      showError('Failed to load zones')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  const openCreateModal = () => {
    setEditingZone(null)
    setZoneForm(defaultZoneForm)
    setIsZoneModalOpen(true)
  }

  const openEditModal = (zone: AdminZone) => {
    setEditingZone(zone)
    setZoneForm({ name: zone.name, description: zone.description })
    setIsZoneModalOpen(true)
  }

  const handleSaveZone = async () => {
    if (!zoneForm.name.trim()) {
      showError('Zone name is required')
      return
    }
    setIsSaving(true)
    try {
      if (editingZone) {
        await api.patch(`/admin/zones/${editingZone.id}`, zoneForm)
        success('Zone updated successfully')
      } else {
        await api.post('/admin/zones', zoneForm)
        success('Zone created successfully')
      }
      setIsZoneModalOpen(false)
      fetchZones()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save zone')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteZone = async () => {
    if (!zoneToDelete) return
    setIsDeleting(true)
    try {
      await api.delete(`/admin/zones/${zoneToDelete.id}`)
      success('Zone deleted successfully')
      setDeleteModalOpen(false)
      setZoneToDelete(null)
      fetchZones()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete zone')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddCountry = async (zoneId: string) => {
    if (!newCountryForm.name.trim() || !newCountryForm.code.trim()) {
      showError('Country name and code are required')
      return
    }
    setIsAddingCountry(true)
    try {
      await api.post(`/admin/zones/${zoneId}/countries`, newCountryForm)
      success('Country added to zone')
      setAddCountryZoneId(null)
      setNewCountryForm({ name: '', code: '' })
      fetchZones()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add country')
    } finally {
      setIsAddingCountry(false)
    }
  }

  const handleRemoveCountry = async (zoneId: string, countryId: string) => {
    try {
      await api.delete(`/admin/zones/${zoneId}/countries/${countryId}`)
      success('Country removed from zone')
      fetchZones()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to remove country')
    }
  }

  return (
    <PageContainer
      title="Zone Management"
      description="Manage geographic zones and assign countries"
      actions={
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create Zone
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : zones.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No zones found</p>
            <Button onClick={openCreateModal} className="mt-4">
              Create Your First Zone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <CardContent className="p-6">
                {/* Zone header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                      {zone.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{zone.description}</p>
                      )}
                      <Badge variant="secondary" className="mt-1.5">
                        {zone.countries.length}{' '}
                        {zone.countries.length === 1 ? 'country' : 'countries'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(zone)}
                      leftIcon={<Pencil className="w-3 h-3" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setZoneToDelete(zone)
                        setDeleteModalOpen(true)
                      }}
                      leftIcon={<Trash2 className="w-3 h-3" />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Countries */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Countries</p>
                    {addCountryZoneId !== zone.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAddCountryZoneId(zone.id)
                          setNewCountryForm({ name: '', code: '' })
                        }}
                        leftIcon={<Plus className="w-3 h-3" />}
                      >
                        Add Country
                      </Button>
                    )}
                  </div>

                  {zone.countries.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No countries assigned yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {zone.countries.map((country) => (
                        <span
                          key={country.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700"
                        >
                          <span className="font-mono text-xs text-gray-400">{country.code}</span>
                          {country.name}
                          <button
                            onClick={() => handleRemoveCountry(zone.id, country.id)}
                            className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove country"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Inline add country form */}
                  {addCountryZoneId === zone.id && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Add Country to Zone</p>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            label="Country Name"
                            value={newCountryForm.name}
                            onChange={(e) =>
                              setNewCountryForm((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder="e.g., Brazil"
                          />
                        </div>
                        <div className="w-28">
                          <Input
                            label="ISO Code"
                            value={newCountryForm.code}
                            onChange={(e) =>
                              setNewCountryForm((p) => ({
                                ...p,
                                code: e.target.value.toUpperCase().slice(0, 3),
                              }))
                            }
                            placeholder="BR"
                          />
                        </div>
                        <Button
                          onClick={() => handleAddCountry(zone.id)}
                          isLoading={isAddingCountry}
                        >
                          Add
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAddCountryZoneId(null)
                            setNewCountryForm({ name: '', code: '' })
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Zone Modal */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        title={editingZone ? 'Edit Zone' : 'Create Zone'}
      >
        <div className="space-y-4">
          <Input
            label="Zone Name"
            value={zoneForm.name}
            onChange={(e) => setZoneForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g., South Asia"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={zoneForm.description}
              onChange={(e) => setZoneForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              placeholder="Brief description of this geographic zone..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsZoneModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveZone} isLoading={isSaving}>
              {editingZone ? 'Update Zone' : 'Create Zone'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Zone"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{zoneToDelete?.name}</span>?
          </p>
          <p className="text-sm text-gray-500">
            Deletion will fail if any jobs are currently assigned to countries in this zone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteZone} isLoading={isDeleting}>
              Delete Zone
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
