import Badge from '@/components/common/Badge'

interface CurrentPlanBadgeProps {
  isCurrent: boolean
}

export default function CurrentPlanBadge({ isCurrent }: CurrentPlanBadgeProps) {
  if (!isCurrent) {
    return null
  }

  return (
    <Badge variant="primary" className="bg-glow-cyan/20 text-glow-cyan border border-glow-cyan/30">
      Current Plan
    </Badge>
  )
}
