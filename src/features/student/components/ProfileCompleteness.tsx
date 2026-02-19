import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface ProfileCompletenessProps {
  percentage?: number | null
  missingItems?: string[] | null
  isLoading?: boolean
  title?: string
  description?: string
  actionSlot?: ReactNode
  healthInfo?: {
    label: string
    colorClass: string
  }
}

const clampPercentage = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }
  return Math.min(100, Math.max(0, Math.round(value)))
}

export default function ProfileCompleteness({
  percentage,
  missingItems,
  isLoading,
  title = 'Profile Completeness',
  description = 'Complete these items to help companies understand you better.',
  actionSlot,
  healthInfo,
}: ProfileCompletenessProps) {
  const progress = clampPercentage(percentage)
  const isComplete = progress >= 100
  const hasMissingItems = (missingItems?.length ?? 0) > 0

  return (
    <div className="glass rounded-2xl p-6 border border-glow-cyan/20">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-semibold text-foreground">{progress}%</p>
        </div>
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-glow-cyan animate-spin" />
        ) : (
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isComplete
                ? 'bg-glow-teal/15 text-glow-teal border-glow-teal/30'
                : 'bg-glow-purple/15 text-glow-purple border-glow-purple/30'
            }`}
          >
            {isComplete ? 'Complete' : 'In progress'}
          </div>
        )}
      </div>

      <div className="w-full h-3 rounded-full bg-ocean-dark/30 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-glow-purple via-glow-cyan to-glow-teal transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {healthInfo && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile Health</p>
          <p className={`text-lg font-display font-semibold ${healthInfo.colorClass}`}>{healthInfo.label}</p>
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {!hasMissingItems ? (
        <div className="flex items-center gap-2 text-sm text-glow-teal bg-glow-teal/10 border border-glow-teal/30 rounded-xl px-3 py-2">
          <CheckCircle className="w-4 h-4" />
          Everything looks great — your profile is ready!
        </div>
      ) : (
        <div className="space-y-3">
          {hasMissingItems && <p className="text-sm font-medium text-foreground">Next up</p>}
          <ul className="space-y-2">
            {missingItems?.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-ocean-dark/40 rounded-xl px-3 py-2 border border-border/50"
              >
                <AlertCircle className="w-4 h-4 text-coral" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionSlot && <div className="mt-4">{actionSlot}</div>}
    </div>
  )
}
