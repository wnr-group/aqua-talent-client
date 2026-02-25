import { Check } from 'lucide-react'

interface ApplicationStatusTimelineProps {
  status: string
}

const STEPS = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Offer',
  'Hired',
] as const

function getCurrentStep(status: string): number {
  const normalized = String(status).toUpperCase()

  switch (normalized) {
    case 'PENDING':
      return 2 // Under Review
    case 'REVIEWED':
      return 3 // Shortlisted
    case 'INTERVIEW_SCHEDULED':
      return 4
    case 'OFFER_EXTENDED':
      return 5
    case 'HIRED':
      return 6
    default:
      return 1
  }
}

export default function ApplicationStatusTimeline({ status }: ApplicationStatusTimelineProps) {
  const normalized = String(status).toUpperCase()

  if (normalized === 'WITHDRAWN' || normalized === 'REJECTED' || normalized === 'WITHDRAWAL_REQUESTED') {
    return null
  }

  const currentStep = getCurrentStep(status)

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted =
            stepNumber < currentStep ||
            (currentStep === STEPS.length && stepNumber === currentStep)
          const isCurrent = stepNumber === currentStep && !isCompleted

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-semibold ${
                    isCompleted || isCurrent
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted || isCurrent ? <Check className="w-3.5 h-3.5" /> : stepNumber}
                </div>
                <span
                  className={`text-[11px] text-center leading-tight ${
                    isCompleted || isCurrent ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-2 mb-5 ${
                    stepNumber < currentStep ? 'bg-teal-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
