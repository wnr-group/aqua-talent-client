import Badge from '@/components/common/Badge'

interface CurrentPlanBadgeProps {
  isCurrent: boolean
}

export default function CurrentPlanBadge({ isCurrent }: CurrentPlanBadgeProps) {
  if (!isCurrent) {
    return null
  }

  return (
    <Badge variant="primary" className="bg-teal-100 text-teal-700 border border-teal-200">
      Current Plan
    </Badge>
  )
}
