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
      className={`relative h-full overflow-hidden rounded-2xl border bg-transparent transition-all duration-300 ${
        isCurrentPlan
          ? 'border-glow-cyan/60 shadow-[0_25px_60px_rgba(34,211,238,0.25)]'
          : 'border-border/70 hover:border-glow-cyan/40 hover:shadow-[0_25px_60px_rgba(34,211,238,0.15)]'
      }`}
      padding="lg"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0b1f3f] via-[#09152a] to-[#030b18]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className={`absolute -right-20 -top-12 h-48 w-48 rounded-full blur-[110px] ${
          isCurrentPlan ? 'bg-glow-cyan/40' : 'bg-glow-cyan/20'
        }`}
        aria-hidden="true"
      />
      <CardContent className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-display text-foreground">{name}</CardTitle>
          <CurrentPlanBadge isCurrent={isCurrentPlan} />
        </div>

        <p className="text-3xl font-display font-bold text-foreground">{price}</p>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>

        <div className="mt-6 flex-1">
          <FeatureList features={features} />
        </div>

        <CardFooter className="mt-6 border-white/10 px-0 pb-0 pt-4">
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

