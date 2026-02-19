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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-display font-semibold text-gray-900">{progress}%</p>
        </div>
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
        ) : (
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isComplete
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-purple-100 text-purple-700 border-purple-200'
            }`}
          >
            {isComplete ? 'Complete' : 'In progress'}
          </div>
        )}
      </div>

      <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-teal-500 to-teal-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {healthInfo && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profile Health</p>
          <p className={`text-lg font-display font-semibold ${healthInfo.colorClass}`}>{healthInfo.label}</p>
        </div>
      )}
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      {!hasMissingItems ? (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <CheckCircle className="w-4 h-4" />
          Everything looks great — your profile is ready!
        </div>
      ) : (
        <div className="space-y-3">
          {hasMissingItems && <p className="text-sm font-medium text-gray-900">Next up</p>}
          <ul className="space-y-2">
            {missingItems?.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200"
              >
                <AlertCircle className="w-4 h-4 text-red-500" />
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
