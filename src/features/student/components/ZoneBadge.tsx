import { Globe, Lock } from 'lucide-react'

interface ZoneBadgeProps {
  zoneName?: string | null
  zoneId?: string | null
  isLocked?: boolean
  size?: 'sm' | 'md'
  showIcon?: boolean
}

// Zone color mapping for visual consistency
const ZONE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'zone-1': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'zone-2': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'zone-3': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'zone-4': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'zone-apac': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'zone-na': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'zone-eu': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  default: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
}

const LOCKED_COLORS = { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }

export default function ZoneBadge({
  zoneName,
  zoneId,
  isLocked = false,
  size = 'sm',
  showIcon = true,
}: ZoneBadgeProps) {
  if (!zoneName && !zoneId) return null

  const colors = isLocked ? LOCKED_COLORS : (zoneId ? ZONE_COLORS[zoneId] : undefined) ?? ZONE_COLORS.default

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${colors?.bg ?? ''} ${colors?.text ?? ''} ${colors?.border ?? ''} ${sizeClasses}`}
    >
      {showIcon && (
        isLocked ? (
          <Lock className={iconSize} />
        ) : (
          <Globe className={iconSize} />
        )
      )}
      {zoneName || zoneId}
      {isLocked && <span className="ml-0.5">Locked</span>}
    </span>
  )
}
