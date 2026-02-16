import { Check } from 'lucide-react'

interface FeatureListProps {
  features: string[]
}

export default function FeatureList({ features }: FeatureListProps) {
  return (
    <ul className="space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-glow-teal/20 text-glow-teal">
            <Check className="w-3.5 h-3.5" />
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}
