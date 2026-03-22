import { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/layout";
import Card, { CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/Modal";
import { useNotification } from "@/contexts/NotificationContext";
import {
  SubscriptionPlan,
  SubscriptionTier,
  SubscriptionCurrency,
  ZoneInfo,
} from "@/types";
import { api } from "@/services/api/client";
import { format } from "date-fns";
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
  Globe,
} from "lucide-react";

const currencySymbols: Record<SubscriptionCurrency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
};

interface PlanFormData {
  name: string;
  tier: SubscriptionTier;
  description: string;
  price: number;
  priceINR: number;
  priceUSD: number;
  currency: SubscriptionCurrency;
  discount: number;
  maxApplications: string; // required for paid plans
  features: string[];
  badge: string;
  displayOrder: number;
  resumeDownloads: string;
  videoViews: string;
  prioritySupport: boolean;
  profileBoost: boolean;
  applicationHighlight: boolean;
  isActive: boolean;
}

const defaultFormData: PlanFormData = {
  name: "",
  tier: "paid",
  description: "",
  price: 0,
  priceINR: 0,
  priceUSD: 0,
  currency: "INR",
  discount: 0,
  maxApplications: "",
  features: [],
  badge: "",
  displayOrder: 0,
  resumeDownloads: "",
  videoViews: "",
  prioritySupport: false,
  profileBoost: false,
  applicationHighlight: false,
  isActive: true,
};

export default function AdminSubscriptionPlans() {
  const { success, error: showError } = useNotification();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(
    null,
  );

  // Zone access state for create/edit modal
  const [availableZones, setAvailableZones] = useState<ZoneInfo[]>([]);
  const [zoneAllIncluded, setZoneAllIncluded] = useState(false);
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await api.get<{ plans: any[] }>("/admin/subscription-plans");
      const normalized = (data.plans || []).map((p) => ({
        ...p,
        id: p.id || p._id,
        priceINR: p.priceINR ?? p.price ?? 0,
        priceUSD: p.priceUSD ?? 0,
      }));
      setPlans(normalized);
    } catch {
      showError("Failed to load subscription plans");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filteredPlans = showActiveOnly
    ? plans.filter((p) => p.isActive)
    : plans;
  const sortedPlans = [...filteredPlans].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  
const loadZonesForModal = async (planId?: string) => {
  try {
    // Step 1: always load all zones
    const zonesRes = await api.get<{ zones: ZoneInfo[] }>("/admin/zones");
    const zones = (zonesRes.zones || []).map((z: any) => ({
      ...z,
      id: String(z.id || z._id),
    }));

    setAvailableZones(zones);

    // Step 2: if editing, load plan zones
    if (planId) {
      const data = await api.get<{
        allZonesIncluded: boolean;
        zoneIds?: string[];
        zones?: Array<{ id: string }>;
      }>(`/admin/plans/${planId}/zones`);

      setZoneAllIncluded(Boolean(data.allZonesIncluded));

      if (data.allZonesIncluded) {
        setSelectedZoneIds([]);
      } else {
        const ids =
          data.zoneIds ??
          (data.zones || []).map((z: any) => z.id || z._id);

        setSelectedZoneIds((ids || []).map((id: any) => String(id)));
      }
    } else {
      setZoneAllIncluded(false);
      setSelectedZoneIds([]);
    }
  } catch (err) {
    console.error("Zone load error:", err);
    setAvailableZones([]);
  }
};

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
    loadZonesForModal();
  };

  const openEditModal = async (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      tier: plan.tier,
      description: plan.description,
      price: plan.price,
      priceINR: plan.priceINR ?? plan.price ?? 0,
      priceUSD: plan.priceUSD ?? 0,
      currency: plan.currency,
      discount: plan.discount ?? 0,
      maxApplications: plan.tier === 'free'
        ? '2'
        : plan.maxApplications?.toString() ?? "",
      features: plan.features || [],
      badge: plan.badge || "",
      displayOrder: plan.displayOrder ?? 0,
      resumeDownloads: (plan.resumeDownloads ?? plan.resumeDownloadsPerMonth)?.toString() ?? "",
      videoViews: (plan.videoViews ?? plan.videoViewsPerMonth)?.toString() ?? "",
      prioritySupport: plan.prioritySupport ?? false,
      profileBoost: plan.profileBoost ?? false,
      applicationHighlight: plan.applicationHighlight ?? false,
      isActive: plan.isActive ?? true,
    });
    setIsModalOpen(true);
   await loadZonesForModal(plan.id);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError("Plan name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        tier: formData.tier,
        description: formData.description.trim(),
        price: formData.tier === "free" ? 0 : formData.priceINR || formData.price,
        priceINR: formData.tier === "free" ? 0 : formData.priceINR,
        priceUSD: formData.tier === "free" ? 0 : formData.priceUSD,
        currency: formData.currency,
        discount: formData.discount || 0,
        maxApplications: formData.tier === 'free'
          ? 2
          : formData.maxApplications
          ? parseInt(formData.maxApplications)
          : null,
        features: Array.isArray(formData.features)
          ? [...formData.features]
          : [],
        badge: formData.badge.trim() || null,
        displayOrder: formData.displayOrder || 0,
        resumeDownloads: formData.resumeDownloads
          ? parseInt(formData.resumeDownloads)
          : null,
        videoViews: formData.videoViews
          ? parseInt(formData.videoViews)
          : null,
        prioritySupport: Boolean(formData.prioritySupport),
        profileBoost: Boolean(formData.profileBoost),
        applicationHighlight: Boolean(formData.applicationHighlight),
        isActive: Boolean(formData.isActive),
      };

      let savedPlanId: string | undefined;
      if (editingPlan) {
        await api.patch(`/admin/subscription-plans/${editingPlan.id}`, payload);
        savedPlanId = editingPlan.id;
        success("Plan updated successfully");
      } else {
        const created = await api.post<{ id?: string; _id?: string }>("/admin/subscription-plans", payload);
        savedPlanId = created?.id ?? created?._id;
        success("Plan created successfully");
      }

      // Save zone config
      if (savedPlanId) {
        await api.patch(`/admin/plans/${savedPlanId}/zones`, {
          allZonesIncluded: zoneAllIncluded,
          zoneIds: zoneAllIncluded ? [] : selectedZoneIds,
        }).catch(() => {/* non-critical */});
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!planToDelete) return;

    try {
      await api.delete(`/admin/subscription-plans/${planToDelete.id}`);
      success("Plan deactivated successfully");
      setDeleteModalOpen(false);
      setPlanToDelete(null);
      fetchPlans();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to deactivate plan",
      );
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const getDiscountedPrice = (
    price: number | null | undefined,
    discount: number,
  ) => {
    if (price === null || price === undefined) return null;
    return discount > 0 ? price * (1 - discount / 100) : price;
  };

  const getIndianPrice = (plan: SubscriptionPlan) => {
    return plan.priceINR ?? plan.price ?? 0;
  };

  const getUSDPrice = (plan: SubscriptionPlan) => {
    return plan.priceUSD ?? 0;
  };

  const formatCurrencyAmount = (
    amount: number | null | undefined,
    currency: "INR" | "USD",
  ) => {
    if (amount === null || amount === undefined) {
      return "Not set";
    }

    return `${currencySymbols[currency]}${amount.toFixed(2)}`;
  };

  return (
    <PageContainer
      title="Subscription Plans"
      description="Manage subscription plans and pricing"
      actions={
        <Button
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
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
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">
              Show active plans only
            </span>
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
            <Card
              key={plan.id}
              className={`relative ${!plan.isActive ? "opacity-60" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-4">
                  <Badge
                    variant="primary"
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={plan.tier === "free" ? "secondary" : "primary"}
                      >
                        {plan.tier === "free" ? "Free" : "Paid"}
                      </Badge>
                      <Badge variant={plan.isActive ? "success" : "default"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    #{plan.displayOrder}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Indian Pricing
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrencyAmount(
                            getDiscountedPrice(
                              getIndianPrice(plan),
                              plan.discount,
                            ),
                            "INR",
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        International Pricing (USD)
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrencyAmount(
                            getDiscountedPrice(
                              getUSDPrice(plan),
                              plan.discount,
                            ),
                            "USD",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  {plan.discount > 0 && (
                    <span className="text-xs text-green-600">
                      {plan.discount}% off
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {plan.maxApplications === null || plan.maxApplications === undefined ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Unlimited applications</span>
                    </div>
                  ) : plan.maxApplications > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {plan.maxApplications} applications
                      </span>
                    </div>
                  ) : null}
                  {(plan.resumeDownloads ?? plan.resumeDownloadsPerMonth) &&
                    (plan.resumeDownloads ?? plan.resumeDownloadsPerMonth)! > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {plan.resumeDownloads ?? plan.resumeDownloadsPerMonth} resume downloads
                        </span>
                      </div>
                    )}
                  {(plan.videoViews ?? plan.videoViewsPerMonth) && (plan.videoViews ?? plan.videoViewsPerMonth)! > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {plan.videoViews ?? plan.videoViewsPerMonth} video views
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

                {(plan.features || []).length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Features
                    </p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Check className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                      {(plan.features || []).length > 4 && (
                        <li className="text-xs text-gray-400">
                          +{(plan.features || []).length - 4} more
                        </li>
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
                        setPlanToDelete(plan);
                        setDeleteModalOpen(true);
                      }}
                      leftIcon={<Trash2 className="w-3 h-3" />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Deactivate
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Updated {format(new Date(plan.updatedAt), "MMM d, yyyy")}
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
        title={editingPlan ? "Edit Plan" : "Create Plan"}
        size="2xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g., Pro Plan"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tier
              </label>
              <select
                value={formData.tier}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    tier: e.target.value as SubscriptionTier,
                  }))
                }
                disabled={editingPlan?.tier === "free"}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
              placeholder="Describe what this plan offers..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (INR)"
              type="number"
              value={formData.priceINR}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  priceINR: parseFloat(e.target.value) || 0,
                  price: parseFloat(e.target.value) || 0,
                }))
              }
              disabled={formData.tier === "free"}
              min={0}
              step={0.01}
              placeholder="Enter price in INR"
            />
            <Input
              label="Price (USD)"
              type="number"
              value={formData.priceUSD}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  priceUSD: parseFloat(e.target.value) || 0,
                }))
              }
              disabled={formData.tier === "free"}
              min={0}
              step={0.01}
              placeholder="Enter price in USD"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount %"
              type="number"
              value={formData.discount}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  discount: parseInt(e.target.value) || 0,
                }))
              }
              min={0}
              max={100}
            />
            <Input
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  displayOrder: parseInt(e.target.value) || 0,
                }))
              }
              min={0}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Max Applications"
              type="number"
              value={formData.tier === 'free' ? '2' : formData.maxApplications}
              onChange={(e) =>
                setFormData((p) => ({ ...p, maxApplications: e.target.value }))
              }
              disabled={formData.tier === 'free'}
              placeholder={formData.tier === 'free' ? '2' : 'Empty = unlimited'}
              helperText={
                formData.tier === 'free'
                  ? 'Fixed at 2 for free plan'
                  : 'Leave empty for unlimited'
              }
              min={1}
            />
            <Input
              label="Resume Downloads"
              type="number"
              value={formData.resumeDownloads}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  resumeDownloads: e.target.value,
                }))
              }
              placeholder="Empty = unlimited"
              min={0}
            />
            <Input
              label="Video Views"
              type="number"
              value={formData.videoViews}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  videoViews: e.target.value,
                }))
              }
              placeholder="Empty = unlimited"
              min={0}
            />
          </div>

          <Input
            label="Badge (optional)"
            value={formData.badge}
            onChange={(e) =>
              setFormData((p) => ({ ...p, badge: e.target.value }))
            }
            placeholder='e.g., "Popular", "Best Value"'
          />

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
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
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addFeature())
                }
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                Add
              </Button>
            </div>
          </div>

          {/* Zone Access */}
        
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-gray-900">Zone Access</p>
              </div>
              <div className="space-y-2 mb-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={zoneAllIncluded}
                    onChange={() => setZoneAllIncluded(true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">All Zones Included</p>
                    <p className="text-xs text-gray-500">Students can apply to jobs from any zone</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!zoneAllIncluded}
                    onChange={() => setZoneAllIncluded(false)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Specific Zones</p>
                    <p className="text-xs text-gray-500">Select which zones this plan covers</p>
                  </div>
                </label>
              </div>
              {!zoneAllIncluded && (
                <div className="ml-7 space-y-2">
                  {availableZones.map((zone) => (
                    <label key={zone.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedZoneIds.includes(String(zone.id))}
                        onChange={(e) => {
                          setSelectedZoneIds((prev) =>
                            e.target.checked
                              ? [...prev, zone.id]
                              : prev.filter((id) => id !== zone.id),
                          );
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{zone.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.prioritySupport}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    prioritySupport: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Priority Support
                </p>
                <p className="text-xs text-gray-500">Faster response times</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.profileBoost}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, profileBoost: e.target.checked }))
                }
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Profile Boost
                </p>
                <p className="text-xs text-gray-500">Higher visibility</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.applicationHighlight}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    applicationHighlight: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Application Highlight
                </p>
                <p className="text-xs text-gray-500">Stand out to employers</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, isActive: e.target.checked }))
                }
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-500">Available to students</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {editingPlan ? "Update Plan" : "Create Plan"}
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
            Are you sure you want to deactivate{" "}
            <span className="font-semibold">{planToDelete?.name}</span>?
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
  );
}