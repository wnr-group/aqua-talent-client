import { Check } from 'lucide-react'

interface FeatureListProps {
  features: string[]
}

export default function FeatureList({ features }: FeatureListProps) {
  return (
    <ul className="space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-gray-900">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-600">
            <Check className="w-3.5 h-3.5" />
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}
