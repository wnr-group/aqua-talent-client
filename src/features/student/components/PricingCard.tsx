import { ArrowRight } from 'lucide-react'
import Card, { CardContent, CardDescription, CardFooter, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import CurrentPlanBadge from './CurrentPlanBadge'
import FeatureList from './FeatureList'

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  isCurrentPlan: boolean
  ctaLabel: string
  onCtaClick?: () => void
  isProcessing?: boolean
  badge?: string | null
  discount?: number
  trialDays?: number
  originalPrice?: string
  billingCycle?: 'monthly' | 'quarterly' | 'yearly' | 'one-time'
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  isCurrentPlan,
  ctaLabel,
  onCtaClick,
  isProcessing = false,
  badge,
  discount,
  trialDays,
  originalPrice,
  billingCycle,
}: PricingCardProps) {
  const isActionable = !isCurrentPlan && !!onCtaClick
  const hasDiscount = discount && discount > 0
  const isOneTime = billingCycle === 'one-time'

  return (
    <Card
      className={`relative h-full overflow-hidden rounded-2xl transition-all duration-300 ${
        isCurrentPlan
          ? 'border-teal-500 shadow-lg'
          : badge
          ? 'border-teal-400 shadow-md'
          : 'hover:border-teal-300 hover:shadow-md'
      }`}
      padding="lg"
    >
      {/* Badge ribbon */}
      {badge && (
        <div className="absolute top-4 right-4">
          <Badge variant="primary" className="bg-teal-600 text-white">
            {badge}
          </Badge>
        </div>
      )}

      <CardContent className="flex h-full flex-col">
        <div className="mb-4 flex items-center gap-3">
          <CardTitle className="text-xl font-display text-gray-900">{name}</CardTitle>
          <CurrentPlanBadge isCurrent={isCurrentPlan} />
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-display font-bold text-gray-900">{price}</p>
          {hasDiscount && originalPrice && (
            <span className="text-lg text-gray-400 line-through">{originalPrice}</span>
          )}
        </div>

        {hasDiscount && (
          <span className="mt-1 text-sm font-medium text-teal-600">
            Save {discount}%
          </span>
        )}

        {isOneTime && (
          <span className="mt-1 text-sm font-medium text-purple-600">
            One-time payment • Lifetime access
          </span>
        )}

        <CardDescription className="text-gray-500 mt-1">{description}</CardDescription>

        {trialDays && trialDays > 0 && !isOneTime && (
          <p className="mt-2 text-sm font-medium text-teal-600">
            {trialDays}-day free trial
          </p>
        )}

        <div className="mt-6 flex-1">
          <FeatureList features={features} />
        </div>

        <CardFooter className="mt-6 border-gray-200 px-0 pb-0 pt-4">
          <Button
            variant={isActionable ? 'primary' : 'secondary'}
            size="md"
            className="w-full"
            rightIcon={isActionable ? <ArrowRight className="w-4 h-4" /> : undefined}
            onClick={onCtaClick}
            disabled={!isActionable || isProcessing}
            isLoading={isProcessing}
          >
            {isCurrentPlan ? 'Current Plan' : ctaLabel}
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  )
}
