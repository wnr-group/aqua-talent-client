import { useEffect, useState, useCallback } from 'react'
import { PageContainer } from '@/components/layout'
import Card, { CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { SubscriptionPlan, SubscriptionTier, SubscriptionCurrency, BillingCycle } from '@/types'
import { api } from '@/services/api/client'
import { format } from 'date-fns'
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Crown,
  Sparkles,
  Users,
  FileText,
  Video,
  Zap,
  Star,
} from 'lucide-react'

const CURRENCIES: SubscriptionCurrency[] = ['INR']
const BILLING_CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'yearly', 'one-time']

const currencySymbols: Record<SubscriptionCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
}

interface PlanFormData {
  name: string
  tier: SubscriptionTier
  description: string
  price: number
  currency: SubscriptionCurrency
  billingCycle: BillingCycle
  trialDays: number
  discount: number
  maxApplications: string // empty = unlimited
  features: string[]
  badge: string
  displayOrder: number
  resumeDownloadsPerMonth: string
  videoViewsPerMonth: string
  prioritySupport: boolean
  profileBoost: boolean
  applicationHighlight: boolean
  isActive: boolean
}

const defaultFormData: PlanFormData = {
  name: '',
  tier: 'paid',
  description: '',
  price: 0,
  currency: 'INR',
  billingCycle: 'monthly',
  trialDays: 0,
  discount: 0,
  maxApplications: '',
  features: [],
  badge: '',
  displayOrder: 0,
  resumeDownloadsPerMonth: '',
  videoViewsPerMonth: '',
  prioritySupport: false,
  profileBoost: false,
  applicationHighlight: false,
  isActive: true,
}

export default function AdminSubscriptionPlans() {
  const { success, error: showError } = useNotification()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState<PlanFormData>(defaultFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [newFeature, setNewFeature] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await api.get<{ plans: any[] }>('/admin/subscription-plans')
      const normalized = (data.plans || []).map((p) => ({
        ...p,
        id: p.id || p._id,
      }))
      setPlans(normalized)
    } catch {
      showError('Failed to load subscription plans')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const filteredPlans = showActiveOnly ? plans.filter((p) => p.isActive) : plans
  const sortedPlans = [...filteredPlans].sort((a, b) => a.displayOrder - b.displayOrder)

  const openCreateModal = () => {
    setEditingPlan(null)
    setFormData(defaultFormData)
    setIsModalOpen(true)
  }

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      tier: plan.tier,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      trialDays: plan.trialDays ?? 0,
      discount: plan.discount ?? 0,
      maxApplications: plan.maxApplications?.toString() ?? '',
      features: plan.features || [],
      badge: plan.badge || '',
      displayOrder: plan.displayOrder ?? 0,
      resumeDownloadsPerMonth: plan.resumeDownloadsPerMonth?.toString() ?? '',
      videoViewsPerMonth: plan.videoViewsPerMonth?.toString() ?? '',
      prioritySupport: plan.prioritySupport ?? false,
      profileBoost: plan.profileBoost ?? false,
      applicationHighlight: plan.applicationHighlight ?? false,
      isActive: plan.isActive ?? true,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Plan name is required')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        tier: formData.tier,
        description: formData.description.trim(),
        price: formData.tier === 'free' ? 0 : formData.price,
        currency: formData.currency,
        billingCycle: formData.billingCycle,
        trialDays: formData.trialDays || 0,
        discount: formData.discount || 0,
        maxApplications: formData.maxApplications ? parseInt(formData.maxApplications) : null,
        features: Array.isArray(formData.features) ? [...formData.features] : [],
        badge: formData.badge.trim() || null,
        displayOrder: formData.displayOrder || 0,
        resumeDownloadsPerMonth: formData.resumeDownloadsPerMonth
          ? parseInt(formData.resumeDownloadsPerMonth)
          : null,
        videoViewsPerMonth: formData.videoViewsPerMonth
          ? parseInt(formData.videoViewsPerMonth)
          : null,
        prioritySupport: Boolean(formData.prioritySupport),
        profileBoost: Boolean(formData.profileBoost),
        applicationHighlight: Boolean(formData.applicationHighlight),
        isActive: Boolean(formData.isActive),
      }

      if (editingPlan) {
        await api.patch(`/admin/subscription-plans/${editingPlan.id}`, payload)
        success('Plan updated successfully')
      } else {
        await api.post('/admin/subscription-plans', payload)
        success('Plan created successfully')
      }

      setIsModalOpen(false)
      fetchPlans()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!planToDelete) return

    try {
      await api.delete(`/admin/subscription-plans/${planToDelete.id}`)
      success('Plan deactivated successfully')
      setDeleteModalOpen(false)
      setPlanToDelete(null)
      fetchPlans()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to deactivate plan')
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const formatPrice = (plan: SubscriptionPlan) => {
    const symbol = currencySymbols[plan.currency]
    const price = plan.discount > 0 ? plan.price * (1 - plan.discount / 100) : plan.price
    return `${symbol}${price.toFixed(2)}`
  }

  return (
    <PageContainer
      title="Subscription Plans"
      description="Manage subscription plans and pricing"
      actions={
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create Plan
        </Button>
      }
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show active plans only</span>
          </label>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : sortedPlans.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Crown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No subscription plans found</p>
            <Button onClick={openCreateModal} className="mt-4">
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${!plan.isActive ? 'opacity-60' : ''}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-4">
                  <Badge variant="primary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={plan.tier === 'free' ? 'secondary' : 'primary'}>
                        {plan.tier === 'free' ? 'Free' : 'Paid'}
                      </Badge>
                      <Badge variant={plan.isActive ? 'success' : 'default'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">#{plan.displayOrder}</span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    {plan.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        {currencySymbols[plan.currency]}{plan.price}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(plan)}</span>
                    <span className="text-sm text-gray-500">/{plan.billingCycle}</span>
                  </div>
                  {plan.discount > 0 && (
                    <span className="text-xs text-green-600">{plan.discount}% off</span>
                  )}
                  {plan.trialDays > 0 && (
                    <p className="text-xs text-blue-600 mt-1">{plan.trialDays}-day free trial</p>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {plan.maxApplications ? `${plan.maxApplications} applications` : 'Unlimited applications'}
                    </span>
                  </div>
                  {plan.resumeDownloadsPerMonth !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {plan.resumeDownloadsPerMonth || 'Unlimited'} resume downloads
                      </span>
                    </div>
                  )}
                  {plan.videoViewsPerMonth !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {plan.videoViewsPerMonth || 'Unlimited'} video views
                      </span>
                    </div>
                  )}
                  {plan.prioritySupport && (
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-600">Priority support</span>
                    </div>
                  )}
                  {plan.profileBoost && (
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-600">Profile boost</span>
                    </div>
                  )}
                </div>

                {plan.features.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Features</p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-xs text-gray-400">+{plan.features.length - 4} more</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(plan)}
                    leftIcon={<Pencil className="w-3 h-3" />}
                  >
                    Edit
                  </Button>
                  {plan.isActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setPlanToDelete(plan)
                        setDeleteModalOpen(true)
                      }}
                      leftIcon={<Trash2 className="w-3 h-3" />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Deactivate
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Updated {format(new Date(plan.updatedAt), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Create Plan'}
        size="2xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Pro Plan"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData((p) => ({ ...p, tier: e.target.value as SubscriptionTier }))}
                disabled={editingPlan?.tier === 'free'}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              placeholder="Describe what this plan offers..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
              disabled={formData.tier === 'free'}
              min={0}
              step={0.01}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value as SubscriptionCurrency }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData((p) => ({ ...p, billingCycle: e.target.value as BillingCycle }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {BILLING_CYCLES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Trial Days"
              type="number"
              value={formData.trialDays}
              onChange={(e) => setFormData((p) => ({ ...p, trialDays: parseInt(e.target.value) || 0 }))}
              min={0}
            />
            <Input
              label="Discount %"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData((p) => ({ ...p, discount: parseInt(e.target.value) || 0 }))}
              min={0}
              max={100}
            />
            <Input
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData((p) => ({ ...p, displayOrder: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Max Applications"
              type="number"
              value={formData.maxApplications}
              onChange={(e) => setFormData((p) => ({ ...p, maxApplications: e.target.value }))}
              placeholder="Empty = unlimited"
              min={0}
            />
            <Input
              label="Resume Downloads/Month"
              type="number"
              value={formData.resumeDownloadsPerMonth}
              onChange={(e) => setFormData((p) => ({ ...p, resumeDownloadsPerMonth: e.target.value }))}
              placeholder="Empty = unlimited"
              min={0}
            />
            <Input
              label="Video Views/Month"
              type="number"
              value={formData.videoViewsPerMonth}
              onChange={(e) => setFormData((p) => ({ ...p, videoViewsPerMonth: e.target.value }))}
              placeholder="Empty = unlimited"
              min={0}
            />
          </div>

          <Input
            label="Badge (optional)"
            value={formData.badge}
            onChange={(e) => setFormData((p) => ({ ...p, badge: e.target.value }))}
            placeholder='e.g., "Popular", "Best Value"'
          />

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            <div className="space-y-2 mb-2">
              {formData.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    {feature}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                Add
              </Button>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.prioritySupport}
                onChange={(e) => setFormData((p) => ({ ...p, prioritySupport: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Priority Support</p>
                <p className="text-xs text-gray-500">Faster response times</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.profileBoost}
                onChange={(e) => setFormData((p) => ({ ...p, profileBoost: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Profile Boost</p>
                <p className="text-xs text-gray-500">Higher visibility</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.applicationHighlight}
                onChange={(e) => setFormData((p) => ({ ...p, applicationHighlight: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Application Highlight</p>
                <p className="text-xs text-gray-500">Stand out to employers</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-500">Available to students</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Deactivate Plan"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to deactivate <span className="font-semibold">{planToDelete?.name}</span>?
          </p>
          <p className="text-sm text-gray-500">
            Deactivated plans will no longer be available for new subscriptions.
            Existing subscribers will not be affected.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivate}>
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
