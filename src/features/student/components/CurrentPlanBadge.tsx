import Badge from '@/components/common/Badge'

interface CurrentPlanBadgeProps {
  isCurrent: boolean
}

export default function CurrentPlanBadge({ isCurrent }: CurrentPlanBadgeProps) {
  if (!isCurrent) {
    return null
  }

  return (
    <Badge variant="primary" className="bg-blue-100 text-blue-700 border border-blue-200">
      Current Plan
    </Badge>
  )
}
