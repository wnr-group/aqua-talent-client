import { ArrowRight } from 'lucide-react'
import Card, { CardContent, CardDescription, CardFooter, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
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
}: PricingCardProps) {
  const isActionable = !isCurrentPlan && !!onCtaClick

  return (
    <Card
      className={`relative h-full overflow-hidden rounded-2xl transition-all duration-300 ${
        isCurrentPlan
          ? 'border-teal-500 shadow-lg'
          : 'hover:border-teal-300 hover:shadow-md'
      }`}
      padding="lg"
    >
      <CardContent className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-display text-gray-900">{name}</CardTitle>
          <CurrentPlanBadge isCurrent={isCurrentPlan} />
        </div>

        <p className="text-3xl font-display font-bold text-gray-900">{price}</p>
        <CardDescription className="text-gray-500">{description}</CardDescription>

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
