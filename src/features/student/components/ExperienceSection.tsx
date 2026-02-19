import { Control, FieldErrors, UseFormRegister, useFieldArray } from 'react-hook-form'
import { Briefcase, CalendarDays, Plus, Trash2 } from 'lucide-react'
import type { StudentProfileFormValues } from '@/features/student/types'

interface ExperienceSectionProps {
  control: Control<StudentProfileFormValues>
  register: UseFormRegister<StudentProfileFormValues>
  errors: FieldErrors<StudentProfileFormValues>
}

const inputClasses = `
  w-full px-4 py-3 rounded-xl bg-ocean-dark/50 border transition-all text-foreground
  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-glow-cyan/50 focus:border-glow-cyan
  border-border hover:border-glow-cyan/30
`

const EMPTY_EXPERIENCE = {
  company: '',
  title: '',
  startDate: '',
  endDate: '',
  description: '',
}

export default function ExperienceSection({ control, register, errors }: ExperienceSectionProps) {
  const { fields, append, remove } = useFieldArray({ name: 'experience', control })

  const renderError = (index: number, key: keyof (typeof EMPTY_EXPERIENCE)) => {
    const fieldErrors = errors.experience?.[index]
    const message = fieldErrors?.[key]?.message as string | undefined
    return message ? <p className="text-sm text-coral">{message}</p> : null
  }

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-glow-teal/15 border border-glow-teal/30">
            <Briefcase className="w-5 h-5 text-glow-teal" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">Experience</h3>
            <p className="text-sm text-muted-foreground">Showcase your impactful roles.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => append({ ...EMPTY_EXPERIENCE })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-glow-teal/30 text-glow-teal hover:bg-glow-teal/10"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground bg-ocean-dark/20">
          No experience added yet. Click "Add Experience" to highlight your background.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-border/60 bg-ocean-dark/40 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">Experience #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coral"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                  <input
                    className={inputClasses}
                    {...register(`experience.${index}.company` as const)}
                    placeholder="Aqua Talent"
                  />
                  {renderError(index, 'company')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                  <input
                    className={inputClasses}
                    {...register(`experience.${index}.title` as const)}
                    placeholder="Product Designer"
                  />
                  {renderError(index, 'title')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Start Date
                  </label>
                  <input
                    type="date"
                    className={inputClasses}
                    {...register(`experience.${index}.startDate` as const)}
                  />
                  {renderError(index, 'startDate')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> End Date
                  </label>
                  <input
                    type="date"
                    className={inputClasses}
                    {...register(`experience.${index}.endDate` as const)}
                  />
                  {renderError(index, 'endDate')}
                  <p className="text-xs text-muted-foreground mt-1">Leave blank if currently working.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Impact</label>
                <textarea
                  rows={3}
                  className={`${inputClasses} resize-none`}
                  {...register(`experience.${index}.description` as const)}
                  placeholder="Shipped onboarding redesign improving activation by 22%."
                />
                {renderError(index, 'description')}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
