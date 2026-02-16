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
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  isCurrentPlan,
  ctaLabel,
  onCtaClick,
}: PricingCardProps) {
  const isActionable = !isCurrentPlan && !!onCtaClick

  return (
    <Card
      className={`h-full border ${
        isCurrentPlan ? 'border-glow-cyan bg-ocean-surface shadow-lg shadow-glow-cyan/10' : 'border-border bg-ocean-dark/50'
      }`}
      padding="lg"
    >
      <CardContent className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-display text-foreground">{name}</CardTitle>
          <CurrentPlanBadge isCurrent={isCurrentPlan} />
        </div>

        <p className="text-3xl font-display font-bold text-foreground">{price}</p>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>

        <div className="mt-6 flex-1">
          <FeatureList features={features} />
        </div>

        <CardFooter className="mt-6 border-border px-0 pb-0 pt-4">
          <Button
            variant={isActionable ? 'primary' : 'secondary'}
            size="md"
            className="w-full"
            rightIcon={isActionable ? <ArrowRight className="w-4 h-4" /> : undefined}
            onClick={onCtaClick}
            disabled={!isActionable}
          >
            {isCurrentPlan ? 'Current Plan' : ctaLabel}
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  )
}

